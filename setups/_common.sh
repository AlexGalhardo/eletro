#!/usr/bin/env bash
# Shared functions of the four setup scripts. Not meant to be run directly: the entry script sets
# PLATFORM (unix or windows), sources this file and calls setup_local or setup_docker.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NODE_MAJOR=24
MIN_BUN=1.4.0
COMPOSE_FILE=infra/docker-compose.yml
# Port the app listens on inside the container (infra/Dockerfile).
CONTAINER_PORT=80
SCRIPT_NAME="setups/$(basename "$0")"

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[warn]\033[0m %s\n' "$*" >&2; }
die() {
	printf '\033[31m[error]\033[0m %s\n' "$*" >&2
	exit 1
}

# version_ge 1.4.2 1.4.0 -> true when the first version is at least the second.
version_ge() { [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]; }

# /dev/urandom exists on Linux, macOS and Git Bash, so the Docker setups need neither Node nor openssl.
random_hex() { od -An -N32 -tx1 /dev/urandom | tr -d ' \n'; }

check_platform() {
	local kernel
	kernel="$(uname -s)"
	case "$PLATFORM:$kernel" in
		windows:MINGW* | windows:MSYS* | windows:CYGWIN*) ;;
		windows:*) die "$SCRIPT_NAME is for Git Bash on Windows. Here, run ${SCRIPT_NAME/windows/unix}." ;;
		unix:MINGW* | unix:MSYS* | unix:CYGWIN*)
			die "$SCRIPT_NAME is for macOS, Linux and WSL. In Git Bash, run ${SCRIPT_NAME/unix/windows}."
			;;
	esac
}

START=1
parse_args() {
	[ "${SETUP_NO_START:-0}" = 1 ] && START=0
	local arg
	for arg in "$@"; do
		case "$arg" in
			--no-start) START=0 ;;
			-h | --help)
				echo "Usage: bash $SCRIPT_NAME [--no-start]"
				echo "  --no-start         prepare everything but do not start the server (same as SETUP_NO_START=1)"
				echo "  PORT=<port>        use this port and fail when it is busy; without it, the next free port is picked"
				exit 0
				;;
			*) die "Unknown option: $arg (try --help)" ;;
		esac
	done
}

# --- .env -----------------------------------------------------------------------

env_get() {
	local value
	value="$(grep -E "^$1=" .env | tail -n1 | cut -d= -f2- | tr -d '\r' || true)"
	value="${value%\"}"
	printf '%s' "${value#\"}"
}

# Sets KEY only when it is missing or empty, so values the owner already chose are never overwritten.
# The value travels in the environment, not in the arguments, and is never printed.
env_default() {
	[ -n "$(env_get "$1")" ] && return 0
	ENV_KEY="$1" ENV_VALUE="$2" awk '
		index($0, ENVIRON["ENV_KEY"] "=") == 1 && !done { print ENVIRON["ENV_KEY"] "=" ENVIRON["ENV_VALUE"]; done = 1; next }
		{ print }
		END { if (!done) print ENVIRON["ENV_KEY"] "=" ENVIRON["ENV_VALUE"] }
	' .env >.env.tmp
	mv .env.tmp .env
	echo "  $1 was empty: $3"
}

