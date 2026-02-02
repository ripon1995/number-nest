# Number Nest - Docker Architecture Diagrams

## 1. Complete System Architecture

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           YOUR COMPUTER (HOST)                           ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐     ║
║  │                         WEB BROWSER                            │     ║
║  │                                                                │     ║
║  │  JavaScript Code Running:                                      │     ║
║  │  const API_URL = "http://localhost:8000"                       │     ║
║  └────────────────────────────────────────────────────────────────┘     ║
║         │                                          │                     ║
║         │ ①                                        │ ②                   ║
║         │ GET http://localhost:3000                │ POST /auth/api/login║
║         │ (Request HTML/JS/CSS)                    │ (API Calls)         ║
║         │                                          │                     ║
║  ═══════╪══════════════════════════════════════════╪═════════════════════║
║         │        Docker Port Forwarding            │                     ║
║         │        Host → Container                  │                     ║
║  ═══════╪══════════════════════════════════════════╪═════════════════════║
║         │                                          │                     ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │              DOCKER NETWORK: number-nest_default                 │   ║
║  │              (Bridge Network - Isolated from Host)               │   ║
║  │                                                                  │   ║
║  │   ┌────────────────────┐            ┌──────────────────────┐    │   ║
║  │   │  NGINX CONTAINER   │            │  GUNICORN CONTAINER  │    │   ║
║  │   │  ┌──────────────┐  │            │  ┌────────────────┐ │    │   ║
║  │   │  │              │  │            │  │                │ │    │   ║
║  │   │  │ Static Files │  │            │  │  Django REST   │ │    │   ║
║  │   │  │   (React)    │  │            │  │  Framework     │ │    │   ║
║  │   │  │              │  │            │  │                │ │    │   ║
║  │   │  │  index.html  │  │            │  │  ┌──────────┐  │ │    │   ║
║  │   │  │  main.js     │  │            │  │  │ Views    │  │ │    │   ║
║  │   │  │  styles.css  │  │            │  │  ├──────────┤  │ │    │   ║
║  │   │  │              │  │            │  │  │ Models   │  │ │    │   ║
║  │   │  └──────────────┘  │            │  │  ├──────────┤  │ │    │   ║
║  │   │                    │            │  │  │Serializer│  │ │    │   ║
║  │   │  Port: 80          │            │  │  └──────────┘  │ │    │   ║
║  │   └────────────────────┘            │  │                │ │    │   ║
║  │         ▲                           │  │  Port: 8000    │ │    │   ║
║  │         │                           │  └────────────────┘ │    │   ║
║  │         │                           │          │          │    │   ║
║  │      Exposed:                       │          │          │    │   ║
║  │   localhost:3000                    │          │ ③        │    │   ║
║  │                                     │          │          │    │   ║
║  │                                     │   Exposed:          │    │   ║
║  │                                     │   localhost:8000    │    │   ║
║  │                                     │          │          │    │   ║
║  │                                     │          │          │    │   ║
║  │                                     │          │          │    │   ║
║  │                                     │          ▼          │    │   ║
║  │                                     │  ┌────────────────┐ │    │   ║
║  │                                     │  │ MONGO CONTAINER│ │    │   ║
║  │                                     │  │                │ │    │   ║
║  │                                     │  │  ┌──────────┐  │ │    │   ║
║  │                                     │  │  │ Database │  │ │    │   ║
║  │                                     │  │  │          │  │ │    │   ║
║  │                                     │  │  │ number_  │  │ │    │   ║
║  │                                     │  │  │  nest    │  │ │    │   ║
║  │                                     │  │  │          │  │ │    │   ║
║  │                                     │  │  └──────────┘  │ │    │   ║
║  │                                     │  │                │ │    │   ║
║  │                                     │  │  Port: 27017   │ │    │   ║
║  │                                     │  │  (NOT exposed) │ │    │   ║
║  │                                     │  └────────────────┘ │    │   ║
║  │                                     │                     │    │   ║
║  │                                     │  mongodb://mongo:27017   │   ║
║  │                                     │  (Internal DNS)     │    │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

