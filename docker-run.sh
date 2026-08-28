#!/bin/bash
echo "🚀 Launching Concert Ticketing System in Docker Containers..."

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not running."
    echo "💡 Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "📦 Building and starting Docker containers (Web, MySQL, Redis, Worker)..."
docker compose up --build -d

echo "🌱 Seeding initial data into Docker database..."
sleep 10
docker compose exec web npx prisma db push
docker compose exec web npm run db:seed

echo "✅ Application is live in Docker at http://localhost:3000"
