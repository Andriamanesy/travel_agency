#!/usr/bin/env bash
set -e

echo "🚀 Démarrage de l'application..."

# Se positionner automatiquement à la racine du projet (2 niveaux au-dessus de devops/scripts)
cd "$(dirname "$0")/../.."

docker compose up -d
echo "✅ Tous les services sont démarrés !"
