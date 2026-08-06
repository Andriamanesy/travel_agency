#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker
resolve_db_settings

log "🚀 Initialisation de la stack Travel Agency..."

if ! docker info >/dev/null 2>&1; then
    fail "Docker n'est pas accessible"
fi

if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    fail "Le fichier .env est introuvable à la racine du projet"
fi

log "📦 Vérification des services Docker..."
compose down --remove-orphans >/dev/null 2>&1 || true

log "🛠️ Construction et démarrage des services..."
compose up -d --build

log "⏳ Attente de la disponibilité de la base de données..."
for _ in $(seq 1 30); do
    if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

if ! docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    fail "La base de données n'est pas disponible après le délai imparti"
fi

log "🗄️ Exécution des migrations..."
compose run --rm migrate

log "✅ Initialisation terminée avec succès !"
log "🌐 Frontend : http://localhost:8080"
log "🔧 Backend : http://localhost:3000"
