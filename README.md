# Magister Portal Backend

This repository contains the backend for the Magister Portal website — an Express.js server with MongoDB persistence that serves static HTML pages and exposes API endpoints for authentication, posts, contact, and password recovery.

## Quick start (development)

- Install dependencies:

```bash
npm install
```

- Start in development mode (nodemon):

```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

## Required environment variables

Set these in your environment or a `.env` file before running in production:

- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Strong secret used to sign JWTs (required)
- `EMAIL_USER` - SMTP username (for sending contact / recovery emails)
- `EMAIL_PASSWORD` - SMTP password or app password
- `EMAIL_SERVICE` - (optional) nodemailer service name (default: `gmail`)
- `ADMIN_EMAIL` - (optional) email to receive contact messages
- `FRONTEND_URL` - (optional) used to build recovery links (default: `http://localhost:3000`)
- `PORT` - (optional) port to run the server on (default: `3000`)
- `NODE_ENV` - set to `production` in production

### S3 Upload Configuration (optional)

To enable S3 uploads for media instead of local storage:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `S3_BUCKET` - S3 bucket name

If these are not set, uploads will be stored locally in the `uploads/` directory.

Example `.env` (do not commit):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.example.mongodb.net/magister
JWT_SECRET=replace-with-a-very-long-secret
EMAIL_USER=you@example.com
EMAIL_PASSWORD=app-password
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=https://your-frontend.example.com
NODE_ENV=production
PORT=3000
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

## Production deployment (recommended steps)

1. Ensure `MONGODB_URI` and `JWT_SECRET` are set.
2. Use a process manager such as PM2. An example `ecosystem.config.js` is provided.

Start with PM2:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 logs magister-portal
```

3. Configure HTTPS (nginx as reverse proxy) or use a platform that provides TLS (Railway, Render, etc.).
4. For uploaded files, do not rely on ephemeral filesystem (Heroku, Railway). Use S3 or a mounted persistent volume and update `routes/posts.js` to save to S3 or the volume.
5. Monitor logs and set up log rotation (PM2 Logrotate recommended).

### Docker (recommended for reproducible deployments)

This repository includes a `Dockerfile` and `docker-compose.yml` to run the app together with a local MongoDB instance.

- Build and run with Docker Compose:

```bash
# Build images and start services
docker compose up --build -d

# See logs
docker compose logs -f app

# Stop services
docker compose down
```

- The `docker-compose.yml` mounts `./uploads` and `./logs` to the container so uploaded files persist on the host. Ensure those directories exist or Docker will create them.

- In compose the default `MONGODB_URI` points to the included `mongo` service. For production, replace with a managed MongoDB URI and remove the `mongo` service if not needed.

- To run the container image alone:

```bash
# Build image
docker build -t magister-portal:latest .

# Run (example)
docker run -e MONGODB_URI="mongodb://mongo:27017/magisterportal" -p 3000:3000 --name magister-portal magister-portal:latest
```


## Notes & security

- Change the default JWT secret; never commit secrets.
- Add `uploads/` to `.gitignore` (done).
- The code logs a reset token when email is not configured — that is intended for development only.
- Run `npm audit` and review vulnerabilities before exposing to the public internet.

## CI/CD Pipeline

A GitHub Actions workflow is configured in `.github/workflows/ci-cd.yml` that:

1. Runs on every push to `main` and `develop` branches
2. Installs dependencies and runs tests (if tests exist)
3. Builds and pushes a Docker image to GitHub Container Registry on main branch
4. Runs security scans (npm audit and optional Snyk)

To enable Docker image builds, ensure your repository has push access to GitHub Container Registry. The workflow uses GitHub's built-in GITHUB_TOKEN.

For Snyk security scans, set `SNYK_TOKEN` in your repository secrets.


## Useful scripts

- `npm run dev` — start dev server with `nodemon`.
- `npm start` — start production server (`node server.js`).
- `npm run pm2:start` — start via PM2 using `ecosystem.config.js`.

## Files of interest

- `server.js` — main server and middleware setup
- `routes/` — API routes (`auth.js`, `posts.js`, `contact.js`, `recovery.js`)
- `models/` — Mongoose models
- `middleware/` — auth and error handling

If you want, I can:

- Add S3 upload support and migrate `routes/posts.js` to use S3,
- Harden `server.js` mongoose options to remove deprecation warnings,
- Create a Dockerfile and Docker Compose for deployment.

