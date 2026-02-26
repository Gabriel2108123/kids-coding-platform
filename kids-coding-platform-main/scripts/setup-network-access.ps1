# Kids Coding Platform - Network Access Setup
# Run this PowerShell script as Administrator to enable network access

Write-Host "🔥 Adding Windows Firewall rules for Kids Coding Platform..." -ForegroundColor Yellow

# Add firewall rules for React development server (port 3000)
New-NetFirewallRule -DisplayName "Kids Coding Platform Frontend (React)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Description "Allow inbound connections for React development server"

# Add firewall rules for Node.js backend server (port 5000)
New-NetFirewallRule -DisplayName "Kids Coding Platform Backend (Node.js)" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Description "Allow inbound connections for Node.js backend server"

Write-Host "✅ Firewall rules added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 You can now access the platform from other devices using:" -ForegroundColor Cyan
Write-Host "   Frontend: http://192.168.4.125:3000" -ForegroundColor White
Write-Host "   Backend:  http://192.168.4.125:5000" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Restart both servers for changes to take effect." -ForegroundColor Yellow