Legend:
① Browser requests static files (HTML, JS, CSS) from Nginx
② Browser JavaScript makes API calls to Django (exits Docker network)
③ Django connects to MongoDB using internal Docker network
```

---

## 2. URL Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         URL RESOLUTION MATRIX                           │
└─────────────────────────────────────────────────────────────────────────┘

╔═══════════════╦════════════════════════╦═══════════════════════════════╗
║   WHO         ║   ACCESSING            ║   USES URL                    ║
╠═══════════════╬════════════════════════╬═══════════════════════════════╣
║               ║                        ║                               ║
║   Browser     ║   Frontend (Nginx)     ║   http://localhost:3000       ║
║               ║                        ║   ↓                           ║
║               ║                        ║   Port forwarded to           ║
║               ║                        ║   nginx-container:80          ║
║               ║                        ║                               ║
╠═══════════════╬════════════════════════╬═══════════════════════════════╣
║               ║                        ║                               ║
║   Browser     ║   Backend API          ║   http://localhost:8000       ║
║  (via JS)     ║                        ║   ↓                           ║
║               ║                        ║   Port forwarded to           ║
║               ║                        ║   backend-container:8000      ║
║               ║                        ║                               ║
╠═══════════════╬════════════════════════╬═══════════════════════════════╣
║               ║                        ║                               ║
║   Backend     ║   MongoDB              ║   mongodb://mongo:27017       ║
║  Container    ║                        ║   ↓                           ║
║               ║                        ║   Docker internal DNS         ║
║               ║                        ║   resolves to 172.18.0.3      ║
║               ║                        ║                               ║
╠═══════════════╬════════════════════════╬═══════════════════════════════╣
║               ║                        ║                               ║
║   Frontend    ║   Backend              ║   Cannot use internal name!   ║
║  (Built JS)   ║                        ║   Must use localhost:8000     ║
║               ║                        ║   (JS runs in browser)        ║
║               ║                        ║                               ║
╚═══════════════╩════════════════════════╩═══════════════════════════════╝
```

---

## 3. Build Process Flow

```
╔══════════════════════════════════════════════════════════════════════════╗
║                       DOCKER BUILD PROCESS                               ║
╚══════════════════════════════════════════════════════════════════════════╝

                    docker-compose up --build
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │  BUILD BACKEND      │   │  BUILD FRONTEND     │
    └─────────────────────┘   └─────────────────────┘
                │                         │
                │                         │
    ┌───────────┴──────────┐  ┌──────────┴──────────────┐
    │ Step 1:              │  │ Step 1:                 │
    │ FROM python:3.12     │  │ FROM node:20            │
    │ (800 MB)             │  │ (1.1 GB)                │
    └───────┬──────────────┘  └──────────┬──────────────┘
            │                            │
    ┌───────┴──────────┐      ┌──────────┴──────────────┐
    │ Step 2:          │      │ Step 2:                 │
    │ Copy requirements│      │ npm install             │
    │ pip install      │      │ (node_modules: 200MB)   │
    └───────┬──────────┘      └──────────┬──────────────┘
            │                            │
    ┌───────┴──────────┐      ┌──────────┴──────────────┐
    │ Step 3:          │      │ Step 3:                 │
    │ Copy source code │      │ npm run build           │
    │                  │      │ ┌────────────────────┐  │
    │ Final Size:      │      │ │ Vite processes:    │  │
    │ ~850 MB          │      │ │                    │  │
    └──────────────────┘      │ │ ① Bundles JS       │  │
                              │ │ ② Minifies code    │  │
                              │ │ ③ Optimizes assets │  │
                              │ │ ④ Replaces env vars│  │
                              │ │                    │  │
                              │ │ VITE_BASE_URL      │  │
                              │ │ becomes:           │  │
                              │ │ "localhost:8000"   │  │
                              │ │ (hardcoded!)       │  │
                              │ └────────────────────┘  │
                              │                         │
                              │ Output: /app/dist/      │
                              │ (5 MB)                  │
                              └──────────┬──────────────┘
                                         │
                              ┌──────────┴──────────────┐
                              │ Step 4:                 │
                              │ FROM nginx:alpine       │
                              │ (40 MB - Fresh start!)  │
                              └──────────┬──────────────┘
                                         │
                              ┌──────────┴──────────────┐
                              │ Step 5:                 │
                              │ COPY /app/dist          │
                              │                         │
                              │ Final Size: ~45 MB      │
                              └─────────────────────────┘

Key Insight:
Frontend is built ONCE during image creation.
URLs cannot be changed without rebuilding the image!
```

