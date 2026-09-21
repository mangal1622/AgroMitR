# Crop Health AI - Codebase Analysis Report

**Generated:** 2026-09-22  
**Project:** crop-health-ai (React 19 + FastAPI monorepo)

---

## 1. Architecture Overview

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router v7, Tailwind CSS |
| Backend | FastAPI (Python 3.11+), SQLAlchemy, SQLite |
| LLM | Groq (qwen/qwen3.6-27b) for vision + chat |
| Weather | Open-Meteo API (free, no key required) |
| Auth | JWT (HS256), bcrypt password hashing |
| i18n | 10 languages (English + 9 Indian) |

### Project Structure
```
crop-health-ai/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, static files
│   ├── config.py               # GROQ_API_KEY (fails fast if missing)
│   ├── database.py             # SQLite engine, SessionLocal
│   ├── models/                 # User, Crop, Diagnosis
│   ├── api/routes/             # auth, diagnosis, pest, weather, crop, health
│   ├── chat_route.py           # AI chat endpoint
│   └── services/               # diagnosis, pest, weather services
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main routing, auth state, diagnosis flow
│   │   ├── main.jsx            # React 19 entry point
│   │   ├── i18n/               # LanguageContext + 10 locale files
│   │   ├── components/         # Auth, Settings, Chat, Weather
│   │   └── index.css           # Tailwind + custom styles
│   └── vite.config.js          # Basic Vite + React config
└── requirements.txt            # Python dependencies
```

---

## 2. Data Flow & API Integrations

### Authentication Flow
```
User → /api/auth/register|login → JWT token → localStorage → Authorization header
```
- Phone/email login supported
- Language preference stored in User model (defaults to 'en')
- Token expiry: 30 minutes (configurable)

### Crop Diagnosis Flow
```
Frontend: Image upload → /api/diagnosis/analyze (multipart/form-data)
Backend: diagnosis_service.analyze_crop_image()
  → Groq Vision (qwen/qwen3.6-27b) with structured prompt
  → JSON extraction → Translation (if non-English) → Save to DB → Return
Frontend: Display results → Save to user's crop history
```

### Pest Detection Flow
```
Frontend: Image upload → /api/pest/detect (multipart/form-data)
Backend: pest_service.detect_pests()
  → Groq Vision → Robust JSON extraction (handles markdown/code fences)
  → Return pest list with severity, treatment, prevention
```
⚠️ **No authentication required** on pest routes

### Weather Flow
```
Frontend: Location search (geocoding) → /api/weather/current + /api/weather/forecast
Backend: weather_service → Open-Meteo API (geocoding + forecast)
  → Current weather + 7-day forecast + Farmer advisory generation
```
⚠️ **No authentication required** on weather routes

### AI Chat Flow
```
Frontend: Multi-session chat (localStorage persistence)
  → /api/chat (POST { message, conversation_history })
Backend: chat_route.chat_with_ai()
  → Groq Chat (farming system prompt + conversation history)
  → Markdown response → Frontend renders with markdown-it
```

---

## 3. Localization System

### Supported Languages (10)
| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| hi | Hindi | हिंदी |
| bn | Bengali | বাংলা |
| te | Telugu | తెలుగు |
| mr | Marathi | मराठी |
| ta | Tamil | தமிழ் |
| gu | Gujarati | ગુજરાતી |
| kn | Kannada | ಕನ್ನಡ |
| ml | Malayalam | മലയാളം |
| pa | Punjabi | ਪੰਜਾਬੀ |

### Implementation
- **LanguageContext.jsx**: React Context provider with localStorage persistence
- **Translation keys**: 180+ keys in each locale file
- **Dynamic language switching**: Updates document.dir for RTL support (future)
- **Backend integration**: User.language field, diagnosis results translated via Groq

### Translation Coverage
- ✅ UI strings (auth, settings, chat, weather, diagnosis, pests)
- ✅ Error messages
- ✅ Farmer advisory (weather)
- ⚠️ Some diagnosis/pest result fields translated via LLM at runtime

---

## 4. Feature Completeness

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| User Auth (register/login/me) | ✅ | ✅ | Complete |
| Crop Diagnosis (image → AI) | ✅ | ✅ | Complete |
| Diagnosis History | ✅ | ✅ | Complete |
| Pest Detection | ✅ | ✅ | Complete |
| Weather (current + forecast) | ✅ | ✅ | Complete |
| Crop Management (CRUD) | ✅ | ✅ | Complete |
| AI Chat (multi-session) | ✅ | ✅ | Complete |
| Settings (profile, language, notifications) | ✅ | ✅ | Complete |
| Multi-language (10 langs) | ✅ | ✅ | Complete |
| Offline/Fallback handling | ❌ | ❌ | Missing |

