@echo off
echo 📊 Travel Planner Server Status
echo ================================
echo.

echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001  
echo    Mobile:   http://192.168.1.95:3000
echo.

echo 📊 Server Status:
curl -s http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo    ✅ Backend: Running on port 3001
) else (
    echo    ❌ Backend: Not responding
)

curl -s -I http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo    ✅ Frontend: Running on port 3000
) else (
    echo    ❌ Frontend: Not responding
)

echo.
echo 🔧 Management Commands:
echo    start-permanent.bat     - Start all servers
echo    stop-servers.bat        - Stop all servers
echo    server-status.bat       - Check server status

echo.
echo 💻 Running Node Processes:
tasklist /FI "IMAGENAME eq node.exe" /FI "IMAGENAME eq node20.exe" 2>nul | find "node" || echo    No Node.js processes found

echo.
pause