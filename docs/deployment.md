# Deployment & Containerization Guide

## Production Environment Setup with Docker Compose
To launch the full system locally or on a production server:

```bash
docker compose up --build -d
```

Services initialized:
1. `web`: Next.js application on port 3000
2. `mysql`: Production MySQL 8.0 database on port 3306
3. `redis`: Redis 7 server on port 6379
4. `worker`: Standalone seat-hold expiration background worker

## Database Migrations & Seeding
```bash
docker compose exec web npx prisma db push
docker compose exec web npm run db:seed
```
