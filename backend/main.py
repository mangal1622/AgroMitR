from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import CORS_ORIGINS
from backend.models.user import User
from backend.api.routes.auth import router as auth_router

from backend.database import Base, engine
from backend.models.crop import Crop

from backend.api.routes.health import router as health_router
from backend.api.routes.diagnosis import router as diagnosis_router
from backend.api.routes.pest import router as pest_router
from backend.api.routes.weather import router as weather_router
from backend.api.routes.crop import router as crop_router

from backend.chat_route import router as chat_router


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

# Create uploads directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------
# DATABASE TABLES
# --------------------------------------------------

Base.metadata.create_all(bind=engine)

# --------------------------------------------------
# APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="Crop Health AI",
    description="AI-powered crop disease diagnosis system",
    version="1.0.0",
)

app.include_router(chat_router)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# STATIC FILES
# --------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# --------------------------------------------------
# ROUTES
# --------------------------------------------------

app.include_router(health_router)
app.include_router(diagnosis_router)
app.include_router(pest_router)
app.include_router(weather_router)
app.include_router(crop_router)
app.include_router(auth_router)

# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Crop Health AI API is running",
        "status": "online",
    }