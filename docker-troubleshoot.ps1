# Docker Troubleshooting Script
Write-Host "=== Docker Troubleshooting ===" -ForegroundColor Cyan

Write-Host "`n1. Checking Docker version..." -ForegroundColor Yellow
docker version

Write-Host "`n2. Checking Docker info..." -ForegroundColor Yellow
docker info

Write-Host "`n3. Checking if Docker daemon is running..." -ForegroundColor Yellow
docker ps

Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
Write-Host "If you see errors above, try these steps:" -ForegroundColor Yellow
Write-Host "1. Restart Docker Desktop (Right-click system tray icon > Restart)" -ForegroundColor White
Write-Host "2. Ensure you're in Linux containers mode (Right-click > Switch to Linux containers)" -ForegroundColor White
Write-Host "3. If still failing, restart your computer" -ForegroundColor White
Write-Host "4. Check Docker Desktop settings > Resources > WSL Integration is enabled" -ForegroundColor White
