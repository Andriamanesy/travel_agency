#!/usr/bin/env bash
# Vérification non destructive à exécuter depuis le serveur de production.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

resolve_project_root
require_docker
require_command curl
load_env_file

expected_origin="http://192.168.88.226"
[[ "${PUBLIC_APP_URL:-}" == "$expected_origin" ]] || fail "PUBLIC_APP_URL doit être $expected_origin (valeur masquée : non conforme)."
[[ "${FRONTEND_PORT:-8080}" == "8080" ]] || fail "FRONTEND_PORT doit être 8080 : le port 80 est réservé au Nginx hôte."

"$SCRIPT_DIR/healthcheck.sh"

check_status() {
    local url="$1"
    local expected="$2"
    local actual
    actual="$(curl -sS -o /dev/null -w '%{http_code}' --max-redirs 0 "$url")"
    [[ "$actual" == "$expected" ]] || fail "$url : HTTP $actual (attendu : $expected)."
    log "🟢 $url : HTTP $actual"
}

log "🌐 Vérification de l'origine publique Nginx → React…"
check_status "$expected_origin/" 200
check_status "$expected_origin/catalog/circuits" 200
check_status "$expected_origin/api/healthz" 200

legacy_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-redirs 0 "$expected_origin/booking.html")"
[[ "$legacy_status" =~ ^30[12]$ ]] || fail "La redirection legacy /booking.html est absente (HTTP $legacy_status)."
log "🟢 Redirection legacy /booking.html : HTTP $legacy_status"

log "✅ Vérification technique de production terminée."
log "ℹ️ Recette manuelle restante : connexion client, création/annulation de réservation et parcours admin."
