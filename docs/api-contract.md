# REST API Contract & Error Standard

## Standard Error Response Format
All API endpoints return JSON error responses according to the following specification:

```json
{
  "success": false,
  "error": {
    "code": "SEAT_ALREADY_HELD",
    "message": "ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว"
  }
}
```

## Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or invalid parameters.
- `401 Unauthorized`: Authentication required (missing or invalid JWT).
- `403 Forbidden`: Insufficient role privileges.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Resource state conflict (e.g. Double booking attempt).
- `429 Too Many Requests`: Rate limit exceeded or Anti-Bot block.
- `500 Internal Server Error`: Unexpected server failure.

## Endpoints Overview
1. `POST /api/auth/register` - Customer registration
2. `POST /api/auth/login` - Customer / Admin login with JWT cookie
3. `POST /api/auth/logout` - Clear authentication session
4. `POST /api/auth/otp/verify` - OTP verification
5. `POST /api/auth/face/verify` - Liveness Face scan verification
6. `GET /api/events` - List all concerts
7. `GET /api/events/:id/seats` - Fetch real-time seat map
8. `POST /api/queue/join` - Join FIFO waiting queue
9. `POST /api/bookings/hold` - Atomic seat hold with SELECT FOR UPDATE
10. `POST /api/payments` - Initiate simulated payment
11. `POST /api/payments/verify` - Verify payment & issue E-Ticket
12. `GET /api/admin/dashboard` - Admin Overview statistics
13. `GET /api/admin/export/audit-logs` - Download Excel report
