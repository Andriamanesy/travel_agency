#!/usr/bin/env bash
set -e

echo "🛑 Arrêt de l'application..."
cd /opt/travel_agency
docker compose down
echo "✅ Stack Docker arrêtée proprement !"