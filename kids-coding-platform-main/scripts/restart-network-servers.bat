@echo off
echo 🔄 Kids Coding Platform - Network Access Restart
echo ================================================

echo.
echo 🛑 Stopping existing servers...
taskkill /f /im node.exe 2>nul

echo.
echo 🎯 Updated Configuration:
echo    Frontend: http://192.168.4.125:3000
echo    Backend:  http://192.168.4.125:5000

echo.
echo 🚀 Starting Backend Server...
cd /d "d:\kids-coding-platform\kids-coding-platform\backend"
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Starting Frontend Server...
cd /d "d:\kids-coding-platform\kids-coding-platform\frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Access from other devices:
echo    http://192.168.4.125:3000
echo.
echo 💡 Tip: If still not working, run the firewall script:
echo    PowerShell: .\scripts\setup-network-access.ps1
echo.
pause
