#!/usr/bin/env bash
# Prepares the project and starts the dev server on macOS, Linux and WSL (Node, Bun, .env, port).
# Usage: bash setups/setup-unix-local.sh [--no-start]   (see --help)

set -euo pipefail

PLATFORM=unix
# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

setup_local "$@"