---

## 4. Request Flow: Login Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER CLICKS "LOGIN" BUTTON                                             │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Browser sends POST request                                     │
│                                                                          │
│  POST http://localhost:8000/auth/api/login/                             │
│  Headers:                                                                │
│    Content-Type: application/json                                       │
│    Origin: http://localhost:3000                                        │
│  Body:                                                                   │
│    { "phone_number": "1234567890", "password": "secret" }               │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ (Request goes through host network)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Docker port forwarding                                         │
│                                                                          │
│  localhost:8000  ───────────────────►  backend-container:8000           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Gunicorn receives request                                      │
│                                                                          │
│  Gunicorn worker → Django WSGI handler                                  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Django Middleware Chain                                        │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ ① CORS Middleware                        │                           │
│  │   Check: Is origin allowed?              │                           │
│  │   → "http://localhost:3000" in           │                           │
│  │      CORS_ALLOWED_ORIGINS?               │                           │
│  │   ✅ YES → Add CORS headers               │                           │
│  └──────────────────────────────────────────┘                           │
│                    ↓                                                     │
│  ┌──────────────────────────────────────────┐                           │
│  │ ② Common Middleware                      │                           │
│  │   Check: Is host allowed?                │                           │
│  │   → "localhost" in ALLOWED_HOSTS?        │                           │
│  │   ✅ YES → Continue                        │                           │
│  └──────────────────────────────────────────┘                           │
│                    ↓                                                     │
│  ┌──────────────────────────────────────────┐                           │
│  │ ③ URL Routing                            │                           │
│  │   Match: /auth/api/login/                │                           │
│  │   → Routes to user.views.LoginView       │                           │
│  └──────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: LoginView processing                                           │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ ① Deserialize request data               │                           │
│  │   UserLoginSerializer.is_valid()         │                           │
│  └──────────────────────────────────────────┘                           │
│                    ↓                                                     │
│  ┌──────────────────────────────────────────┐                           │
│  │ ② Validate credentials                   │                           │
│  │   Query: User.objects(phone_number=...)  │   ──────┐                 │
│  └──────────────────────────────────────────┘         │                 │
└────────────────────────────────────────────────────────┼─────────────────┘
                                                         │
                                                         │
                              ┌──────────────────────────┘
                              │ mongodb://mongo:27017/number_nest
                              │ (Internal Docker network)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: MongoDB Query                                                  │
