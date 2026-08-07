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

log "🌐 Vérification du point d'entrée React..."
frontend_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' travel_frontend 2>/dev/null || true)"
[[ "$frontend_status" == "healthy" ]] || fail "Le frontend React n'est pas sain après le déploiement."

log "🧹 Nettoyage des anciennes images..."
docker image prune -f

log "✅ Déploiement terminé avec succès !"
