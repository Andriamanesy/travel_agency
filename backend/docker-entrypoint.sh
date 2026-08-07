#!/bin/sh
set -eu

echo '[Bootstrap] Application des migrations…'
npm run migrate

if [ "${ALLOW_DEMO_SEED:-false}" = "true" ]; then
  echo '[Bootstrap] Chargement des données de démonstration…'
  npm run db:seed
fi

exec "$@"
