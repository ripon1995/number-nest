# Docker Quick Reference Cheatsheet

## Common Commands

### Starting & Stopping

```bash
# Start all services (build if needed)
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
```

### Viewing Logs

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo

# Follow logs in real-time (like tail -f)
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Rebuilding

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Force rebuild (no cache)
docker-compose build --no-cache backend

# Rebuild and start
docker-compose up --build
```

### Executing Commands in Containers

```bash
# Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Access MongoDB shell
docker-compose exec mongo mongosh

# Access container bash
docker-compose exec backend bash
docker-compose exec frontend sh  # Alpine uses sh, not bash

# Run one-off command
docker-compose run backend python manage.py test
```

### Inspecting

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker ps -a

# Inspect container details
docker inspect number-nest-backend-1

# View container resource usage
docker stats

# Check logs for specific container
docker logs number-nest-backend-1
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose down

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (⚠️ nuclear option)
docker system prune -a --volumes

# See disk usage
docker system df
```

---

## Configuration Files Quick Reference

### backend/Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--workers=2", "--bind=0.0.0.0:8000", "config.wsgi:application"]
```

**When to rebuild:** Changes to requirements.txt or code

---

### frontend/Dockerfile

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
ARG VITE_BASE_URL=http://localhost:8000
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**When to rebuild:** Changes to package.json, code, or VITE_BASE_URL

---

### docker-compose.yaml

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend
      - MONGO_URI=mongodb://mongo:27017/number_nest
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      args:
        VITE_BASE_URL: http://localhost:8000
    ports:
      - "3000:80"

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

### frontend/nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Troubleshooting

### Issue: 400 Bad Request

**Check:**
```bash
# Verify ALLOWED_HOSTS in container
docker-compose exec backend python -c "from config.settings import ALLOWED_HOSTS; print(ALLOWED_HOSTS)"
```

**Fix:**
```python
# backend/config/settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'backend']
```

---

### Issue: CORS Error

**Check:**
```bash
# Verify CORS settings
docker-compose exec backend python -c "from config.settings import CORS_ALLOWED_ORIGINS; print(CORS_ALLOWED_ORIGINS)"
```

**Fix:**
```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

### Issue: Frontend Can't Connect to Backend

**Symptom:** `ERR_NAME_NOT_RESOLVED` for `http://backend:8000`

**Fix:**
```yaml
# docker-compose.yaml - Use localhost, not backend
frontend:
  build:
    args:
      VITE_BASE_URL: http://localhost:8000  # ✅ Correct
```

**Rebuild required:**
```bash
docker-compose down
docker-compose up --build
```

---

### Issue: MongoDB Connection Failed

**Check if MongoDB is ready:**
```bash
docker-compose logs mongo | grep "Waiting for connections"
```

**Connect to MongoDB:**
```bash
docker-compose exec mongo mongosh
> use number_nest
> show collections
> db.user.find()
```

---

### Issue: Port Already in Use

**Symptom:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:8000: bind: address already in use
```

**Find process using port:**
```bash
# macOS/Linux
lsof -i :8000
kill -9 <PID>

# Or change port in docker-compose.yaml
ports:
  - "8001:8000"  # Use 8001 on host instead
```

---

### Issue: Changes Not Reflected

**For Backend:**
```bash
# Code changes: Restart container
docker-compose restart backend

# Dependency changes: Rebuild
docker-compose up --build backend
```

**For Frontend:**
```bash
# Code changes: Always rebuild (static files)
docker-compose up --build frontend

# URL changes: Must rebuild
docker-compose build --no-cache frontend
```

---

## Environment Variables

### .env file (project root)

```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
MONGO_URI=mongodb://mongo:27017/number_nest
```

### Override in docker-compose.yaml

```yaml
environment:
  - DEBUG=True  # Overrides .env
  - SECRET_KEY=${SECRET_KEY}  # Uses .env value
```

### Check environment in container

```bash
docker-compose exec backend env | grep SECRET_KEY
```

---

## Useful One-Liners

```bash
# Restart everything
docker-compose restart

# View all container IPs
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)

# Remove all unused Docker resources
docker system prune -af

# Follow logs for multiple services
docker-compose logs -f backend frontend

# Check which ports are exposed
docker-compose ps

# Export database
docker-compose exec mongo mongodump --archive > backup.archive

# Import database
docker-compose exec -T mongo mongorestore --archive < backup.archive

# Check container health
docker-compose ps
docker inspect --format='{{.State.Health.Status}}' number-nest-backend-1

# View container resource limits
docker stats number-nest-backend-1

# Copy files from container to host
docker cp number-nest-backend-1:/app/logs/. ./logs/

# Copy files from host to container
docker cp ./config.py number-nest-backend-1:/app/
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repo>
cd number-nest

# 2. Create .env file
cp .env.example .env
# Edit .env with your values

# 3. Build and start
docker-compose up --build -d

# 4. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Making Changes

**Backend code changes:**
```bash
# Changes automatically picked up on restart
docker-compose restart backend
```

**Frontend code changes:**
```bash
# Need rebuild (static files)
docker-compose up --build frontend
```

**Database migrations:**
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

**Install new dependency:**
```bash
# Backend (Python)
# 1. Add to requirements.txt
# 2. Rebuild
docker-compose build backend
docker-compose up -d backend

# Frontend (Node)
# 1. Add to package.json
# 2. Rebuild
docker-compose build frontend
docker-compose up -d frontend
```

---

## URLs Reference

| Service  | Internal Docker Network | Host (Your Computer) | Used By |
|----------|------------------------|----------------------|---------|
| Frontend | http://frontend:80 | http://localhost:3000 | Browser |
| Backend  | http://backend:8000 | http://localhost:8000 | Browser (via JS) |
| MongoDB  | mongodb://mongo:27017 | (not exposed) | Backend only |

**Key Insight:**
- Browser uses `localhost:3000` and `localhost:8000`
- Backend uses `mongo:27017` internally
- Frontend (static files) → must use `localhost:8000` (baked in at build time)

---

## Production Checklist

Before deploying to production:

```bash
# ✅ Security
- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Set up HTTPS/SSL
- [ ] Use environment-specific .env files
- [ ] Don't commit .env to git

# ✅ Database
- [ ] Use external MongoDB (not container)
- [ ] Set up database backups
- [ ] Configure proper authentication

# ✅ Performance
- [ ] Increase Gunicorn workers
- [ ] Set up Redis for caching
- [ ] Configure static file serving (CDN)
- [ ] Enable gzip compression

# ✅ Monitoring
- [ ] Set up logging
- [ ] Configure health checks
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Set up alerts

# ✅ Docker
- [ ] Remove --build flag in production
- [ ] Use specific image tags (not :latest)
- [ ] Set resource limits
- [ ] Use Docker secrets for sensitive data
```

---

## Getting Help

```bash
# Docker documentation
docker --help
docker-compose --help

# View full docker-compose configuration
docker-compose config

# Validate docker-compose.yaml
docker-compose config --quiet

# View Docker version
docker --version
docker-compose --version

# Check Docker daemon status
docker info
```

---

## Quick Debugging

```bash
# Container won't start?
docker-compose logs <service-name>

# Database connection issues?
docker-compose exec backend python manage.py dbshell

# Network issues?
docker network inspect number-nest_default

# Performance issues?
docker stats

# Disk space issues?
docker system df
docker system prune
```