#!/bin/bash
# Keep both services running
cd /home/z/my-project

# Start coach-api if not running
if ! ss -tlnp | grep -q ":3003 "; then
    cd /home/z/my-project/mini-services/coach-api
    nohup bash start.sh > /dev/null 2>&1 &
    cd /home/z/my-project
fi

# Start Next.js dev server if not running  
if ! ss -tlnp | grep -q ":3000 "; then
    nohup npx next dev -p 3000 > /dev/null 2>&1 &
fi

echo "Services started"
