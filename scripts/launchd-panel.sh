#!/usr/bin/env bash
# launchd entry for Leo Studio. Foreground so launchd owns the process.
# If a panel is already on 8198, wait instead of crash-looping KeepAlive.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${LTX_PORT:-8198}"

while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  sleep 5
done

exec "$ROOT/run_panel.sh"
