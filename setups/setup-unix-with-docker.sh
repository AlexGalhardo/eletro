#!/usr/bin/env bash
# Builds and runs the production build in Docker (infra/) on macOS, Linux and WSL. Needs only Docker.
# Usage: bash setups/setup-unix-with-docker.sh [--no-start]   (see --help)

set -euo pipefail

PLATFORM=unix
# shellcheck source=setups/_common.sh
. "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

setup_docker "$@"
