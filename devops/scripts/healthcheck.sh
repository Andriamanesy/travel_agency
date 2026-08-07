#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker
require_command curl
resolve_db_settings

log "🩺 Vérification de la santé des services de l'application..."

health_ok=true

check_http() {
    local url="$1"
    local label="$2"
    if curl -fsS -o /dev/null "$url"; then
        log "🟢 $label : OK"
    else
        log "🔴 $label : INACCESSIBLE"
        health_ok=false
    fi
}

if docker ps --format '{{.Names}}' | grep -q "^travel_backend$"; then
    check_http "http://localhost:3000/healthz" "Backend API (Port 3000)"
else
    log "🔴 Backend API (Port 3000) : CONTENEUR INDISPONIBLE"
    health_ok=false
fi

if docker ps --format '{{.Names}}' | grep -q "^travel_frontend$"; then
    check_http "http://localhost:8080/" "Frontend (Port 8080)"
else
    log "🔴 Frontend (Port 8080) : CONTENEUR INDISPONIBLE"
    health_ok=false
fi

if docker ps --format '{{.Names}}' | grep -q "^travel_db$"; then
    if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" | grep -q "accepting connections"; then
        log "🟢 Database (PostgreSQL) : OK"
    else
        log "🔴 Database (PostgreSQL) : ERREUR"
        health_ok=false
    fi
else
    log "🔴 Database (PostgreSQL) : CONTENEUR INDISPONIBLE"
    health_ok=false
fi

"$health_ok" || exit 1
