#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  CODZERO — autorun.sh
#  Keeps the bot running and restarts it automatically if it
#  crashes or you use .restart. Does NOT make it survive your
#  phone going to sleep — for that, also run:
#    termux-wake-lock
#  before starting this, and disable battery optimization for
#  Termux in your phone's Android settings.
# ============================================================
cd "$(dirname "$0")"

echo "CODZERO autorun starting. Press CTRL+C twice to fully stop."

while true; do
  node index.js
  EXIT_CODE=$?
  echo "Bot process exited (code $EXIT_CODE). Restarting in 5s..."
  sleep 5
done
