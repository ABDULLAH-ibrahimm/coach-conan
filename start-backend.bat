@echo off
cd /d "%~dp0mini-services\coach-api"
echo Starting Coach API backend on port 3003...
bun index.ts
