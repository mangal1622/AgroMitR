import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use /tmp for SQLite on Vercel (read-only filesystem), local path otherwise
if os.getenv("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/crop_health.db"
else:
    DATABASE_URL = "sqlite:///./crop_health.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()