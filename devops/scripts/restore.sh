#!/bin/bash
set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Erreur : Veuillez spécifier le fichier de sauvegarde à restaurer."
    echo "💡 Usage : ./restore.sh /chemin/vers/backup.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erreur : Le fichier $BACKUP_FILE est introuvable."
    exit 1
fi

echo "⚠️ Restauration de la base de données depuis : $BACKUP_FILE..."
cat "$BACKUP_FILE" | docker exec -i travel_db psql -U user -d travel_db

echo "✅ Restauration de la base de données terminée avec succès !"