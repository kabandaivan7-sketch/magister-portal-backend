# 🚀 MAGISTER PORTAL - PRODUCTION DEPLOYMENT GUIDE (COPY)

**Status:** Production-ready deployment guide (reproduced)

---

## Quick Start (Railway - Recommended)

1. Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Push code to GitHub:
```bash
cd "C:\Users\Dell\Magister Portal Website"
git add .
git commit -m "Prepare for production"
git push origin main
```

3. Create Railway project, connect GitHub, select repo.

4. Add environment variables in Railway (see `.env.example`):
- NODE_ENV=production
- PORT=3000
- JWT_SECRET=... (from step 1)
- MONGODB_URI=your-mongodb-uri
- EMAIL_SERVICE=gmail
- EMAIL_USER=you@example.com
- EMAIL_PASSWORD=your-app-password
- ADMIN_EMAIL=admin@yourdomain.com
- FRONTEND_URL=https://yourdomain.com
- ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

5. Deploy and verify `/api/health`.

---

## Detailed Steps

### MongoDB Atlas
- Create project & cluster on MongoDB Atlas (M0 free available).
- Create a database user and copy the connection string.
- Set `MONGODB_URI` in environment variables.

### Gmail (Email for recovery)
- Enable 2FA and create an App Password.
- Set `EMAIL_USER` and `EMAIL_PASSWORD` in environment variables.

### Docker (Alternate)
- Build image:
```bash
docker build -t magister-portal:latest .
```
- Run with `.env`:
```bash
docker run --env-file .env -p 3000:3000 --name magister-portal magister-portal:latest
```

### Local testing
- Use `.env.local` for development only (do not commit).
- Start server:
```bash
node server.js
```
- Health check:
```bash
curl http://localhost:3000/api/health
```

### Post-deploy verification
- Health endpoint returns 200.
- Signup/login flows (requires DB).
- Contact form sends email (requires EMAIL_*).

---

## Environment variables (minimum)
- `JWT_SECRET` (required)
- `MONGODB_URI` (required)
- `EMAIL_USER`, `EMAIL_PASSWORD` (required for email)
- `FRONTEND_URL`, `ALLOWED_ORIGINS` (recommended)
- `PORT`, `NODE_ENV`, `LOG_LEVEL` (optional)

---

## Troubleshooting
- If server logs `Missing required environment variables`, set them in your host.
- If email fails, verify Gmail app password and 2FA.
- If MongoDB fails, check IP whitelist and connection string.

---

## Notes
- Use `.env.example` as template; never commit real `.env`.
- Docker image excludes dev/test files via `.dockerignore`.
- For production, use process managers (PM2) or the host's process control.

---

**End of reproduced guide**
