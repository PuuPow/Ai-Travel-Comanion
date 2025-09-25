#!/usr/bin/env pwsh
# Travel Planner - Server Status and Monitoring

Write-Host "📊 Travel Planner Server Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Show PM2 status
pm2 status

Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Gray
Write-Host "   Mobile:   http://192.168.1.95:3000" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 Quick Commands:" -ForegroundColor Yellow
Write-Host "   pm2 logs                    - View live logs" -ForegroundColor Gray
Write-Host "   pm2 logs --lines 50         - View last 50 log lines" -ForegroundColor Gray
Write-Host "   pm2 restart all             - Restart all servers" -ForegroundColor Gray
Write-Host "   pm2 reload all              - Reload without downtime" -ForegroundColor Gray
Write-Host "   pm2 monit                   - Open monitoring dashboard" -ForegroundColor Gray

Write-Host ""
Write-Host "📁 Log Files:" -ForegroundColor Blue
Get-ChildItem "./logs/*.log" 2>$null | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "   $($_.Name) (${size} KB)" -ForegroundColor Gray
}