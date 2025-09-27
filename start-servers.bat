@echo off
echo Starting Travel Planner Application...
echo.

echo ========================================
echo   TRAVEL PLANNER - SERVER STARTUP
echo ========================================
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d C:\Users\dspen\projects\travel-planner\backend && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d C:\Users\dspen\projects\travel-planner\frontend && npm run dev"

echo.
echo ========================================
echo   SERVERS STARTING...
echo ========================================
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo   Mobile:   http://192.168.1.22:3000
echo ========================================
echo.
echo Both servers are starting in separate windows.
echo Check the server windows for any errors.
echo.
echo Press any key to exit this script...
pause >nul