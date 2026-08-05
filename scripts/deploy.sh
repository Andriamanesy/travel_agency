#!/usr/bin/env bash

# Arrêter le script si une commande échoue
set -e

echo "🚀 Début du déploiement sur le serveur..."

# 1. Se placer dans le dossier du projet sur le serveur
cd /opt/travel_agency

# 2. Récupérer la dernière version du code depuis GitHub
echo "📥 Récupération des dernières modifications..."
git pull origin main

# 3. Reconstruire et relancer les conteneurs Docker
echo "🐳 Rechargement des conteneurs Docker..."
docker compose up -d --build

# 4. Nettoyer les anciennes images Docker devenues inutiles
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "✅ Déploiement terminé avec succès !"