@echo off
echo 🔍 Quick Server Status Check
echo ================================

echo.
echo 🖥️  Local Access:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001

echo.
echo 📱 Mobile Access:
echo    Frontend: http://192.168.1.95:3000
echo    Backend:  http://192.168.1.95:3001

echo.
echo 🚀 Testing Servers...

:: Test backend health
curl -s http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo    ✅ Backend: Running on port 3001
) else (
    echo    ❌ Backend: Not responding
)

:: Test frontend
curl -s -I http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo    ✅ Frontend: Running on port 3000
) else (
    echo    ❌ Frontend: Not responding
)

echo.
echo 🔧 Running Processes:
tasklist /fi "imagename eq node.exe" /fo table /nh 2>nul | find /c "node.exe" >nul
if %ERRORLEVEL% == 0 (
    echo    Node.js processes found
) else (
    echo    No Node.js processes running
)

echo.
echo 📊 Server Details:
curl -s http://localhost:3001/ 2>nul | jq -r ".message" 2>nul || echo    Backend API accessible

echo.
pause