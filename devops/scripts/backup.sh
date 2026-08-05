#!/usr/bin/env bash
set -e

# Racine du projet dynamique
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/devops/backups"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/travel_db_$DATE.sql"

echo "📦 Création de la sauvegarde de la base de données..."
docker exec -t travel_db pg_dump -U user travel_db > "$BACKUP_FILE"

echo "✅ Sauvegarde réussie !"
echo "📂 Fichier généré : $BACKUP_FILE"