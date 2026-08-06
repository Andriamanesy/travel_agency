#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker

log "📥 Récupération du code source..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git pull --ff-only origin main
else
    log "⚠️ Répertoire Git introuvable, skip de la mise à jour"
fi

log "🐳 Rechargement des conteneurs..."
compose up -d --build

log "✅ Mise à jour terminée avec succès !"