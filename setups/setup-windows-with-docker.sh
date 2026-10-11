#!/usr/bin/env bash
# Builds and runs the production build in Docker (infra/) on Windows. Run it from Git Bash; needs only Docker Desktop.
# Usage: bash setups/setup-windows-with-docker.sh [--no-start]   (see --help)

set -euo pipefail

PLATFORM=windows
# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

setup_docker "$@"
