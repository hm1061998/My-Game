#!/usr/bin/env bash
# Container smoke test used by CI (P02) and locally: builds and starts the Compose stack,
# waits for health, checks public routes and that private files are never served.
# Usage: scripts/docker-smoke.sh [--keep]   (--keep leaves the stack running)
set -euo pipefail

cd "$(dirname "$0")/.."
project="ocf-smoke"
base="http://127.0.0.1:8080"
keep="${1:-}"

cleanup() {
  if [ "$keep" != "--keep" ]; then
    # Removes only this smoke project's containers and its throwaway volume.
    docker compose -p "$project" down -v --remove-orphans >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

docker compose -p "$project" build
docker compose -p "$project" up -d

for attempt in $(seq 1 30); do
  state="$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose -p "$project" ps -q app)" 2>/dev/null || echo starting)"
  [ "$state" = "healthy" ] && break
  [ "$attempt" = 30 ] && { echo "app did not become healthy (last: $state)"; docker compose -p "$project" logs app; exit 1; }
  sleep 2
done
echo "app healthy"

expect() {
  local path="$1" want="$2" code
  code="$(curl -s -o /tmp/ocf-smoke-body -w '%{http_code}' "$base$path")"
  if [ "$code" != "$want" ]; then echo "FAIL $path -> $code (want $want)"; exit 1; fi
  if grep -q -e correctChoiceId -e ConnectionStrings /tmp/ocf-smoke-body; then echo "FAIL $path leaked private content"; exit 1; fi
  echo "ok   $path -> $code"
}

expect / 200
expect /api/v1/health 200
expect /case/deep-link 200
expect /api/v1/does-not-exist 404
expect /Content/Cases/swapped-report.v1.json 404
expect /swapped-report.v1.json 404
expect /appsettings.json 404
expect /office-case-files.db 404
grep -q '<!doctype html>' <(curl -s "$base/") || { echo "FAIL / is not the web app"; exit 1; }
echo "docker smoke passed"
