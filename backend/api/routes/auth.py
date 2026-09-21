from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field, field_validator
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from backend.config import JWT_SECRET_KEY
from backend.database import get_db
from backend.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)
password_hash = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7

SUPPORTED_LANGUAGES = {
    "en": "English", "hi": "Hindi", "kn": "Kannada", "mr": "Marathi",
    "ta": "Tamil", "te": "Telugu", "ml": "Malayalam", "bn": "Bengali",
    "gu": "Gujarati", "pa": "Punjabi",
}

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None
    place: str | None = Field(default=None, max_length=255)
    preferred_language: str = "en"
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        value = value.strip().replace(" ", "").replace("-", "")
        digits = value[1:] if value.startswith("+") else value
        if not digits.isdigit() or not 10 <= len(digits) <= 15:
            raise ValueError("Please enter a valid phone number.")
        return value

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, value):
        if value not in SUPPORTED_LANGUAGES:
            raise ValueError("Unsupported preferred language.")
        return value

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value, info):
        if info.data.get("password") is not None and value != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return value

class LoginRequest(BaseModel):
    login: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)

def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": str(user_id), "iat": now,
         "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES)},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401, detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=401, detail="Invalid or expired login session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User account not found or inactive.")
    return user

def user_data(user):
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "place": user.place,
        "preferred_language": user.preferred_language,
    }

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == request.phone).first():
        raise HTTPException(status_code=409, detail="An account with this phone number already exists.")

    email = str(request.email).strip().lower() if request.email else None
    if email and db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name=request.name.strip(),
        phone=request.phone,
        email=email,
        place=request.place.strip() if request.place else None,
        preferred_language=request.preferred_language,
        password_hash=password_hash.hash(request.password),
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to create farmer account.")

    return {
        "message": "Farmer account created successfully.",
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_data(user),
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    value = request.login.strip()
    user = db.query(User).filter(User.phone == value).first()
    if user is None and "@" in value:
        user = db.query(User).filter(User.email == value.lower()).first()

    if user is None or not password_hash.verify(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect phone/email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This farmer account is inactive.")

    return {
        "message": "Login successful.",
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_data(user),
    }

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {**user_data(current_user), "created_at": current_user.created_at}


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=10, max_length=20)
    email: EmailStr | None = None
    place: str | None = Field(default=None, max_length=255)
    preferred_language: str | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is None:
            return value
        value = value.strip().replace(" ", "").replace("-", "")
        digits = value[1:] if value.startswith("+") else value
        if not digits.isdigit() or not 10 <= len(digits) <= 15:
            raise ValueError("Please enter a valid phone number.")
        return value

    @field_validator("preferred_language")
    @classmethod
    def validate_language(cls, value):
        if value is not None and value not in SUPPORTED_LANGUAGES:
            raise ValueError("Unsupported preferred language.")
        return value


@router.put("/profile")
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.phone and request.phone != current_user.phone:
        existing = db.query(User).filter(User.phone == request.phone, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=409, detail="An account with this phone number already exists.")
        current_user.phone = request.phone

    if request.email is not None:
        email_str = str(request.email).strip().lower() if request.email else None
        if email_str and email_str != current_user.email:
            existing = db.query(User).filter(User.email == email_str, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=409, detail="An account with this email already exists.")
        current_user.email = email_str

    if request.name:
        current_user.name = request.name.strip()

    if request.place is not None:
        current_user.place = request.place.strip() if request.place else None

    if request.preferred_language:
        current_user.preferred_language = request.preferred_language

    try:
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to update profile.")

    return {
        "message": "Profile updated successfully.",
        "user": user_data(current_user),
    }

