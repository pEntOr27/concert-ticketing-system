# System Architecture & Component Design

## Overview
The **Online Concert Ticketing System** is designed using a Layered & Modular Architecture capable of handling high-concurrency ticket sales (500+ TPS).

```mermaid
graph TD
    Client[Browser Desktop / Tablet / Mobile] --> |HTTP / WSS| WebApp[Next.js App / API Server]
    
    subgraph Presentation Layer
        CustomerPortal[Customer Portal]
        AdminDashboard[Admin Dashboard]
    end

    subgraph Application Layer
        AuthService[Auth & RBAC Service]
        QueueService[Virtual Queue FIFO Service]
        BookingService[Seat Booking Engine]
        PaymentService[Simulated Payment Gateway]
        TicketService[E-Ticket & QR/PDF Engine]
        AntiBotService[Anti-Bot & Security Service]
        AdminService[Admin Analytics & Audit Service]
    end

    subgraph Real-Time & Worker Layer
        SocketEngine[WebSocket / Socket.IO Hub]
        BackgroundWorker[Seat Hold Expiration Worker]
    end

    subgraph Database & Infrastructure Layer
        MySQL[(MySQL Relational DB)]
        Redis[(Redis Cache / Queue / PubSub)]
    end

    WebApp --> Presentation Layer
    Presentation Layer --> Application Layer
    Application Layer --> Real-Time & Worker Layer
    Application Layer --> Database & Infrastructure Layer
```

## Core Flows

### 1. Concurrent Double-Booking Prevention Flow
```mermaid
sequenceDiagram
    autonumber
    actor CustomerA as Browser A
    actor CustomerB as Browser B
    participant API as Booking API
    participant MySQL as MySQL Database (SELECT FOR UPDATE)
    participant Redis as Redis Pub/Sub
    participant Socket as Socket.IO Hub

    CustomerA->>API: POST /api/bookings/hold (Seat A01)
    CustomerB->>API: POST /api/bookings/hold (Seat A01)
    
    API->>MySQL: BEGIN TRANSACTION
    API->>MySQL: SELECT FOR UPDATE WHERE seat_id = A01
    
    Note over MySQL: Customer A locks seat row first
    MySQL-->>API: Seat A01 is AVAILABLE (Customer A)
    API->>MySQL: UPDATE seats SET status = HELD WHERE id = A01
    API->>MySQL: INSERT INTO seat_holds (10-min expiration)
    API->>MySQL: COMMIT TRANSACTION
    API-->>CustomerA: 200 OK (Seats Held for 10 min)
    
    API->>Redis: Publish SEAT_HELD event
    Redis->>Socket: Broadcast seat state update
    Socket-->>CustomerB: Real-time update (Seat A01 -> HELD)
    
    Note over MySQL: Customer B transaction executes next
    MySQL-->>API: Seat A01 status is HELD
    API->>MySQL: ROLLBACK TRANSACTION
    API-->>CustomerB: 409 CONFLICT (ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว)
```

### 2. 10-Minute Reservation Timer Expiration Flow
```mermaid
sequenceDiagram
    autonumber
    participant Worker as Background Worker (every 5s)
    participant DB as MySQL Database
    participant Socket as Socket.IO Hub
    participant Clients as Connected Browsers

    Worker->>DB: SELECT * FROM seat_holds WHERE expires_at < NOW()
    DB-->>Worker: Found expired holds for Seat A01
    Worker->>DB: BEGIN TRANSACTION
    Worker->>DB: UPDATE seats SET status = AVAILABLE WHERE id = A01
    Worker->>DB: UPDATE bookings SET status = EXPIRED
    Worker->>DB: DELETE FROM seat_holds WHERE id = hold_id
    Worker->>DB: COMMIT TRANSACTION
    Worker->>Socket: Broadcast (Seat A01 -> AVAILABLE)
    Socket-->>Clients: Real-time seat color change to Green across all browsers
```

### 3. Anti-Bot Verification Flow
```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> IPCheck{IP Blocked?}
    IPCheck -- Yes --> Reject[403 FORBIDDEN - IP Blocked]
    IPCheck -- No --> BotDetect{Headless / Automation Agent?}
    BotDetect -- Yes --> LogSecurity[Log Security Event & Reject 429]
    BotDetect -- No --> RateLimit{Rate Limit > 100 req/min?}
    RateLimit -- Yes --> LogRate[Log Rate Limit Event & Reject 429]
    RateLimit -- No --> Pass[Pass Request to Application Layer]
```
