#!/usr/bin/env pwsh
Write-Host "Starting Travel Planner Frontend..." -ForegroundColor Green
Write-Host "Frontend will be available at:" -ForegroundColor Yellow
Write-Host "  Local: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Network: http://192.168.1.95:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 To access on your phone:" -ForegroundColor Magenta
Write-Host "   Open your phone's browser and go to: http://192.168.1.95:3000" -ForegroundColor White
Write-Host ""

Set-Location "$PSScriptRoot\frontend"
& npm run dev -- --hostname 0.0.0.0