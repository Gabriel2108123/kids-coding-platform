@echo off
echo 🚀 Starting Kids Coding Platform...
echo.

REM Set environment for better performance
set NODE_OPTIONS=--max-old-space-size=8192

echo 📦 Starting Backend Server...
start "Backend Server" cmd /k "cd /d d:\kids-coding-platform\kids-coding-platform\backend && npm start"

echo ⏱️ Waiting for backend to initialize...
timeout /t 5

echo 🌐 Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d d:\kids-coding-platform\kids-coding-platform\frontend && npm start"

echo ✅ Both servers are starting...
echo.
echo 📋 Server Information:
echo    - Backend:  http://localhost:5000
echo    - Frontend: http://localhost:3000
echo    - API:      http://localhost:5000/api
echo.
echo 💡 Tip: Wait for both servers to fully start before accessing the application
echo 🔧 If you see connection errors, make sure MongoDB is running
echo.
pause
