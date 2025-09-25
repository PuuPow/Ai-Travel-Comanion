#!/usr/bin/env pwsh
Write-Host "🚀 Starting Travel Planner Application" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Start backend in background
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Green
Start-Process -FilePath "pwsh" -ArgumentList "-File", "$PSScriptRoot\start-backend.ps1" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 MOBILE ACCESS:" -ForegroundColor Magenta
Write-Host "To view on your phone, make sure your phone is on the same Wi-Fi network," -ForegroundColor White
Write-Host "then open your browser and go to: http://192.168.1.95:3000" -ForegroundColor White
Write-Host ""
Write-Host "💻 DESKTOP ACCESS:" -ForegroundColor Cyan
Write-Host "On this computer: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will run in foreground)
Set-Location "$PSScriptRoot\frontend"
& npm run dev -- --hostname 0.0.0.0