#!/usr/bin/env bash
set -e

echo "🛑 Arrêt de l'application..."

# Se positionner automatiquement à la racine du projet
cd "$(dirname "$0")/../.."

docker compose down
echo "✅ Stack Docker arrêtée proprement !"
