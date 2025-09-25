#!/usr/bin/env pwsh
# Travel Planner - Start Permanent Servers
Write-Host "🚀 Starting Travel Planner Servers..." -ForegroundColor Green

# Stop any existing servers
Write-Host "⏹️  Stopping any existing servers..." -ForegroundColor Yellow
pm2 stop ecosystem.config.js 2>$null
pm2 delete ecosystem.config.js 2>$null

# Start servers with PM2
Write-Host "🔄 Starting servers with PM2..." -ForegroundColor Blue
pm2 start ecosystem.config.js

# Show status
Write-Host "📊 Server Status:" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "✅ Travel Planner is now running permanently!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your app:" -ForegroundColor White
Write-Host "   Local:    http://localhost:3000" -ForegroundColor Gray
Write-Host "   Mobile:   http://192.168.1.95:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor White
Write-Host "   pm2 status           - View server status" -ForegroundColor Gray
Write-Host "   pm2 logs             - View all logs" -ForegroundColor Gray
Write-Host "   pm2 stop all         - Stop all servers" -ForegroundColor Gray
Write-Host "   pm2 restart all      - Restart all servers" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Logs are saved in: ./logs/" -ForegroundColor White