│                                                                          │
│  MongoDB Container receives:                                            │
│  db.user.findOne({ phone_number: "1234567890" })                        │
│                                                                          │
│  Returns: User document                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Password verification                                          │
│                                                                          │
│  check_password(submitted_password, user.password_hash)                 │
│  ✅ Match → Continue                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Generate JWT tokens                                            │
│                                                                          │
│  ┌──────────────────────────────────────────┐                           │
│  │ refresh_token = create_token(            │                           │
│  │   user_id=user.id,                       │                           │
│  │   expiry=100 minutes                     │                           │
│  │ )                                        │                           │
│  │                                          │                           │
│  │ access_token = create_token(             │                           │
│  │   user_id=user.id,                       │                           │
│  │   expiry=50 minutes                      │                           │
│  │ )                                        │                           │
│  └──────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 9: Send response                                                  │
│                                                                          │
│  HTTP 200 OK                                                            │
│  Headers:                                                                │
│    Access-Control-Allow-Origin: http://localhost:3000                   │
│    Access-Control-Allow-Credentials: true                               │
│    Content-Type: application/json                                       │
│                                                                          │
│  Body:                                                                   │
│  {                                                                       │
│    "success": true,                                                      │
│    "data": {                                                             │
│      "access": "eyJhbGciOiJIUzI1NiIs...",                               │
│      "refresh": "eyJhbGciOiJIUzI1NiIs...",                              │
│      "user": {                                                           │
│        "name": "John Doe",                                               │
│        "phone_number": "1234567890",                                     │
│        "is_admin": false                                                 │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 10: Browser receives response                                     │
│                                                                          │
│  JavaScript code:                                                        │
│  const result = await response.json();                                  │
│  localStorage.setItem('access_token', result.data.access);              │
│  localStorage.setItem('refresh_token', result.data.refresh);            │
│  navigate('/dashboard');                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Port Mapping Visualization

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         PORT MAPPING                                     ║
╚══════════════════════════════════════════════════════════════════════════╝

HOST MACHINE                              DOCKER CONTAINERS
─────────────                              ─────────────────

┌─────────────┐
│ Browser     │
└──────┬──────┘
       │
       │ Access via:
       │ localhost:3000
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  HOST NETWORK STACK                                                     │
│                                                                         │
│  Port 3000  ────────────────►  [Port Forward]  ─────────►  Container:80│
│                                                                   │     │
│                                                         ┌─────────▼───┐ │
│                                                         │  nginx      │ │
│                                                         │  :80        │ │
│                                                         └─────────────┘ │
│                                                                         │
│  Port 8000  ────────────────►  [Port Forward]  ─────────►  Container:  │
│                                                              8000       │
│                                                                   │     │
│                                                         ┌─────────▼───┐ │
│                                                         │  gunicorn   │ │
│                                                         │  :8000      │ │
│                                                         └─────────────┘ │
│                                                                         │
│  Port 27017 ──────X NOT FORWARDED X─────────────────► Container:27017  │
│                   (Internal only)                               │      │
│                                                         ┌───────▼────┐  │
│                                                         │  mongodb   │  │
│                                                         │  :27017    │  │
│                                                         └────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘


Port Forwarding Syntax in docker-compose.yaml:
─────────────────────────────────────────────

ports:
  - "HOST_PORT:CONTAINER_PORT"

Examples:
  - "3000:80"     → Host port 3000 maps to container port 80
  - "8000:8000"   → Host port 8000 maps to container port 8000

No port mapping for mongo = Only accessible from other containers!
```

---

## 6. Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

BUILD TIME (Frontend)                    RUNTIME (Backend)
─────────────────────                    ─────────────────

┌─────────────┐                          ┌─────────────┐
│  .env file  │                          │  .env file  │
│  (Project   │                          │  (Project   │
│   root)     │                          │   root)     │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       ▼                                        ▼
┌──────────────────┐                    ┌──────────────────┐
│ docker-compose   │                    │ docker-compose   │
│      .yaml       │                    │      .yaml       │
│                  │                    │                  │
│  frontend:       │                    │  backend:        │
│    build:        │                    │    env_file:     │
│      args:       │                    │      - .env      │
│        VITE_BASE │                    │    environment:  │
│        _URL:     │                    │      DEBUG: True │
│        localhost │                    │      SECRET_KEY  │
│        :8000     │                    └──────┬───────────┘
└──────┬───────────┘                           │
       │                                       │
       ▼                                       ▼
┌──────────────────┐                    ┌────────────────────┐
│  npm run build   │                    │  Container starts  │
│                  │                    │                    │
│  Vite reads:     │                    │  Python reads:     │
│  import.meta.env │                    │  os.getenv()       │
│  .VITE_BASE_URL  │                    │                    │
│                  │                    │  Can change        │
│  Replaces in code│                    │  at runtime!       │
│  with actual     │                    └────────────────────┘
│  value           │
│                  │
│  PERMANENT!      │
│  Cannot change!  │
└──────────────────┘

Key Difference:
─────────────────
Frontend: Environment variables are BAKED IN during build
          → Changing requires rebuild

Backend:  Environment variables are READ at startup
          → Changing requires restart (no rebuild)
```

---

## 7. Why Docker is Complex: Visual Summary

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    LOCAL DEV vs DOCKER COMPARISON                        ║
╚══════════════════════════════════════════════════════════════════════════╝

LOCAL DEVELOPMENT                        DOCKER
─────────────────                        ──────

Single Process                           Multiple Containers
┌──────────┐                            ┌──────────┐ ┌──────────┐
│  Vite    │                            │  Nginx   │ │ Gunicorn │
│  Dev     │                            │ (Prod)   │ │ (Prod)   │
│  Server  │                            └──────────┘ └──────────┘
└──────────┘

Hot Reload                               Rebuild Required
Edit file → See changes                  Edit → Rebuild → Restart
(Instant)                                (30+ seconds)

One Network                              Two Networks
Everything on localhost                  Host + Docker bridge

Simple URLs                              Complex URLs
localhost:5173                           localhost:3000 → container:80
localhost:8000                           localhost:8000 → container:8000
localhost:27017                          mongo:27017 (internal)

Dev Server                               Production Server
Django runserver                         Gunicorn
npm run dev                              Static files in Nginx

No Isolation                             Full Isolation
Uses your Python/Node                    Separate environments

Environment Variables                    Environment Variables
.env → Direct usage                      .env → Docker → Container


╔══════════════════════════════════════════════════════════════════════════╗
║  WHEN TO USE EACH                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Local Development:                                                      ║
║  ✅ Fast iteration                                                        ║
║  ✅ Quick debugging                                                       ║
║  ✅ Simple setup                                                          ║
║  ❌ "Works on my machine" problems                                        ║
║  ❌ Different environments across team                                    ║
║                                                                          ║
║  Docker:                                                                 ║
║  ✅ Consistent environments                                               ║
║  ✅ Production-like setup                                                 ║
║  ✅ Easy deployment                                                       ║
║  ✅ Isolation (no conflicts)                                              ║
║  ❌ Slower iteration                                                      ║
║  ❌ More complex debugging                                                ║
║  ❌ Requires Docker knowledge                                             ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 8. Common Mistakes Visualization

```
❌ MISTAKE 1: Using internal names in frontend
───────────────────────────────────────────────

docker-compose.yaml:
  frontend:
    build:
      args:
        VITE_BASE_URL: http://backend:8000  ← WRONG!

Why it fails:
Browser → Tries to access "http://backend:8000"
       → DNS lookup fails (backend only exists in Docker)
       → Error: ERR_NAME_NOT_RESOLVED

✅ CORRECT:
VITE_BASE_URL: http://localhost:8000
(Browser uses host network, reaches host port 8000)


❌ MISTAKE 2: Empty ALLOWED_HOSTS
──────────────────────────────────

settings.py:
ALLOWED_HOSTS = []  ← WRONG!

Why it fails:
Request → Django checks host header "localhost:8000"
       → Not in ALLOWED_HOSTS
       → Returns 400 Bad Request

✅ CORRECT:
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'backend']


❌ MISTAKE 3: Missing CORS
──────────────────────────

Why it fails:
Browser → Makes request from http://localhost:3000
       → To http://localhost:8000
       → Different ports = Different origins
       → Browser blocks by default

✅ CORRECT:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


❌ MISTAKE 4: Accessing host services from container
─────────────────────────────────────────────────────

Backend tries: mongodb://localhost:27017
               ↑
               This looks in the CONTAINER, not host!

✅ CORRECT:
Use service name: mongodb://mongo:27017
(Docker DNS resolves "mongo" to container IP)
```

---

## 9. Data Persistence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOCKER VOLUMES                                  │
└─────────────────────────────────────────────────────────────────────────┘

WITHOUT VOLUMES                          WITH VOLUMES
───────────────                          ────────────

Container Lifecycle:                     Container Lifecycle:
┌──────────────┐                        ┌──────────────┐
│ Start        │                        │ Start        │
│   ↓          │                        │   ↓          │
│ Write data   │ ─────┐                │ Write data   │ ───┐
│   ↓          │      │                │   ↓          │    │
│ Stop         │      │                │ Stop         │    │
│   ↓          │      │                │   ↓          │    │
│ Remove       │      │                │ Remove       │    │
│              │      │                │              │    │
│              │      │                │              │    │
│ ❌ DATA LOST! │ ◄────┘                │              │    │
└──────────────┘                        └──────────────┘    │
                                                            │
                                        ┌──────────────┐    │
                                        │  Volume      │    │
                                        │  (Host disk) │◄───┤
                                        │              │    │
                                        │ ✅ DATA SAVED │    │
                                        └──────────────┘    │
                                                            │
                                        ┌──────────────┐    │
                                        │ New container│    │
                                        │ Start        │    │
                                        │   ↓          │    │
                                        │ Read data    │◄───┘
                                        └──────────────┘


Volume Configuration:
─────────────────────

docker-compose.yaml:
  mongo:
    volumes:
      - mongo_data:/data/db
        ───┬─────  ────┬─────
           │           │
           │           └─ Path inside container
           │
           └─ Volume name (stored on host)

volumes:
  mongo_data:  ← Declare volume
```

---

This guide should help you understand the complete architecture and complexity of Docker!