# VulnScan API Documentation

Base URL: `http://localhost:5000/api` (development) or `/api` (Docker/nginx proxy)

All authenticated endpoints require header:

```
Authorization: Bearer <access_token>
```

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Service health check |

**Response:**
```json
{ "status": "healthy", "service": "VulnScan API" }
```

---

## Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login and receive JWT |
| POST | `/logout` | Yes | Logout |
| POST | `/refresh` | Refresh token | Refresh access token |
| POST | `/forgot-password` | No | Request password reset email |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/verify-email` | No | Verify email with token |
| GET | `/me` | Yes | Current user profile |
| POST | `/change-password` | Yes | Change password |

### POST `/auth/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### POST `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { "id": 1, "username": "johndoe", "role": "user" }
}
```

---

## Scanning (`/scan`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/start` | Yes | Start vulnerability scan |
| GET | `/{id}/status` | Yes | Scan status and results |
| GET | `/{id}/logs` | Yes | Real-time scan logs |
| GET | `/active` | Yes | List active scans |

### POST `/scan/start`

```json
{
  "url": "https://example.com",
  "domain": "example.com",
  "ip_address": "93.184.216.34"
}
```

Scan phases: HTTP headers → SSL/TLS → OWASP ZAP → Nmap → AI recommendations.

---

## Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Yes | Dashboard statistics |
| GET | `/analytics` | Yes | Chart data |

### GET `/dashboard/stats`

Returns: `total_scans`, `severity_counts`, `avg_risk_score`, `open_ports`, `recent_scans`, `recent_activity`

### GET `/dashboard/analytics`

Returns: `severity_distribution`, `monthly_scans`, `risk_trend`

---

## History (`/history`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Paginated scan history |
| GET | `/{id}` | Yes | Scan detail with vulnerabilities |
| DELETE | `/{id}` | Yes | Delete scan |

Query params: `page`, `per_page`, `status`

---

## Reports (`/reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate/{scan_id}` | Yes | Generate report |
| GET | `/download/{report_id}` | Yes | Download report file |
| GET | `/scan/{scan_id}` | Yes | List reports for scan |

### POST `/reports/generate/{scan_id}`

```json
{ "format": "pdf" }
```

Supported formats: `pdf`, `csv`, `json`

---

## Profile (`/profile`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get profile |
| PUT | `/` | Yes | Update profile |
| GET | `/notifications` | Yes | List notifications |
| PUT | `/notifications/{id}/read` | Yes | Mark notification read |
| PUT | `/notifications/read-all` | Yes | Mark all read |

---

## Admin (`/admin`)

Requires `role: admin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| DELETE | `/users/{id}` | Delete user |
| PUT | `/users/{id}/suspend` | Toggle suspend |
| GET | `/scans` | All scan history |
| GET | `/analytics` | System analytics |
| GET | `/logs` | Activity logs |

---

## Error Responses

```json
{ "error": "Human-readable message" }
```

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden (role or ownership) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 429 | Rate limit exceeded |

---

## Rate Limits

- Auth register: 10/hour
- Auth login: 20/hour
- Forgot password: 5/hour
- Scan start: 10/hour
- Default: 200/hour

---

## Default Admin

- Email: `admin@vulnscan.io`
- Password: Set via `ADMIN_PASSWORD` env var (default `Admin@123456`)
