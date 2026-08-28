# Test Plan & Strategy

## Test Levels
1. **Unit Testing**: Vitest test runner validating cryptographic utility functions, discount formulas, and OTP validation.
2. **Integration Testing**: Testing MySQL transactions and Redis queue interactions.
3. **Critical Concurrency Testing**: Testing simultaneous seat hold attempts (verifying 1 success, 1 409 conflict).
4. **End-to-End (E2E) Testing**: Playwright testing full user registration, seat selection, admin login, and PDF ticket generation.
