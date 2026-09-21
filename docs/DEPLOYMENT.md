# VulnScan Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (local frontend dev)
- Python 3.11+ (local backend dev)
- PostgreSQL 15+ (production)
- OWASP ZAP (optional, for full scanning)

---

## Docker Compose (Recommended)

### Standard deployment

```bash
cp .env.example .env
# Edit .env with production secrets

docker-compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/health |
| PostgreSQL | localhost:5432 |

### With OWASP ZAP

```bash
docker-compose --profile zap up --build -d
```

ZAP API: http://localhost:8080

---

## Local Development

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Copy env and use SQLite for dev
copy ..\.env.example ..\.env
# Set DATABASE_URL=sqlite:///vulnscan.db in .env

python run.py
```

Backend: http://localhost:5000

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Set `VITE_API_URL=http://localhost:5000/api` in `.env`.

---

## Render

1. **PostgreSQL**: Create a PostgreSQL instance on Render.
2. **Backend Web Service**:
   - Root directory: `backend`
   - Environment: Docker
   - Set env vars from `.env.example`
   - `DATABASE_URL` from Render PostgreSQL
   - `FRONTEND_URL` = your static site URL
3. **Frontend Static Site**:
   - Root directory: `frontend`
   - Build: `npm run build`
   - Publish: `dist`
   - `VITE_API_URL` = your backend URL + `/api`

---

## Railway

```bash
railway init
railway add --plugin postgresql
railway up
```

Configure environment variables in the Railway dashboard.

---

## AWS EC2

```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
git clone <your-repo> && cd vulnscan
cp .env.example .env
# Edit .env with production values
docker-compose --profile zap up -d
```

Open security group ports: 80, 443, 5000 (optional).

Use nginx or ALB for HTTPS termination in production.

---

## Azure App Service

1. Push Docker images to Azure Container Registry.
2. Deploy backend and frontend as separate Web Apps.
3. Use Azure Database for PostgreSQL Flexible Server.
4. Configure application settings from `.env.example`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Flask secret |
| `JWT_SECRET_KEY` | Yes | JWT signing key |
| `DATABASE_URL` | Yes | PostgreSQL or SQLite URI |
| `FRONTEND_URL` | Yes | For email links |
| `ZAP_API_URL` | No | OWASP ZAP API endpoint |
| `AI_PROVIDER` | No | `local`, `openai`, or `ollama` |
| `MAIL_*` | No | Email notifications |
| `ADMIN_PASSWORD` | No | Initial admin password |

---

## Production Checklist

- [ ] Change `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable HTTPS
- [ ] Configure SMTP for email notifications
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Run with `--profile zap` if full scanning is needed
- [ ] Restrict ZAP API access to internal network
- [ ] Set up database backups
- [ ] Monitor logs via `/api/admin/logs`

---

## Troubleshooting

### ZAP unavailable
The scanner falls back to built-in HTTP/header checks. Start ZAP with the `zap` profile or point `ZAP_API_URL` to a running instance.

### Nmap not found
Install nmap on the host or use the Docker backend image which includes it.

### Email not sending
Verify `MAIL_USERNAME`, `MAIL_PASSWORD`, and SMTP settings. Gmail requires an app-specific password.

### CORS errors
Ensure `FRONTEND_URL` matches your frontend origin exactly.
