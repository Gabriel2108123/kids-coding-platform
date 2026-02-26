@echo off
REM Performance optimization script for VS Code and Node.js on Windows

echo 🚀 Optimizing development environment...

REM Set Node.js memory limits (increase for large projects)
set NODE_OPTIONS=--max-old-space-size=8192 --max-new-space-size=1024

REM TypeScript performance
set TSC_COMPILE_ON_ERROR=true
set TSC_WATCHFILE=UseFsEvents
set TSC_WATCHDIRECTORY=UseFsEvents

REM Disable source map warnings in Chrome DevTools
set GENERATE_SOURCEMAP=false

REM Reduce React dev tools overhead
set REACT_EDITOR=none

REM Optimize npm
set npm_config_progress=false
set npm_config_loglevel=warn

REM Git performance
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256

echo ✅ Environment optimized for better performance!
echo.
echo 🔧 Additional recommendations:
echo 1. Close unused browser tabs
echo 2. Close other heavy applications
echo 3. Restart VS Code every few hours during heavy development
echo 4. Use 'npm run build' instead of 'npm start' for testing final builds
echo 5. Consider using VS Code Insiders for better performance
echo.
echo 💡 If VS Code still freezes:
echo 1. Press Ctrl+Shift+P
echo 2. Type 'Developer: Restart Extension Host'
echo 3. This will restart extensions without closing VS Code
echo.
echo 🔄 To apply these settings, restart your terminal or run:
echo source ~/.bashrc  (on Git Bash)
echo.
pause
