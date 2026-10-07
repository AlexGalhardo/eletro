#!/usr/bin/env bash
# Prepares and starts the project on Windows. Run it from Git Bash (it ships with Git for Windows):
# Usage: bash setups/setup-windows.sh [--no-start]

install_bun() {
	powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"
}

pids_on_port() {
	netstat -ano -p TCP | tr -d '\r' | awk -v port=":$1" '$4 == "LISTENING" && $2 ~ port"$" { print $5 }' | sort -u
}

# Double slashes keep Git Bash from rewriting the flags as paths. /T also stops the child processes.
kill_pid() {
	taskkill //F //T //PID "$1" >/dev/null 2>&1
}

# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
