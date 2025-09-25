@echo off
echo ⏹️  Stopping Travel Planner Servers...
echo.

:: Kill all node processes
echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node20.exe >nul 2>&1

:: Kill PM2 if running
echo Stopping PM2 processes...
npx pm2 kill >nul 2>&1

:: Close specific windows if they exist
taskkill /FI "WINDOWTITLE:Travel-Planner-Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE:Travel-Planner-Frontend*" /F >nul 2>&1

echo.
echo ✅ All Travel Planner servers have been stopped.
echo.
pause