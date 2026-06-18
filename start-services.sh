#!/bin/bash

# Start Next.js dev server
cd /home/z/my-project
nohup npx next dev -p 3000 > /home/z/my-project/dev.log 2>&1 &
echo "Next.js PID: $!" > /tmp/nextjs.pid

# Start Coach API with auto-restart
cd /home/z/my-project/mini-services/coach-api
nohup bash start.sh > /dev/null 2>&1 &
echo "Coach API PID: $!" > /tmp/coach-api.pid

echo "Services started. Waiting for them to be ready..."
sleep 5

# Verify
curl -s --max-time 3 http://localhost:3000/ > /dev/null && echo "Next.js: OK" || echo "Next.js: FAILED"
curl -s --max-time 3 http://localhost:3003/health > /dev/null && echo "Coach API: OK" || echo "Coach API: FAILED"
