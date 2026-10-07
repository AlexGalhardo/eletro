#!/usr/bin/env bash
# Shared steps of setup-unix.sh and setup-windows.sh. Not meant to be run directly:
# the entry script defines install_bun and pids_on_port/kill_pid, then sources this file.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5173}"
START=1
for arg in "$@"; do
	case "$arg" in
		--no-start) START=0 ;;
		-h | --help)
			echo "Usage: $0 [--no-start]"
			echo "  --no-start   prepare everything but do not start the dev server"
			echo "  PORT=5180 $0 uses another port (default 5173)"
			exit 0
			;;
		*) echo "Unknown option: $arg (try --help)" >&2 && exit 1 ;;
	esac
done

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[warn]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2 && exit 1; }

# version_ge 1.4.2 1.4 -> true when the first version is at least the second.
version_ge() { [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]; }

random_hex() { node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"; }

env_get() {
	local value
	value="$(grep -E "^$1=" .env | tail -n1 | cut -d= -f2- | tr -d '\r' || true)"
	value="${value%\"}"
	printf '%s' "${value#\"}"
}

# Sets KEY only when it is missing or empty, so values the owner already chose are never overwritten.
env_default() {
	[ -n "$(env_get "$1")" ] && return 0
	grep -vE "^$1=" .env >.env.tmp || true
	printf '%s=%s\n' "$1" "$2" >>.env.tmp
	mv .env.tmp .env
	echo "  $1 was empty: default written to .env"
}

# --- 1. Tools -----------------------------------------------------------------
step "Checking Node and Bun"

command -v node >/dev/null 2>&1 || die "Node not found. Install Node 24 LTS (https://nodejs.org) and run again."
NODE_VERSION="$(node -p process.versions.node)"
[ "${NODE_VERSION%%.*}" = 24 ] || die "Node $NODE_VERSION found: the project runs on Node 24 (see engines in package.json)."
echo "  node $NODE_VERSION"

export PATH="$HOME/.bun/bin:$PATH"
if ! command -v bun >/dev/null 2>&1; then
	warn "Bun not found: installing it."
	install_bun || die "Could not install Bun. Install it by hand (https://bun.sh) and run again."
	command -v bun >/dev/null 2>&1 || die "Bun was installed but is not on PATH. Open a new terminal and run again."
fi
BUN_VERSION="$(bun --version)"
if ! version_ge "$BUN_VERSION" 1.4; then
	warn "Bun $BUN_VERSION is older than 1.4: upgrading."
	bun upgrade || die "Could not upgrade Bun. Run 'bun upgrade' by hand."
fi
echo "  bun $(bun --version)"

# --- 2. Dependencies ----------------------------------------------------------
step "Installing dependencies"

if ! bun install; then
	warn "bun install failed: removing node_modules and trying once more."
	rm -rf node_modules
	bun install || die "bun install failed twice. Read the error above."
fi

# --- 3. Environment -----------------------------------------------------------
step "Checking .env"

if [ ! -f .env ]; then
	cp .env.example .env
	echo "  .env created from .env.example"
fi

ADMIN_USER="$(gh api user --jq .login 2>/dev/null || git config github.user 2>/dev/null || echo admin)"
env_default BETTER_AUTH_SECRET "$(random_hex)"
env_default AUTH_TEST_LOGIN_TOKEN "$(random_hex)"
env_default ADMIN_GITHUB_USERS "$ADMIN_USER"

DATABASE_URL_VALUE="$(env_get DATABASE_URL)"
if [ -z "$DATABASE_URL_VALUE" ]; then
	echo "  database: embedded Postgres (PGlite) in .data/pglite, created and migrated on first start"
else
	echo "  database: DATABASE_URL is set; apply migrations with 'bun run db:migrate'"
	# The server talks to DATABASE_URL over Neon's HTTP driver, which a plain Postgres does not speak.
	case "$DATABASE_URL_VALUE" in
		*localhost* | *127.0.0.1*)
			warn "DATABASE_URL points to this machine, but the app only connects to Neon."
			warn "A local or Docker Postgres will not work: leave DATABASE_URL empty to use the embedded database."
			;;
	esac
	[ -n "$(env_get AUTH_TEST_LOGIN_TOKEN)" ] &&
		warn "The local sign-in (AUTH_TEST_LOGIN_TOKEN) is ignored while DATABASE_URL is set: sign in with GitHub."
fi

GITHUB_TOKEN_VALUE="$(env_get GITHUB_TOKEN)"
GITHUB_REPO_VALUE="$(env_get GITHUB_REPO)"
if [ -n "$GITHUB_TOKEN_VALUE$GITHUB_REPO_VALUE" ]; then
	case "$GITHUB_REPO_VALUE" in
		*/*) [ -n "$GITHUB_TOKEN_VALUE" ] || warn "GITHUB_REPO is set without GITHUB_TOKEN: /admin writes to the local disk." ;;
		*) warn "GITHUB_REPO must be 'owner/name' and needs GITHUB_TOKEN. Empty both to write to the local disk." ;;
	esac
fi

CRON_SECRET_VALUE="$(env_get CRON_SECRET)"
[ -n "$CRON_SECRET_VALUE" ] && [ "${#CRON_SECRET_VALUE}" -lt 32 ] &&
	warn "CRON_SECRET has fewer than 32 characters: the newsletter scheduler endpoint will refuse it."

# --- 4. Port ------------------------------------------------------------------
step "Freeing port $PORT"

PIDS="$(pids_on_port "$PORT" || true)"
if [ -n "$PIDS" ]; then
	for pid in $PIDS; do
		warn "Port $PORT is in use by PID $pid: stopping it."
		kill_pid "$pid" || warn "Could not stop PID $pid."
	done
	sleep 1
	[ -z "$(pids_on_port "$PORT" || true)" ] || warn "Port $PORT is still busy: Vite will pick the next free one."
else
	echo "  port $PORT is free"
fi

# --- 5. Start -----------------------------------------------------------------
step "Ready"
echo "  site:   http://localhost:$PORT"
echo "  admin:  http://localhost:$PORT/admin  (form \"Entrada local\")"
echo "  user:   $(env_get ADMIN_GITHUB_USERS | cut -d, -f1)"
echo "  token:  value of AUTH_TEST_LOGIN_TOKEN in .env"

if [ "$START" -eq 0 ]; then
	echo "  --no-start given: run 'bun run dev' when you want the server."
	exit 0
fi

exec bun run dev --port "$PORT"
