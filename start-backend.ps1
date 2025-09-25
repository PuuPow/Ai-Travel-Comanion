#!/usr/bin/env pwsh
Write-Host "Starting Travel Planner Backend..." -ForegroundColor Green
Write-Host "Backend will be available at:" -ForegroundColor Yellow
Write-Host "  Local: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Network: http://192.168.1.95:3001" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\backend"
& node src/index.js