#!/usr/bin/env bash
cd "$(dirname "$0")/../.."

echo "📊 État des conteneurs de l'application :"
docker compose ps