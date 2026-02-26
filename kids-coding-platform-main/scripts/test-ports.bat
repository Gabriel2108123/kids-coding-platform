@echo off
echo Testing Server Configuration
echo.

echo Checking if any servers are running...
netstat -an | findstr ":3000 :3001"
echo.

echo Starting Backend Server (should use port 3001)...
cd /d d:\kids-coding-platform\kids-coding-platform\backend
start "Backend Test" cmd /k "echo Backend starting on port 3001 && npm run dev"

echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server (should use port 3000)...
cd /d d:\kids-coding-platform\kids-coding-platform\frontend  
start "Frontend Test" cmd /k "echo Frontend starting on port 3000 && npm start"

echo.
echo Servers started. Check the opened windows for any errors.
echo Frontend should be at: http://localhost:3000
echo Backend should be at: http://localhost:3001
pause
