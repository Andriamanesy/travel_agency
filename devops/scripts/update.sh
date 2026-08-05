#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../.."

echo "📥 Récupération du code source..."
git pull origin main

echo "🐳 Rechargement des conteneurs..."
docker compose up --build -d

echo "✅ Mise à jour terminée avec succès !"