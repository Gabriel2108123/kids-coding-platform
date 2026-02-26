@echo off
echo =================================
echo Port Configuration Check
echo =================================
echo.

echo Checking current port usage:
netstat -ano | findstr ":3000 :3001"
echo.

echo Testing port 3000 (should be frontend):
curl -s http://localhost:3000 | findstr "html\|react\|DOCTYPE"
echo.

echo Testing port 3001 (should be backend API):
curl -s http://localhost:3001 | findstr "API\|success\|platform"
echo.

echo Current IP addresses:
ipconfig | findstr "IPv4"
echo.

echo Frontend .env configuration:
findstr "PORT\|API" d:\kids-coding-platform\kids-coding-platform\frontend\.env
echo.

echo Backend .env configuration:  
findstr "PORT\|HOST" d:\kids-coding-platform\kids-coding-platform\backend\.env
echo.

pause
