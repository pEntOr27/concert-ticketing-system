# Online Concert Ticketing System (ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์)

Production-like Full-Stack Web Application for an Online Concert Ticketing System built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, MySQL, Redis, Socket.IO, and Docker.

---

## 🌟 Visual Reference Alignment
This application strictly implements the design language, color palette, and layout hierarchy of the reference designs:
- **Customer Portal**: Modern Minimalist Light Blue/White interface, soft rounded cards, spacious hero banner with pill feature badges, interactive seat map, and floating promotion popup (`SUMMER10`).
- **Admin Login Modal**: Modal overlay matching reference Image 2 with quick autofill admin demo button.
- **Admin Dashboard**: Comprehensive dashboard matching reference Image 3 with left sidebar navigation (13 sections), top metric cards calculating real live database stats, and Anti-Bot security monitoring table.

---

## 🚀 Key Features

1. **Authentication & RBAC**:
   - Customer registration with Zod validation.
   - Admin Login modal with Quick Autofill Admin Demo credential (`admin@concert.com` / `Admin@123456`).
   - Role-Based Access Control enforcing `customer`, `admin`, `super_admin` permissions across frontend, backend API, and database.

2. **Simulations**:
   - **AI Face Scan Simulation**: Camera stream, oval face frame, scan line, liveness directives (blink, turn head left/right), and progress tracking.
   - **OTP Verification Simulation**: Demo OTP code configured via `DEMO_OTP_CODE=123456`.
   - **Payment Gateway Simulation**: PromptPay QR Code generator, Credit Card, and Bank Transfer simulation.

3. **High Traffic, Queue & Real-Time Seat Sync**:
   - **Virtual FIFO Queue**: Server-side queue management in Redis.
   - **Interactive Seat Map**: Available (Green), Selected (Blue), Held (Yellow), Reserved (Orange), Sold (Red), Blocked (Purple).
   - **Real-time Socket.IO Sync**: Seat state changes broadcast instantly to all connected browsers.
   - **Double Booking Prevention**: MySQL `SELECT FOR UPDATE` atomic transactions prevent race conditions. Parallel booking attempts receive `409 CONFLICT`.
   - **10-Minute Seat Hold**: Background worker scans every 5s to release expired holds back to `AVAILABLE`.

4. **Anti-Bot & Security Monitoring**:
   - Redis sliding window rate limiter.
   - Headless / Bot user-agent detection.
   - Admin IP Block / Unblock control.
   - Audit logging & Login history tracking.
   - Server-side Excel (.xlsx) reports export.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+ or v20+
- npm v10+
- Docker & Docker Compose (Optional for containerized run)

### Local Development

1. **Install dependencies**:
```bash
cmd /c npm install
```

2. **Configure Environment Variables**:
Copy `.env.example` to `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/concert_ticketing"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key-change-in-production"
DEMO_OTP_CODE="123456"
ENABLE_DEMO_LOGIN="true"
```

3. **Database Migration & Seed**:
```bash
cmd /c npx prisma db push
cmd /c npm run db:seed
```

4. **Run Development Server**:
```bash
cmd /c npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Background Worker**:
```bash
cmd /c npm run worker
```

---

## 🐳 Running with Docker & Docker Compose

Launch web, MySQL, Redis, and worker with a single command:
```bash
docker compose up --build -d
```

---

## 🧪 Testing

- **Run Unit & Integration Tests**:
```bash
cmd /c npm run test
```

- **Run Concurrency Double-Booking Conflict Test**:
```bash
cmd /c npm run test:concurrency
```

- **Run E2E Playwright Tests**:
```bash
cmd /c npm run test:e2e
```

---

## 📄 Documentation Sitemap
- `/docs/architecture.md` - System Architecture & Component Flows
- `/docs/data-model.md` - Entity Relationship Diagram & Schema Specs
- `/docs/api-contract.md` - REST API Specs & Standard Error Schema
- `/docs/design-decisions.md` - Trade-off Analyses
- `/docs/security.md` - Security Practices & Anti-Bot Protection
- `/docs/test-plan.md` & `/docs/test-report.md` - Test Strategy & Results
- `/docs/test-traceability.md` - Requirement Test Matrix
- `/docs/deployment.md` & `/docs/rollback.md` - Deployment & Rollback Strategy
- `/docs/project-completion-report.md` - Completion Summary

---

## 🏷️ Release Version
Presented Version: **v1.0.0**
