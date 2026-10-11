#!/usr/bin/env bash
# Prepares the project and starts the dev server on Windows. Run it from Git Bash (Node, Bun, .env, port).
# Usage: bash setups/setup-windows-local.sh [--no-start]   (see --help)

set -euo pipefail

PLATFORM=windows
# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

setup_local "$@"
