# Complete Docker Guide for Number Nest

## Table of Contents
1. [Why Docker is More Complex Than Local Development](#why-docker-is-complex)
2. [Network Architecture Diagrams](#network-architecture)
3. [Step-by-Step Dockerization Guide](#dockerization-guide)
4. [Common Issues and Solutions](#common-issues)

---

## Why Docker is More Complex Than Local Development {#why-docker-is-complex}

### Local Development (Simple)

When you run `npm run dev` and `python manage.py runserver`:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Computer                        │
│                                                         │
│  ┌──────────┐    localhost:5173                        │
│  │ Browser  │─────────────────┐                        │
│  └──────────┘                 │                        │
│       │                       ▼                        │
│       │              ┌─────────────────┐               │
│       │              │  Vite Dev Server│               │
│       │              │  (Frontend)     │               │
│       │              │  Port: 5173     │               │
│       │              └─────────────────┘               │
│       │                       │                        │
│       │                       │ API calls              │
│       │                       │ http://localhost:8000  │
│       │                       ▼                        │
│       │              ┌─────────────────┐               │
│       │              │  Django Server  │               │
│       │              │  (Backend)      │               │
│       │              │  Port: 8000     │               │
│       │              └─────────────────┘               │
│       │                       │                        │
│       │                       │                        │
│       │                       ▼                        │
│       │              ┌─────────────────┐               │
│       │              │  MongoDB        │               │
│       │              │  Port: 27017    │               │
│       │              └─────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Why it's simple:**
- Everything runs on `localhost`
- All services share the same network interface
- Browser can directly access both frontend and backend
- No network translation needed

---

### Docker Development (Complex)

With Docker, you have **TWO separate networks**:

```
┌────────────────────────────────────────────────────────────────────┐
│                         Your Computer (Host)                       │
│                                                                    │
│  ┌──────────┐                                                     │
│  │ Browser  │                                                     │
│  └──────────┘                                                     │
│       │                                                           │
│       │ localhost:3000          localhost:8000                    │
│       │ (Port forwarded)        (Port forwarded)                  │
│       │                                                           │
│ ──────┼───────────────────────────────────────────────────────── │
│       │         Docker Bridge Network (Isolated)                  │
│       │                                                           │
│       ▼                              ▲                            │
│  ┌─────────────┐                     │                            │
│  │  Nginx      │                     │                            │
│  │  Container  │──────────────┐      │                            │
│  │  Port: 80   │              │      │                            │
│  │  (frontend) │              │      │                            │
│  └─────────────┘              │      │                            │
│  Exposed: 3000                │      │                            │
│                               │      │                            │
│                               │      │                            │
│                               ▼      │                            │
│                    ┌────────────────────────┐                     │
│                    │  Static Files          │                     │
│                    │  (Built React App)     │                     │
│                    │  Baked in:             │                     │
│                    │  VITE_BASE_URL         │                     │
│                    └────────────────────────┘                     │
│                               │                                   │
│                               │ Makes API calls to:               │
│                               │ http://localhost:8000             │
│                               │ (exits container, goes to host)   │
│                               │                                   │
│                               └───────────────┐                   │
│                                               │                   │
│                                               ▼                   │
│                                    ┌─────────────────┐            │
│                                    │  Gunicorn       │            │
│                                    │  Container      │            │
│                                    │  Port: 8000     │            │
│                                    │  (backend)      │            │
│                                    └─────────────────┘            │
│                                    Exposed: 8000                  │
│                                               │                   │
│                                               │                   │
│                                               │ mongodb://mongo   │
│                                               │ (internal network)│
│                                               ▼                   │
│                                    ┌─────────────────┐            │
│                                    │  MongoDB        │            │
│                                    │  Container      │            │
│                                    │  Port: 27017    │            │
│                                    └─────────────────┘            │
│                                    NOT exposed to host            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Why it's complex:**

1. **Two Network Layers:**
   - **Host Network:** Where your browser lives
   - **Docker Network:** Where containers talk to each other

2. **Different URLs in Different Contexts:**
   - Browser → Frontend: `http://localhost:3000`
   - Browser → Backend: `http://localhost:8000`
   - Frontend (built files) → Backend: `http://localhost:8000` (must exit container)
   - Backend → MongoDB: `http://mongo:27017` (internal Docker network)

3. **Build Time vs Runtime:**
   - Frontend code is **built once** with hardcoded URLs
   - If you build with `VITE_BASE_URL=http://backend:8000`, browser can't access it
   - Must build with `VITE_BASE_URL=http://localhost:8000`

4. **Security Restrictions:**
   - Django's `ALLOWED_HOSTS` validates incoming requests
   - CORS must allow the origin making requests
   - Nginx needs proper configuration for client-side routing

---

## Network Architecture {#network-architecture}

### Request Flow: User Login

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User opens http://localhost:3000                       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser requests HTML from Nginx container                      │
│ Request: GET http://localhost:3000/                            │
│ ───────────────────────────────────────────                    │
│ Port Mapping: localhost:3000 → container:80                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Nginx serves /usr/share/nginx/html/index.html                  │
│ This includes React code + bundled JavaScript                   │
│ JavaScript contains: const API_URL = "http://localhost:8000"    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: User fills login form and clicks submit                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ React code makes API call (from browser, not Nginx!)           │
│ Request: POST http://localhost:8000/auth/api/login/            │
│ Body: { phone_number: "123", password: "pass" }                │
│ Headers: { Content-Type: "application/json" }                  │
│ ───────────────────────────────────────────                    │
│ This request EXITS the Docker network and goes to host         │
│ Port Mapping: localhost:8000 → backend-container:8000          │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gunicorn receives request in backend container                 │
│ Django checks:                                                  │
│   1. Is "localhost" in ALLOWED_HOSTS? → Must be YES            │
│   2. Is origin "http://localhost:3000" allowed? → Check CORS   │
│   3. Validate request data                                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend needs to query database                                 │
│ Request: mongodb://mongo:27017/number_nest                      │
│ ───────────────────────────────────────────                    │
│ This uses INTERNAL Docker network                               │
│ "mongo" resolves to MongoDB container's internal IP             │
│ NO port forwarding needed (stays inside Docker)                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ MongoDB returns user data                                       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend generates JWT token and sends response                  │
│ Response: { success: true, data: { access: "...", ... } }      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser receives response and stores token                      │
│ localStorage.setItem('access_token', token)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Dockerization Guide {#dockerization-guide}

### Prerequisites

```bash
# Check Docker is installed
docker --version

# Check Docker Compose is installed
docker-compose --version
```

---

### Step 1: Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--workers=2", "--bind=0.0.0.0:8000", "config.wsgi:application"]
```

**Why each line:**

| Line | Why | How |
|------|-----|-----|
| `FROM python:3.12-slim` | Need Python runtime to run Django | Uses official Python image (slim = smaller size) |
| `WORKDIR /app` | Set working directory inside container | All subsequent commands run from /app |
| `COPY requirements.txt .` | Copy dependencies first (layer caching) | If code changes but deps don't, Docker reuses this layer |
| `RUN pip install -r requirements.txt` | Install Python packages | Runs once during build, not on every startup |
| `COPY . .` | Copy all application code | Copies backend/ contents to /app in container |
| `CMD ["gunicorn", ...]` | Production server command | Gunicorn is more robust than `runserver` |

**Why Gunicorn instead of runserver?**
- `runserver` is single-threaded (1 request at a time)
- `runserver` is for development only
- Gunicorn handles multiple workers and is production-ready

---

### Step 2: Frontend Dockerfile

**File:** `frontend/Dockerfile`

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
EXPOSE 80
```

**Why Multi-Stage Build:**

```
Stage 1: Build Stage
┌─────────────────────────┐
│  node:20 (1.2 GB)       │
│  + node_modules (200MB) │  ──→  Compiles React  ──→  /app/dist/
│  + source code          │                              (5 MB)
└─────────────────────────┘
         ↓
         ↓ Only copy /app/dist
         ↓
Stage 2: Production Stage
┌─────────────────────────┐
│  nginx:alpine (40 MB)   │
│  + /app/dist (5 MB)     │  ──→  Final image: 45 MB
└─────────────────────────┘
```

**Why each line:**

| Line | Why | How |
|------|-----|-----|
| `FROM node:20 AS build` | Need Node.js to build React app | AS build names this stage |
| `WORKDIR /app` | Set working directory | Standard practice |
| `COPY package*.json .` | Copy deps first (layer caching) | npm install only reruns if package.json changes |
| `RUN npm install` | Install dependencies | Downloads node_modules |
| `COPY . .` | Copy source code | All frontend code |
| `ARG VITE_BASE_URL=...` | Accept build argument | Can override when building |
| `ENV VITE_BASE_URL=$VITE_BASE_URL` | Set as environment variable | Vite reads this during build |
| `RUN npm run build` | Build production bundle | Creates /app/dist with optimized files |
| `FROM nginx:alpine` | Start fresh with nginx | Discards node:20 (saves ~1GB) |
| `COPY --from=build /app/dist ...` | Copy only built files | Takes from previous stage |
| `EXPOSE 80` | Document which port nginx uses | Informational |

**Critical Insight: Build-time URLs**

```javascript
// This code in React:
const API_URL = import.meta.env.VITE_BASE_URL;

// Becomes this in built files:
const API_URL = "http://localhost:8000";
```

The URL is **baked into the JavaScript bundle** at build time. You cannot change it at runtime!

---

### Step 3: Docker Compose Configuration

**File:** `docker-compose.yaml`

```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      - DEBUG=True
      - SECRET_KEY=${SECRET_KEY}
      - MONGO_URI=mongodb://mongo:27017/number_nest?tls=false
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      args:
        VITE_BASE_URL: http://localhost:8000
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_DATABASE: number_nest
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

**Why each section:**

#### Backend Service

| Config | Why | How |
|--------|-----|-----|
| `build: ./backend` | Build from Dockerfile | Docker looks for backend/Dockerfile |
| `ports: "8000:8000"` | Expose backend to host | Format: host_port:container_port |
| `env_file: .env` | Load environment variables | Reads .env file in project root |
| `environment:` | Override specific env vars | Takes precedence over .env |
| `DEBUG=True` | Enable Django debug mode | Shows detailed errors |
| `MONGO_URI=mongodb://mongo:27017/...` | Connect to MongoDB container | "mongo" is service name (DNS) |
| `ALLOWED_HOSTS=localhost,127.0.0.1,backend` | Allow these hosts | Django security check |
| `depends_on: - mongo` | Start mongo first | Ensures DB is up |

**Why ALLOWED_HOSTS is critical:**

```python
# Django's host validation (simplified):
def validate_host(request):
    host = request.get_host()  # "localhost:8000"
    if host not in ALLOWED_HOSTS:
        raise DisallowedHost(f"Invalid HTTP_HOST: {host}")
```

If empty, Django rejects ALL requests when `DEBUG=False`.

#### Frontend Service

| Config | Why | How |
|--------|-----|-----|
| `build: context: ./frontend` | Build from Dockerfile | More options than simple string |
| `args: VITE_BASE_URL: ...` | Pass build argument | Overrides ARG in Dockerfile |
| `ports: "3000:80"` | Expose nginx to host | Host port 3000 → container port 80 |
| `depends_on: - backend` | Start backend first | Logical ordering |

#### MongoDB Service

| Config | Why | How |
|--------|-----|-----|
| `image: mongo:7` | Use official MongoDB image | No Dockerfile needed |
| `MONGO_INITDB_DATABASE` | Create database on first run | Database name |
| `volumes: - mongo_data:/data/db` | Persist data | Data survives container restarts |

**Why volumes are important:**

```
Without volume:
Container created → Data written → Container deleted → DATA LOST

With volume:
Container created → Data written to volume → Container deleted → DATA PERSISTS
```

#### Docker Networks (Automatic)

```
Docker Compose automatically creates:
┌────────────────────────────────────┐
│   number-nest_default (bridge)    │
│                                    │
│   ┌──────────┐  ┌──────────┐     │
│   │ backend  │  │ mongo    │     │
│   │ 8000     │  │ 27017    │     │
│   └──────────┘  └──────────┘     │
│                                    │
│   DNS resolution:                  │
│   "mongo" → 172.18.0.3             │
│   "backend" → 172.18.0.2           │
└────────────────────────────────────┘
```

Services can reach each other by name (mongo, backend, frontend).

---

### Step 4: Django Settings Configuration

**File:** `backend/config/settings.py`

**Changes needed:**

```python
# ❌ WRONG: Empty list
ALLOWED_HOSTS = []

# ✅ CORRECT: Accept requests from these hosts
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
```

**Why CORS is needed:**

```
Browser security (Same-Origin Policy):
┌─────────────────────────────────────┐
│ Page origin: http://localhost:3000 │
│ API origin:  http://localhost:8000  │
│                                     │
│ Different ports = Different origins │
│ → Browser blocks request by default │
└─────────────────────────────────────┘

CORS headers tell browser: "It's okay, allow it"
```

**Add CORS configuration:**

```python
# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Docker nginx
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

### Step 5: Build and Run

```bash
# Stop any existing containers
docker-compose down

# Remove old images (optional, forces rebuild)
docker-compose down --rmi all

# Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check running containers
docker-compose ps
```

**What happens during build:**

```
Step 1: docker-compose up --build
  ↓
Step 2: Build backend image
  ├─ FROM python:3.12-slim
  ├─ COPY requirements.txt
  ├─ RUN pip install
  └─ COPY code
  ↓
Step 3: Build frontend image
  ├─ FROM node:20
  ├─ COPY package.json
  ├─ RUN npm install
  ├─ COPY code
  ├─ RUN npm run build (with VITE_BASE_URL=http://localhost:8000)
  ├─ FROM nginx:alpine
  └─ COPY dist files
  ↓
Step 4: Create network
  └─ number-nest_default (bridge)
  ↓
Step 5: Start containers
  ├─ mongo (port 27017 internal only)
  ├─ backend (port 8000 → host:8000)
  └─ frontend (port 80 → host:3000)
```

---

## Common Issues and Solutions {#common-issues}

### Issue 1: 400 Bad Request on Login

**Symptom:**
```
POST http://localhost:8000/auth/api/login/
Status: 400 Bad Request
```

**Cause:** `ALLOWED_HOSTS` is empty or doesn't include "localhost"

**Solution:**
```python
# settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'backend']
```

---

### Issue 2: CORS Error

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:8000/auth/api/login/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** Backend doesn't allow requests from frontend origin

**Solution:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

### Issue 3: Frontend Can't Connect to Backend

**Symptom:**
```
GET http://backend:8000/auth/api/login/ net::ERR_NAME_NOT_RESOLVED
```

**Cause:** Frontend built with wrong `VITE_BASE_URL`

**Wrong:**
```yaml
# docker-compose.yaml
frontend:
  build:
    args:
      VITE_BASE_URL: http://backend:8000  # ❌ Browser can't resolve "backend"
```

**Correct:**
```yaml
# docker-compose.yaml
frontend:
  build:
    args:
      VITE_BASE_URL: http://localhost:8000  # ✅ Browser uses host network
```

---

### Issue 4: 404 on React Routes

**Symptom:**
```
http://localhost:3000/dashboard → 404 Not Found
```

**Cause:** Nginx doesn't know about React Router

**Solution:** Add nginx configuration

Create `frontend/nginx.conf`:
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

Update `frontend/Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf  # Add this
EXPOSE 80
```

---

### Issue 5: MongoDB Connection Failed

**Symptom:**
```
pymongo.errors.ServerSelectionTimeoutError: mongo:27017: Name or service not known
```

**Cause:** Backend started before MongoDB was ready

**Solution:**
```yaml
# docker-compose.yaml
backend:
  depends_on:
    - mongo
  # Note: depends_on only waits for container to start, not for MongoDB to be ready
  # For production, use health checks
```

For production:
```yaml
backend:
  depends_on:
    mongo:
      condition: service_healthy

mongo:
  healthcheck:
    test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
    interval: 10s
    timeout: 5s
    retries: 5
```

---

### Issue 6: Environment Variables Not Loading

**Symptom:**
```
SECRET_KEY is None
```

**Cause:** .env file not in correct location or not loaded

**Solution:**
```bash
# .env should be in project root (same level as docker-compose.yaml)
number-nest/
├── .env                    # ✅ Here
├── docker-compose.yaml
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

Verify in container:
```bash
docker-compose exec backend env | grep SECRET_KEY
```

---

## Summary: Key Differences

| Aspect | Local Dev | Docker |
|--------|-----------|--------|
| **Network** | Single localhost | Two layers (host + Docker) |
| **URLs** | All localhost | localhost (external) + service names (internal) |
| **Frontend Server** | Vite dev server | Nginx serving static files |
| **Backend Server** | Django runserver | Gunicorn |
| **Database Connection** | localhost:27017 | mongo:27017 |
| **Environment Setup** | Manual installation | Automated via Dockerfile |
| **Consistency** | Depends on dev machine | Same on all machines |
| **Startup Time** | Fast (~5 seconds) | Slower (~30 seconds first time) |
| **File Changes** | Hot reload | Need rebuild for config changes |

---

## Debugging Commands

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo

# Follow logs in real-time
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend python manage.py shell
docker-compose exec mongo mongosh

# Inspect container
docker inspect number-nest-backend-1

# Check networks
docker network ls
docker network inspect number-nest_default

# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

---

## Production Considerations

1. **Environment Variables**: Use Docker secrets instead of .env
2. **Health Checks**: Add proper health checks for all services
3. **Logging**: Configure centralized logging
4. **Security**: Don't run as root, use non-privileged ports
5. **Reverse Proxy**: Use Traefik or Nginx as reverse proxy
6. **SSL/TLS**: Add HTTPS certificates
7. **Resource Limits**: Set CPU/memory limits
8. **Monitoring**: Add Prometheus + Grafana

---

## Additional Resources

- [Docker Networking](https://docs.docker.com/network/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Nginx Configuration](https://nginx.org/en/docs/)