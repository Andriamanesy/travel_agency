#!/usr/bin/env bash
set -e

echo "🚀 Démarrage de l'application..."
cd /opt/travel_agency
docker compose up -d
echo "✅ Tous les services sont démarrés !"