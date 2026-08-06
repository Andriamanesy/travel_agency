#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker

if [[ -z "${1:-}" ]]; then
    log "📋 Affichage des logs de tous les services (Ctrl+C pour quitter)..."
    compose logs -f --tail=100
else
    log "📋 Affichage des logs du service : $1..."
    compose logs -f --tail=100 "$1"
fi