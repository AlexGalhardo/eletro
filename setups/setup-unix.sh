#!/usr/bin/env bash
# Prepares and starts the project on macOS, Linux and WSL.
# Usage: bash setups/setup-unix.sh [--no-start]

install_bun() {
	command -v curl >/dev/null 2>&1 || return 1
	curl -fsSL https://bun.sh/install | bash
}

pids_on_port() {
	if command -v lsof >/dev/null 2>&1; then
		lsof -ti "tcp:$1" -sTCP:LISTEN
	elif command -v fuser >/dev/null 2>&1; then
		fuser "$1/tcp" 2>/dev/null
	elif command -v ss >/dev/null 2>&1; then
		ss -ltnpH "sport = :$1" | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u
	fi
}

# Asks the process to stop first, so a dev server can close its files; forces it after two seconds.
kill_pid() {
	kill "$1" 2>/dev/null || return 1
	sleep 2
	kill -0 "$1" 2>/dev/null && kill -9 "$1" 2>/dev/null
	return 0
}

# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
