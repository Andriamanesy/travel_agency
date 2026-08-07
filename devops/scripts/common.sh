#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

fail() {
    echo "❌ $*" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "Commande introuvable : $1"
}

load_env_file() {
    local env_file="$PROJECT_ROOT/.env"
    if [[ -f "$env_file" ]]; then
        set -a
        while IFS= read -r line || [[ -n "$line" ]]; do
            line="${line%$'\r'}"
            [[ "$line" =~ ^[[:space:]]*$ ]] && continue
            [[ "$line" =~ ^[[:space:]]*# ]] && continue

            local key="${line%%=*}"
            local value="${line#*=}"
            key="${key#"${key%%[![:space:]]*}"}"
            key="${key%"${key##*[![:space:]]}"}"
            value="${value#"${value%%[![:space:]]*}"}"
            value="${value%"${value##*[![:space:]]}"}"

            if [[ "$value" =~ ^\".*\"$ ]]; then
                value="${value:1:${#value}-2}"
            elif [[ "$value" =~ ^\'.*\'$ ]]; then
                value="${value:1:${#value}-2}"
            fi

            export "$key=$value"
        done < "$env_file"
        set +a
    fi
}

resolve_project_root() {
    cd "$PROJECT_ROOT"
}

resolve_db_settings() {
    load_env_file
    DB_CONTAINER="${DB_CONTAINER:-travel_postgres}"
    DB_USER="${DB_USER:-${POSTGRES_USER:-travel_user}}"
    DB_NAME="${DB_NAME:-${POSTGRES_DB:-travel_agency_db}}"
}

require_docker() {
    require_command docker
    docker compose version >/dev/null 2>&1 || fail "docker compose n'est pas disponible"
}

compose() {
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" "$@"
}

wait_for_container_health() {
    local container="$1"
    local attempts="${2:-30}"
    local status

    for ((attempt = 1; attempt <= attempts; attempt++)); do
        status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container" 2>/dev/null || true)"
        if [[ "$status" == "healthy" ]]; then
            return 0
        fi
        if [[ "$status" == "unhealthy" || "$status" == "none" ]]; then
            fail "Le conteneur $container est dans l'état $status."
        fi
        sleep 2
    done

    fail "Le conteneur $container n'est pas devenu sain après $((attempts * 2)) secondes (état : ${status:-inconnu})."
}
