@echo off
echo 🚀 Starting Travel Planner Permanent Servers...
echo.

:: Stop any existing PM2 processes
echo ⏹️  Stopping any existing servers...
npx pm2 kill >nul 2>&1

:: Start backend server
echo 🔄 Starting Backend Server...
start /B /MIN "Travel-Planner-Backend" cmd /c "cd /d C:\Users\dspen\projects\travel-planner\backend && node src/server.js"

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Start frontend server  
echo 🔄 Starting Frontend Server...
start /B /MIN "Travel-Planner-Frontend" cmd /c "cd /d C:\Users\dspen\projects\travel-planner\frontend && npm run dev"

:: Wait a moment
timeout /t 5 /nobreak >nul

echo.
echo ✅ Travel Planner is now running permanently!
echo.
echo 🌐 Access your app:
echo    Local:    http://localhost:3000
echo    Mobile:   http://192.168.1.95:3000
echo.
echo 🔧 Management:
echo    To stop: run stop-servers.bat
echo    To check: run server-status.bat
echo.
echo 📊 Checking servers...
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
echo 📝 Servers are running in background windows.
pause