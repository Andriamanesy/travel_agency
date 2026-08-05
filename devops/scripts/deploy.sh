#!/usr/bin/env bash
set -e

echo "🚀 Début du déploiement..."

# 1. Se placer à la racine du projet (deux dossiers au-dessus du script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

# 2. Récupérer la dernière version du code
echo "📥 Récupération des dernières modifications..."
git pull origin main

# 3. Reconstruire et relancer les conteneurs Docker
echo "🐳 Rechargement des conteneurs Docker..."
docker compose up -d --build

# 4. Nettoyer les anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "✅ Déploiement terminé avec succès !"