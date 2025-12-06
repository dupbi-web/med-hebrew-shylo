# Docker Build and Run Script
# This script builds and runs the production Docker container

Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build --build-arg VITE_SUPABASE_URL="" --build-arg VITE_SUPABASE_ANON_KEY="" -t dev-med-ivrit:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild successful!" -ForegroundColor Green
    Write-Host "`nTo run the container, use one of these commands:" -ForegroundColor Yellow
    Write-Host "  docker run -d -p 8080:8080 --name dev-med-ivrit dev-med-ivrit:latest" -ForegroundColor White
    Write-Host "  docker-compose up -d" -ForegroundColor White
    Write-Host "`nAccess the application at: http://localhost:8080" -ForegroundColor Yellow
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}
