# Architectural Design Decisions & Trade-off Analyses

## 1. Why Real MySQL Database with Prisma ORM?
- **Decision**: Use MySQL with Prisma ORM instead of in-memory or SQLite mock database.
- **Rationale**: Ticketing systems demand ACID transaction guarantees, row-level locking (`SELECT FOR UPDATE`), foreign key constraints, and relational consistency across multiple browser sessions.

## 2. Why Database Row-Locking (`SELECT FOR UPDATE`) for Double Booking Prevention?
- **Decision**: Execute atomic `SELECT FOR UPDATE` within a MySQL transaction during seat hold requests.
- **Rationale**: Prevents race conditions when two or more users attempt to select the same seat simultaneously. If User A locks seat row first, User B's transaction waits or fails with `409 CONFLICT`.

## 3. Why WebSocket / Socket.IO for Real-Time Synchronization?
- **Decision**: Push seat status updates (`AVAILABLE` -> `HELD` -> `SOLD`) over WebSocket connections.
- **Rationale**: Provides instant sub-second visual updates across all connected browsers without expensive polling.

## 4. Why Server-Side 10-Minute Hold Timers & Background Worker?
- **Decision**: Server maintains `expires_at` timestamps in MySQL/Redis and a background worker runs every 5s to release expired holds.
- **Rationale**: Relying on client-side timers is insecure (users could pause JS timers). Server enforcement ensures abandoned seats return to `AVAILABLE` automatically after 10 minutes.

## 5. Why Simulated AI Face Scan & OTP Verification?
- **Decision**: Build interactive canvas/webcam simulations with clear demo disclaimers.
- **Rationale**: Allows full production-like UX testing of identity verification without requiring expensive third-party SMS gateway credits or biometric privacy compliance during demo evaluation.