---

## 5. Bugs & Issues Identified

### Critical
1. **Empty schemas.py** - No Pydantic models defined, all validation inline
2. **Missing auth on pest routes** - `/api/pest/*` accessible without JWT
3. **Missing auth on weather routes** - `/api/weather/*` accessible without JWT
4. **No input validation** - File uploads lack size/type validation
5. **No rate limiting** - Groq API calls unbounded

### High
6. **Hardcoded Groq model** - `qwen/qwen3.6-27b` in multiple service files
7. **No error boundaries** - Frontend crashes on API errors
8. **No loading states** - Some async operations lack UX feedback
9. **SQLite in production** - Not suitable for concurrent production use
10. **CORS allows all origins** - `allow_origins=["*"]` in main.py

### Medium
11. **No tests** - Zero test files in backend or frontend
12. **No CI/CD** - No GitHub Actions, GitLab CI, etc.
13. **No logging** - Print statements only, no structured logging
14. **Password visible in register response** - Returns user object with hashed password
15. **JWT secret in code** - Should be env var (currently in config.py)

### Low
16. **No API versioning** - Routes at `/api/*` without version prefix
17. **Frontend env config** - Vite config doesn't proxy API calls
18. **No health check details** - `/health` only returns `{"status": "ok"}`
19. **Markdown XSS risk** - Chat renders markdown without sanitization
20. **Image uploads stored in memory** - Large files could OOM

---

## 6. Architectural Concerns

### Security
- JWT secret hardcoded in config.py
- No password strength requirements
- No refresh token mechanism
- CORS overly permissive
- File uploads lack validation (type, size, malware scanning)
- Markdown rendering without DOMPurify/sanitization

### Scalability
- SQLite + synchronous SQLAlchemy blocks event loop
- No connection pooling config visible
- Groq calls synchronous (blocking)
- No caching layer (Redis/Memcached)
- No background job queue for heavy operations

### Maintainability
- Empty schemas.py - validation scattered in route handlers
- Business logic mixed with HTTP handling in routes
- Services tightly coupled to Groq client
- No dependency injection pattern
- Frontend: Large App.jsx (500+ lines), multiple responsibilities

### Observability
- No structured logging
- No metrics (Prometheus/OpenTelemetry)
- No distributed tracing
- Error responses inconsistent format

---

## 7. Recommended Priority Fixes

### Immediate (Security)
1. Move JWT secret to environment variable
2. Add auth dependencies to pest/weather routes
3. Add file upload validation (type, size limits)
4. Sanitize markdown output in Chat component
5. Remove password hash from register response

### Short-term (Robustness)
6. Create Pydantic schemas in schemas.py
7. Add rate limiting (slowapi or similar)
8. Add structured logging (structlog)
9. Implement error boundaries in React
10. Add loading/error states throughout UI

### Medium-term (Architecture)
11. Migrate to PostgreSQL + async SQLAlchemy
12. Add Redis caching for weather/geocoding
13. Implement background jobs (Celery/RQ) for AI calls
14. Add API versioning (/api/v1/)
15. Extract business logic from routes to service layer

### Long-term (Production Readiness)
16. Add comprehensive test suite (pytest + vitest)
17. Set up CI/CD pipeline
18. Add monitoring (Sentry, Prometheus)
19. Implement refresh token flow
20. Add request/response validation middleware

---

## 8. Environment Configuration

### Required Environment Variables
```bash
# Backend (.env)
GROQ_API_KEY=your_groq_key_here
JWT_SECRET_KEY=secure_random_string
DATABASE_URL=sqlite:///./crop_health.db  # or postgresql://...
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

# Frontend (.env)
VITE_API_URL=http://localhost:8000
```

### Current State
- Backend: `config.py` reads GROQ_API_KEY from env, fails fast if missing
- JWT secret hardcoded in config.py
- No frontend env config (Vite doesn't proxy API)

---

## 9. Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # Runs on localhost:5173
```

---

## 10. Summary

The codebase is **feature-complete for an MVP** with all core functionality implemented:
- ✅ Full authentication system
- ✅ Crop diagnosis with AI vision
- ✅ Pest detection with AI vision
- ✅ Weather integration (Open-Meteo)
- ✅ Multi-session AI chat
- ✅ Crop management CRUD
- ✅ 10-language localization
- ✅ Settings/profile management

**However**, it has **significant production readiness gaps** in security, validation, testing, observability, and architecture. The most critical issues are missing authentication on public routes, hardcoded secrets, and lack of input validation.

---

*Report generated by automated codebase analysis*