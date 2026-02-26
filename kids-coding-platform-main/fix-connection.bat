@echo off
echo 🔧 CONNECTION ISSUE FIX SCRIPT
echo ===============================
echo.

echo 🛠️ Step 1: Stopping any existing Node processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul
echo.

echo 🛠️ Step 2: Checking MongoDB status...
tasklist | findstr mongod
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not running. Please start MongoDB first.
    echo Run: net start MongoDB
    pause
    exit /b 1
) else (
    echo ✅ MongoDB is running
)
echo.

echo 🛠️ Step 3: Building backend if needed...
cd /d d:\kids-coding-platform\kids-coding-platform\backend
if not exist "dist\index.js" (
    echo 📦 Building backend...
    npm run build
) else (
    echo ✅ Backend is already built
)
echo.

echo 🛠️ Step 4: Starting backend server...
echo Starting backend on port 5000...
start "Backend Server" cmd /k "npm start"
echo ⏱️ Waiting for backend to start...
timeout /t 8
echo.

echo 🛠️ Step 5: Testing backend connectivity...
curl -I http://localhost:5000/api/health
if %errorlevel% equ 0 (
    echo ✅ Backend is responding!
) else (
    echo ❌ Backend is not responding. Check the backend terminal for errors.
)
echo.

echo 🛠️ Step 6: Checking frontend environment...
cd /d d:\kids-coding-platform\kids-coding-platform\frontend
echo Current API URL configuration:
findstr "REACT_APP_API_URL" .env
echo.

echo 🛠️ Step 7: Starting frontend with correct configuration...
echo Starting frontend on port 3000...
start "Frontend Server" cmd /k "npm start"
echo.

echo ✅ SETUP COMPLETE!
echo.
echo 📋 Server Status:
echo    - Backend:  http://localhost:5000 (check terminal for status)
echo    - Frontend: http://localhost:3000 (starting...)
echo    - API:      http://localhost:5000/api
echo.
echo 🔍 If you still see connection errors:
echo    1. Wait for both servers to fully start (2-3 minutes)
echo    2. Clear browser cache and reload
echo    3. Check firewall settings
echo    4. Run: diagnose-connection.bat for detailed diagnostics
echo.
pause
