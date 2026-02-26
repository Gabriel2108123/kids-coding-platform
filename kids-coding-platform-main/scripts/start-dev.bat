@echo off
echo Starting Kids Coding Platform Development Servers...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d backend && npm run dev"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d frontend && npm start"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this script (servers will continue running)...
pause >nul
