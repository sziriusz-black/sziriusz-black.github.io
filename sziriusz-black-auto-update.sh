#!/usr/bin/env bash

# /home/roka/bin/sziriusz-black-auto-update.sh

set -euo pipefail

REPO_DIR="/home/roka/sziriusz-black"
CONTAINER_NAME="sziriusz-black-backend-1"

STATE_DIR="${REPO_DIR}/.deploy_state"
STATE_FILE="${STATE_DIR}/updates.log"
LOCK_FILE="/tmp/sziriusz-black-auto-update.lock"

log() { printf '%s %s\n' "$(date -Is)" "$*"; }

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "már fut egy példány, kilépek"
  exit 0
fi

cd "$REPO_DIR"

mkdir -p "$STATE_DIR"
# Lokálisan ignoráljuk a state mappát, hogy ne legyen git státusz zaj
if ! grep -qxF "/.deploy_state/" .git/info/exclude 2>/dev/null; then
  echo "/.deploy_state/" >> .git/info/exclude
fi

# 1. sorból olvassuk a korábbi head hash-t (formátum: ISO | COMMIT_ISO | HASH | ...)
PREV_HASH=""
if [[ -f "$STATE_FILE" ]]; then
  PREV_HASH="$(head -n1 "$STATE_FILE" | awk -F' | ' '{print $3}' | tr -d '[:space:]' || true)"
fi

log "helyi módosítások eldobása"
git reset --hard
git clean -fd

log "frissítés (git pull --ff-only)"
git pull --ff-only

NEW_HASH_SHORT="$(git rev-parse --short=12 HEAD)"
NEW_COMMIT_TIME="$(git show -s --format=%cI HEAD)"
NOW_TIME="$(date -Is)"

if [[ -n "$PREV_HASH" && "$NEW_HASH_SHORT" == "$PREV_HASH" ]]; then
  log "nincs új commit az utolsó frissítés óta (head: $NEW_HASH_SHORT), vége"
  exit 0
fi

log "új commit érkezett (régi: ${PREV_HASH:-<nincs>}, új: $NEW_HASH_SHORT), docker restart: $CONTAINER_NAME"
docker restart "$CONTAINER_NAME" >/dev/null

log "docker restart ok, state log frissítése (legfrissebb felülre)"
LINE="$NOW_TIME | $NEW_COMMIT_TIME | $NEW_HASH_SHORT | refreshed"

# régi sorok maradjanak, új menjen a tetejére
tmp="$(mktemp)"
{
  echo "$LINE"
  [[ -f "$STATE_FILE" ]] && cat "$STATE_FILE" || true
} > "$tmp"
mv "$tmp" "$STATE_FILE"

log "kész"

