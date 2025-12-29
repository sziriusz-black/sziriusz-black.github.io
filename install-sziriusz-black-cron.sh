#!/usr/bin/env bash

# /home/roka/bin/install-sziriusz-black-cron.sh

set -euo pipefail

UPDATE_SCRIPT="/home/roka/bin/sziriusz-black-auto-update.sh"
MARKER="sziriusz-black-auto-update"
CRON_LINE="0,6,12,18,24,30,36,42,48,54 * * * * $UPDATE_SCRIPT >/tmp/${MARKER}.log 2>&1"

if [[ ! -f "$UPDATE_SCRIPT" ]]; then
  echo "hiba: nincs meg az update script itt: $UPDATE_SCRIPT" >&2
  exit 1
fi

chmod +x "$UPDATE_SCRIPT"

# Idempotens crontab beállítás
EXISTING="$(crontab -l 2>/dev/null || true)"
if echo "$EXISTING" | grep -qF "$MARKER"; then
  echo "cron már be van állítva, nem csinálok semmit"
  exit 0
fi

TMP="$(mktemp)"
{
  echo "$EXISTING" | sed '/^[[:space:]]*$/d'
  echo "# $MARKER"
  echo "$CRON_LINE"
} > "$TMP"

crontab "$TMP"
rm -f "$TMP"

echo "cron beállítva:"
echo "$CRON_LINE"

