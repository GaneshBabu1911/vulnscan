# VulnScan — AI-Enhanced Web Vulnerability Assessment Platform

<div align="center">

![VulnScan](https://img.shields.io/badge/VulnScan-v1.0.0-FFB703?style=for-the-badge&logo=shield&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=black)

**Professional automated web vulnerability scanning with OWASP ZAP, Nmap, SSL analysis, CVSS v3.1 scoring, and AI-powered remediation recommendations.**

</div>

---

## 🌐 Live Application Links

* **Backend API (Render)**: [https://vulnscan-backend-4oz4.onrender.com](https://vulnscan-backend-4oz4.onrender.com)
* **Backend Health Check**: [https://vulnscan-backend-4oz4.onrender.com/api/health](https://vulnscan-backend-4oz4.onrender.com/api/health)
* **Frontend Application (Vercel)**: [https://vulnscan-kl.vercel.app/](https://vulnscan-kl.vercel.app/)

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

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS** — custom enterprise dark theme (`#131921`, `#FFB703`)
- **Framer Motion** — smooth animations and transitions
- **Chart.js** + **react-chartjs-2** — security telemetry charts
- **React Hook Form** — input & form handling
- **Axios** — API client with JWT interceptors

### Backend
- **Python Flask 3.0** — REST API
- **SQLAlchemy** + **Flask-Migrate** — ORM and database models
- **Flask-JWT-Extended** — JWT authentication with refresh token lifecycle
- **Flask-Limiter** — endpoint rate limiting
- **Flask-Mail** — email notifications
- **ReportLab** — exportable PDF reports
- **python-nmap** — network discovery & port audit
- **requests** / **cryptography** — SSL/TLS cipher inspection

### Security Engines
- **OWASP ZAP** — Active & passive vulnerability spidering
- **Nmap** — Port & service discovery
- **Built-in fallback** — Security header & SSL validation engine

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/GaneshBabu1911/vulnscan.git
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

## 🛡️ Security Modules

### Scan Pipeline (5 Phases)

1. **HTTP Headers Analysis** — Evaluates 6+ critical security headers (CSP, HSTS, X-Frame-Options, etc.)
2. **SSL/TLS Analysis** — Certificate validity, cipher suite evaluation, protocol compliance
3. **OWASP ZAP** — Full spider and active scan with built-in heuristics fallback
4. **Nmap** — Comprehensive port audit and service enumeration
5. **AI Recommendations** — CVSS v3.1 mathematical scoring and automated mitigation advice

---

## 📝 License

MIT License — See [LICENSE](./LICENSE) for details.

---

<div align="center">
Built for modern cybersecurity and DevSecOps engineering teams
</div>
