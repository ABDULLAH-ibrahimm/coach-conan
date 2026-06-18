#!/bin/bash
# Keep-alive wrapper for the coach-api server
# Restarts the server immediately if it crashes (Bun.serve has stability issues)

LOG_FILE="/tmp/coach-api.log"
CD_DIR="/home/z/my-project/mini-services/coach-api"

> "$LOG_FILE"  # Clear log on start

while true; do
    echo "[$(date)] Starting coach-api server..." >> "$LOG_FILE"
    cd "$CD_DIR" && bun index.ts >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE, restarting immediately..." >> "$LOG_FILE"
    sleep 0.5
done
