# VulnScan — AI-Enhanced Web Vulnerability Assessment Platform

<div align="center">

![VulnScan](https://img.shields.io/badge/VulnScan-v1.0.0-00ff41?style=for-the-badge&logo=shield&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Professional automated web vulnerability scanning with OWASP ZAP, Nmap, SSL analysis, CVSS v3.1 scoring, and AI-powered remediation recommendations.**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-Vector Scanning** | HTTP security headers, SSL/TLS, OWASP ZAP active/passive, Nmap port scanning |
| **CVSS v3.1 Scoring** | Industry-standard risk scoring for every vulnerability |
| **AI Recommendations** | Contextual remediation using local rules, OpenAI GPT, or Ollama |
| **Report Generation** | PDF, CSV, and JSON reports via ReportLab |
| **JWT Authentication** | Secure login with refresh tokens, email verification, password reset |
| **Role-Based Access** | Admin and user roles with full management console |
| **Real-Time Logs** | Live terminal output during scans with phase indicators |
| **Analytics Dashboard** | Charts for severity distribution, monthly trends, risk timeline |
| **Docker Ready** | Single `docker-compose up` to run everything |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** — custom cyber/dark theme
- **Framer Motion** — animations and transitions
- **Chart.js** + **react-chartjs-2** — analytics charts
- **React Hook Form** — form validation
- **Axios** — API client with JWT interceptor

### Backend
- **Python Flask 3.0** — REST API
- **SQLAlchemy** + **Flask-Migrate** — ORM with migrations
- **Flask-JWT-Extended** — JWT auth with refresh tokens
- **Flask-Limiter** — rate limiting
- **Flask-Mail** — email notifications
- **ReportLab** — PDF generation
- **python-nmap** — Nmap integration
- **requests** — HTTP/SSL analysis

### Security Tools
- **OWASP ZAP** (optional) — Active + passive vulnerability scanning
- **Nmap** (optional) — Port and service discovery
- **Built-in fallback** — Header analysis + SSL checks when tools unavailable

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### 1. Clone and Setup

```bash
git clone <repo-url>
cd vulnscan
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac
# Edit .env with your settings

# Run
python run.py
```

Backend runs on: **http://localhost:5000**

> **Default admin account:** `admin@vulnscan.io` / `Admin@123456`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🐳 Docker Deployment

### Standard (no ZAP)
```bash
cp .env.example .env
# Edit .env with production values

docker-compose up --build
```

### With OWASP ZAP
```bash
docker-compose --profile zap up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ZAP (if enabled): http://localhost:8080

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | *(required)* | Flask secret key |
| `JWT_SECRET_KEY` | *(required)* | JWT signing key |
| `DATABASE_URL` | SQLite | PostgreSQL connection string for production |
| `ADMIN_PASSWORD` | `Admin@123456` | Default admin password |
| `AI_PROVIDER` | `local` | `local`, `openai`, or `ollama` |
| `OPENAI_API_KEY` | — | OpenAI API key (if using OpenAI) |
| `ZAP_API_URL` | `http://localhost:8080` | ZAP API endpoint |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for email links |
| `MAIL_SERVER` | `smtp.gmail.com` | SMTP server for emails |

### AI Provider Configuration

```bash
# Local (rule-based, no API key needed)
AI_PROVIDER=local

# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Ollama (local LLM)
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/change-password` | Change password |

### Scanning
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan/start` | Start new scan |
| GET | `/api/scan/:id/status` | Get scan status |
| GET | `/api/scan/:id/logs` | Get scan logs |
| GET | `/api/scan/active` | List active scans |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/analytics` | Analytics data |

### History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/history/` | List scans (paginated) |
| GET | `/api/history/:id` | Scan details with vulnerabilities |
| DELETE | `/api/history/:id` | Delete scan |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports/generate/:scan_id` | Generate report `{ format: "pdf" }` |
| GET | `/api/reports/download/:report_id` | Download report file |
| GET | `/api/reports/scan/:scan_id` | List reports for scan |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/suspend` | Suspend/unsuspend user |
| GET | `/api/admin/scans` | All scans |
| GET | `/api/admin/analytics` | System analytics |
| GET | `/api/admin/logs` | Activity logs |

---

## 🛡️ Security Modules

### Scan Pipeline (5 Phases)

1. **HTTP Headers Analysis** — Checks 6+ security headers (CSP, HSTS, X-Frame-Options, etc.)
2. **SSL/TLS Analysis** — Certificate validity, expiry, protocol versions, cipher strength
3. **OWASP ZAP** — Full spider + active scan (falls back to built-in checker if ZAP unavailable)
4. **Nmap** — Port scan, service detection (skips gracefully if nmap not installed)
5. **AI Recommendations** — CVSS scoring + contextual remediation advice

---

## ☁️ Cloud Deployment

### Render (Free Tier)

1. Push to GitHub
2. Create a new Web Service pointing to `/backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn run:app`
5. Add environment variables from `.env.example`

### Railway

1. Connect GitHub repository
2. Deploy `/backend` as Python service
3. Deploy `/frontend` as Static Site
4. Set environment variables

### AWS EC2 / Azure

Use the provided `docker-compose.yml` with `--profile zap` flag for full ZAP support.

---

## 📝 License

MIT License — See [LICENSE](./LICENSE) for details.

---

<div align="center">
Built with 💚 for the security community
</div>
