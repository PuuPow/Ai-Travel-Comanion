#!/usr/bin/env pwsh

Write-Host "🚀 Starting Travel Planner Servers" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue
Write-Host ""

# Kill any existing node processes to prevent conflicts
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
$backendProcess = Start-Process -FilePath "node" -ArgumentList "src/index.js" -PassThru -WindowStyle Hidden

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server started successfully on port 3001" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    exit 1
}

# Start Frontend Server
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
$frontendProcess = Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" -ArgumentList "run", "dev", "--", "--hostname", "0.0.0.0" -PassThru -WindowStyle Hidden

# Wait for frontend to initialize
Write-Host "⏳ Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test frontend
$frontendReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 3
    }
}

if ($frontendReady) {
    Write-Host "✅ Frontend server started successfully on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server failed to start properly" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Travel Planner is ready!" -ForegroundColor Magenta
Write-Host ""
Write-Host "📱 Mobile Access (make sure phone is on same Wi-Fi):" -ForegroundColor Cyan
Write-Host "   http://192.168.1.95:3000" -ForegroundColor White
Write-Host ""
Write-Host "💻 Desktop Access:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Backend API:" -ForegroundColor Cyan
Write-Host "   http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Process IDs:" -ForegroundColor Gray
Write-Host "Backend: $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "Frontend: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers:" -ForegroundColor Yellow
Write-Host "Stop-Process -Id $($backendProcess.Id),$($frontendProcess.Id) -Force" -ForegroundColor Gray