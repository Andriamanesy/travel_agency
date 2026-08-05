#!/usr/bin/env bash
cd "$(dirname "$0")/../.."

if [ -z "$1" ]; then
    echo "📋 Affichage des logs de tous les services (Ctrl+C pour quitter)..."
    docker compose logs -f --tail=100
else
    echo "📋 Affichage des logs du service : $1..."
    docker compose logs -f --tail=100 "$1"
fi