#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker

log "🚀 Début du déploiement..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log "📥 Récupération des dernières modifications..."
    git pull --ff-only origin main
else
    log "⚠️ Répertoire Git introuvable, skip de la mise à jour"
fi

log "🐳 Rechargement des conteneurs Docker..."
compose up -d --build

log "🧹 Nettoyage des anciennes images..."
docker image prune -f

log "✅ Déploiement terminé avec succès !"