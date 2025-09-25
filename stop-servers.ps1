#!/usr/bin/env pwsh
# Travel Planner - Stop Permanent Servers
Write-Host "⏹️  Stopping Travel Planner Servers..." -ForegroundColor Yellow

pm2 stop ecosystem.config.js
pm2 delete ecosystem.config.js

Write-Host "✅ All servers stopped." -ForegroundColor Green