prepare_env() {
	step "Checking .env"

	[ -f .env.example ] || die ".env.example not found in $ROOT."
	if [ ! -f .env ]; then
		cp .env.example .env
		chmod 600 .env 2>/dev/null || true
		echo "  .env created from .env.example"
	else
		echo "  .env already exists: only empty values are filled"
	fi

	local admin_user
	admin_user="$(gh api user --jq .login 2>/dev/null || git config github.user 2>/dev/null || echo admin)"
	env_default BETTER_AUTH_SECRET "$(random_hex)" "random value written"
	env_default AUTH_TEST_LOGIN_TOKEN "$(random_hex)" "random value written"
	env_default ADMIN_GITHUB_USERS "$admin_user" "set to $admin_user"

	local database_url github_token github_repo cron_secret
	database_url="$(env_get DATABASE_URL)"
	if [ -z "$database_url" ]; then
		echo "  database: embedded Postgres (PGlite), created and migrated on first start"
	else
		warn "DATABASE_URL is set: the app will use that Neon database, not a local one."
		warn "The local sign-in (AUTH_TEST_LOGIN_TOKEN) is ignored with DATABASE_URL: sign in with GitHub."
		# The server talks to DATABASE_URL over Neon's HTTP driver, which a plain Postgres does not speak.
		case "$database_url" in
			*localhost* | *127.0.0.1*)
				warn "DATABASE_URL points to this machine, but the app only connects to Neon: empty it."
				;;
		esac
	fi

	github_token="$(env_get GITHUB_TOKEN)"
	github_repo="$(env_get GITHUB_REPO)"
	if [ -n "$github_token$github_repo" ]; then
		case "$github_repo" in
			*/*) [ -n "$github_token" ] || warn "GITHUB_REPO is set without GITHUB_TOKEN: /admin writes to the local disk." ;;
			*) warn "GITHUB_REPO must be 'owner/name' and needs GITHUB_TOKEN. Empty both to write to the local disk." ;;
		esac
	fi

	cron_secret="$(env_get CRON_SECRET)"
	if [ -n "$cron_secret" ] && [ "${#cron_secret}" -lt 32 ]; then
		warn "CRON_SECRET has fewer than 32 characters: the newsletter scheduler endpoint will refuse it."
	fi
}

# --- Port -----------------------------------------------------------------------

# True when something accepts connections on the port. Vite may listen on IPv6 only, so both are tried.
port_busy() {
	(exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null || (exec 3<>"/dev/tcp/::1/$1") 2>/dev/null
}

# choose_port <default> [port that is ours and may be reused]
# An explicit PORT is a decision: busy means stop. Without it, the next free port is picked.
choose_port() {
	local default="$1" ours="${2:-}" candidate tries=0
	if [ -n "${PORT:-}" ]; then
		case "$PORT" in
			*[!0-9]*) die "PORT must be a number, got '$PORT'." ;;
		esac
		if [ "$PORT" != "$ours" ] && port_busy "$PORT"; then
			die "Port $PORT is busy. Stop what is using it or choose another: PORT=<port> bash $SCRIPT_NAME"
		fi
		echo "  port $PORT is free"
		return 0
	fi
	candidate="${ours:-$default}"
	while [ "$candidate" != "$ours" ] && port_busy "$candidate"; do
		tries=$((tries + 1))
		[ "$tries" -lt 20 ] || die "No free port between $default and $candidate. Choose one: PORT=<port> bash $SCRIPT_NAME"
		warn "Port $candidate is busy: trying $((candidate + 1))."
		candidate=$((candidate + 1))
	done
	PORT="$candidate"
	echo "  using port $PORT"
}

# --- Local ----------------------------------------------------------------------

check_node_and_bun() {
	step "Checking Node and Bun"

	local node_hint bun_hint node_version bun_version
	if [ "$PLATFORM" = windows ]; then
		node_hint="Install Node $NODE_MAJOR from https://nodejs.org/en/download (or 'fnm install $NODE_MAJOR'), open a new Git Bash and run again."
		bun_hint="Install it in PowerShell with 'irm bun.sh/install.ps1 | iex', open a new Git Bash and run again."
	else
		node_hint="Install Node $NODE_MAJOR with 'nvm install $NODE_MAJOR' or 'fnm install $NODE_MAJOR' (https://nodejs.org/en/download) and run again."
		bun_hint="Install it with 'curl -fsSL https://bun.sh/install | bash', open a new terminal and run again."
	fi

	command -v node >/dev/null 2>&1 || die "Node not found. $node_hint"
	node_version="$(node -p process.versions.node)"
	[ "${node_version%%.*}" = "$NODE_MAJOR" ] ||
		die "Node $node_version found, but the project runs on Node $NODE_MAJOR (engines in package.json). $node_hint"
	echo "  node $node_version"

	export PATH="$HOME/.bun/bin:$PATH"
	command -v bun >/dev/null 2>&1 || die "Bun not found (needs $MIN_BUN or newer). $bun_hint"
	bun_version="$(bun --version)"
	version_ge "$bun_version" "$MIN_BUN" ||
		die "Bun $bun_version found, but the project needs $MIN_BUN or newer. Run 'bun upgrade' and try again."
	echo "  bun $bun_version"
}

setup_local() {
	parse_args "$@"
	check_platform
	check_node_and_bun

	step "Installing dependencies"
	bun install || die "bun install failed. Read the error above; removing node_modules and running again often helps."

	prepare_env

	step "Choosing the port"
	choose_port 5173

	step "Ready"
	echo "  site:   http://localhost:$PORT"
	echo "  admin:  http://localhost:$PORT/admin  (form \"Entrada local\")"
	echo "  user:   $(env_get ADMIN_GITHUB_USERS | cut -d, -f1)"
	echo "  token:  the value of AUTH_TEST_LOGIN_TOKEN in .env"

	if [ "$START" -eq 0 ]; then
		echo "  server not started (--no-start): run 'bun run dev --port $PORT' when you want it."
		return 0
	fi
	exec bun run dev --port "$PORT" --strictPort
}

# --- Docker ---------------------------------------------------------------------

compose() { APP_PORT="${PORT:-8080}" docker compose --file "$COMPOSE_FILE" "$@"; }

check_docker() {
	step "Checking Docker"

	local install_hint daemon_hint
	if [ "$PLATFORM" = windows ]; then
		install_hint="Install Docker Desktop (https://docs.docker.com/desktop/setup/install/windows-install/ or 'winget install Docker.DockerDesktop') and run again."
		daemon_hint="Open Docker Desktop, wait until it says the engine is running, and run again."
	else
		install_hint="Install Docker Engine with the Compose plugin (https://docs.docker.com/engine/install/) or Docker Desktop, and run again."
		daemon_hint="Start it with 'sudo systemctl start docker' (Linux) or open Docker Desktop (macOS), and run again."
	fi

	command -v docker >/dev/null 2>&1 || die "Docker not found. $install_hint"
	docker compose version >/dev/null 2>&1 || die "'docker compose' (Compose v2) not found. $install_hint"
	docker info >/dev/null 2>&1 || die "Docker is installed but the daemon is not running. $daemon_hint"
	[ -f "$COMPOSE_FILE" ] || die "$COMPOSE_FILE not found in $ROOT."
	echo "  docker $(docker version --format '{{.Server.Version}}'), compose $(docker compose version --short)"
}

setup_docker() {
	parse_args "$@"
	check_platform
	check_docker
	prepare_env

	step "Choosing the port"
	# A re-run finds the port taken by this project's own container, which is about to be replaced.
	local current
	current="$(compose port app "$CONTAINER_PORT" 2>/dev/null | sed 's/.*://' || true)"
	choose_port 8080 "$current"

	step "Building the image (first build takes a few minutes)"
	compose build || die "The image did not build. Read the error above."

	if [ "$START" -eq 0 ]; then
		step "Ready"
		echo "  image built; container not started (--no-start)."
		echo "  start:  PORT=$PORT bash $SCRIPT_NAME"
		return 0
	fi

	step "Starting the container"
	if ! compose up --detach --wait; then
		compose logs --tail 40 app >&2 || true
		die "The container did not become healthy. Its last log lines are above."
	fi

	step "Ready"
	echo "  site:   http://localhost:$PORT"
	echo "  logs:   docker compose --file $COMPOSE_FILE logs --follow"
	echo "  stop:   docker compose --file $COMPOSE_FILE down"
}
