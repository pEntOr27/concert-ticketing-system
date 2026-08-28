# Security Architecture & Best Practices

## 1. Authentication & Session Security
- Passwords are hashed using bcrypt with salt rounds = 10.
- JWT tokens are signed with secret keys (`JWT_SECRET`) and stored in HTTP-Only, Secure, SameSite=Lax cookies.
- Password plain-text is NEVER logged or stored.

## 2. Role-Based Access Control (RBAC)
- Checked strictly on Backend API handlers via `requireRole(['admin', 'super_admin'])`.
- Frontend redirects non-admin attempts to Unauthorized pages with HTTP 403 status.

## 3. Anti-Bot & Rate Limiting
- Redis sliding-window algorithm enforcing a maximum rate limit (100 req/min).
- Automated Headless user-agent detection (Selenium, Puppeteer, PhantomJS, Python-requests) blocking automated scalping bots.
- IP Blocklist management allowing Admins to block/unblock malicious IPs with reason logging.

## 4. Input Validation & Protection
- Strict Zod schemas validating all client payload inputs.
- Prisma ORM parameterized queries protecting against SQL Injection.
- Sanitized HTML rendering preventing Cross-Site Scripting (XSS).
- HTTP Security Headers enabled via Next.js config.
