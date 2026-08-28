# PowerShell Script to Launch Full Application via Docker Containers
Write-Host "🚀 Launching Concert Ticketing System in Docker Containers..." -ForegroundColor Cyan

# 1. Check Docker Desktop installation
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "❌ Error: Docker is not installed or not in PATH." -ForegroundColor Red
    Write-Host "💡 Please install Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Build and start containers with docker compose
Write-Host "📦 Building and starting Docker containers (Web, MySQL, Redis, Worker)..." -ForegroundColor Green
docker compose up --build -d

# 3. Wait for database and seed initial data
Write-Host "🌱 Seeding initial data into Docker database..." -ForegroundColor Green
Start-Sleep -Seconds 10
docker compose exec web npx prisma db push
docker compose exec web npm run db:seed

Write-Host "✅ Application is live in Docker at http://localhost:3000" -ForegroundColor Cyan
