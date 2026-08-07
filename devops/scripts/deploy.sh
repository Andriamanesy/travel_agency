#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker

log "🚀 Début du déploiement..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git diff --quiet || fail "Le répertoire contient des modifications non commitées ; déploiement interrompu."
    log "📥 Récupération des dernières modifications..."
    git pull --ff-only origin main
else
    log "⚠️ Répertoire Git introuvable, skip de la mise à jour"
fi

log "🐳 Rechargement des conteneurs Docker..."
compose up -d --build
"$SCRIPT_DIR/healthcheck.sh"

log "🧹 Nettoyage des anciennes images..."
docker image prune -f

log "✅ Déploiement terminé avec succès !"
