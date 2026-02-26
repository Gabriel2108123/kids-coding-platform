#!/bin/bash
# Performance optimization script for VS Code and Node.js

echo "🚀 Optimizing development environment..."

# Set Node.js memory limits (increase for large projects)
export NODE_OPTIONS="--max-old-space-size=8192 --max-new-space-size=1024"

# TypeScript performance
export TSC_COMPILE_ON_ERROR=true
export TSC_WATCHFILE=UseFsEvents
export TSC_WATCHDIRECTORY=UseFsEvents

# Disable source map warnings in Chrome DevTools
export GENERATE_SOURCEMAP=false

# Reduce React dev tools overhead
export REACT_EDITOR=none

# Optimize npm/yarn
export npm_config_progress=false
export npm_config_loglevel=warn

# Git performance
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256

echo "✅ Environment optimized for better performance!"
echo ""
echo "🔧 Additional recommendations:"
echo "1. Close unused browser tabs"
echo "2. Close other heavy applications"
echo "3. Restart VS Code every few hours during heavy development"
echo "4. Use 'npm run build' instead of 'npm start' for testing final builds"
echo "5. Consider using VS Code Insiders for better performance"
echo ""
echo "💡 If VS Code still freezes:"
echo "1. Press Ctrl+Shift+P"
echo "2. Type 'Developer: Restart Extension Host'"
echo "3. This will restart extensions without closing VS Code"
