#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker
resolve_db_settings

BACKUP_FILE="${1:-}"
if [[ -z "$BACKUP_FILE" ]]; then
    echo "❌ Erreur : Veuillez spécifier le fichier de sauvegarde à restaurer."
    echo "💡 Usage : ./restore.sh /chemin/vers/backup.sql"
    exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
    fail "Le fichier $BACKUP_FILE est introuvable."
fi

log "⚠️ Restauration de la base de données depuis : $BACKUP_FILE..."
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
    log "✅ Restauration de la base de données terminée avec succès !"
else
    fail "Conteneur de base de données introuvable : $DB_CONTAINER"
fi