@echo off
echo 🔍 NETWORK CONNECTIVITY DIAGNOSTICS
echo =====================================
echo.

echo 📊 Checking Current Network Configuration:
echo.
echo 1. Checking if ports are in use:
netstat -an | findstr :3000
netstat -an | findstr :5000
echo.

echo 2. Testing localhost connectivity:
ping -n 1 localhost
echo.

echo 3. Testing specific IP connectivity:
ping -n 1 192.168.4.125
echo.

echo 4. Checking running Node.js processes:
tasklist | findstr node
echo.

echo 5. Checking MongoDB status:
tasklist | findstr mongod
echo.

echo 6. Testing backend API endpoint:
echo Attempting to connect to backend...
curl -I http://localhost:5000/api/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is responding
) else (
    echo ❌ Backend is not responding
)
echo.

echo 7. Environment Configuration Check:
echo Frontend .env file configuration:
echo REACT_APP_API_URL from .env:
findstr "REACT_APP_API_URL" d:\kids-coding-platform\kids-coding-platform\frontend\.env
echo.

echo 🔧 TROUBLESHOOTING RECOMMENDATIONS:
echo.
if not exist "d:\kids-coding-platform\kids-coding-platform\backend\dist\index.js" (
    echo ❌ Backend not built. Run: cd backend && npm run build
) else (
    echo ✅ Backend is built
)
echo.

echo 📋 Quick Fixes:
echo 1. Make sure both servers are running
echo 2. Check firewall settings
echo 3. Verify environment configuration
echo 4. Restart browsers/clear cache
echo.
pause
