#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker
resolve_db_settings

BACKUP_DIR="$PROJECT_ROOT/devops/backups"
mkdir -p "$BACKUP_DIR"

DATE="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/travel_db_${DATE}.sql"

log "📦 Création de la sauvegarde de la base de données..."
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    docker exec -t "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    log "✅ Sauvegarde réussie !"
    log "📂 Fichier généré : $BACKUP_FILE"
else
    fail "Conteneur de base de données introuvable : $DB_CONTAINER"
fi