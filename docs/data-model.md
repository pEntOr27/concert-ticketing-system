# Data Model & ER Diagram Documentation

## Entity Relationship Diagram (Mermaid ERD)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    USERS ||--o{ BOOKINGS : places
    USERS ||--o{ TICKETS : owns
    EVENTS ||--o{ EVENT_ZONES : contains
    EVENT_ZONES ||--o{ SEATS : contains
    EVENTS ||--o{ BOOKINGS : target
    BOOKINGS ||--o{ BOOKING_ITEMS : includes
    SEATS ||--o{ BOOKING_ITEMS : reserved_in
    SEATS ||--o{ SEAT_HOLDS : currently_held
    BOOKINGS ||--o{ PAYMENTS : paid_via
    BOOKINGS ||--o{ TICKETS : issues
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ SECURITY_EVENTS : triggers

    USERS {
        string id PK
        string email UK
        string phone UK
        string password_hash
        string status
        datetime face_verified_at
    }

    EVENTS {
        string id PK
        string name
        string artist
        datetime event_date
        string status
    }

    SEATS {
        string id PK
        string zone_id FK
        string seat_number
        string status
    }

    BOOKINGS {
        string id PK
        string booking_number UK
        string user_id FK
        decimal total_amount
        string status
    }

    SEAT_HOLDS {
        string id PK
        string seat_id FK
        string user_id FK
        datetime expires_at
    }

    PAYMENTS {
        string id PK
        string booking_id FK
        string payment_method
        decimal amount
        string status
    }

    TICKETS {
        string id PK
        string ticket_code UK
        string seat_id FK
        string status
    }
```

## Primary Key, Foreign Key & Unique Indexes
- `users`: Primary Key `id`, Unique Index on `email`, `phone`, `uuid`.
- `user_roles`: Composite Unique Index `[user_id, role_id]`.
- `seats`: Composite Unique Index `[zone_id, seat_number]`.
- `seat_holds`: Unique Index on `hold_token`. Foreign Keys to `seats(id)`, `users(id)`, `bookings(id)`.
- `bookings`: Unique Index on `booking_number`.
- `tickets`: Unique Index on `ticket_code`.
