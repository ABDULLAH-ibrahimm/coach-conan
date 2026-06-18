#!/bin/bash
# Coach API daemon - keeps the server running
LOG="/tmp/coach-api-daemon.log"
cd /home/z/my-project/mini-services/coach-api

while true; do
    echo "[$(date)] Starting coach-api..." >> "$LOG"
    bun index.ts >> "$LOG" 2>&1
    EXIT=$?
    echo "[$(date)] coach-api exited with code $EXIT, restarting in 2s..." >> "$LOG"
    sleep 2
done
