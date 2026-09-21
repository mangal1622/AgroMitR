from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends,
)
import os
import uuid
import json

from backend.services.pest_service import detect_pest
from backend.database import SessionLocal
from backend.models.diagnosis import Diagnosis
from backend.models.user import User
from backend.api.routes.auth import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/pest",
    tags=["Pest Detection"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# DETECT PEST
# POST /pest/
# ============================================================

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/")
async def pest_detection(
    file: UploadFile = File(...),
    language: str = Form("en"),
    current_user: User = Depends(get_current_user),
):


    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    # --------------------------------------------------------
    # Validate image type
    # --------------------------------------------------------

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG and WEBP "
                "images are supported."
            ),
        )

    # --------------------------------------------------------
    # Validate file size
    # --------------------------------------------------------

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB."
        )

    # --------------------------------------------------------
    # Create filename
    # --------------------------------------------------------

    extension = allowed_types[
        file.content_type
    ]

    filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    # --------------------------------------------------------
    # Save image
    # --------------------------------------------------------

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(contents)

    except Exception as e:

        print(
            "Pest image save error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save uploaded image."
            ),
        )

    # --------------------------------------------------------
    # Detect pest
    # --------------------------------------------------------

    try:

        result = detect_pest(
            file_path,
            language=language,
        )

    except Exception as e:

        print(
            "Pest detection error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to analyze the image "
                "for pest infestation."
            ),
        )

# --------------------------------------------------------
# Save pest detection to history
# --------------------------------------------------------

    db = SessionLocal()

    try:
        diagnosis_record = Diagnosis(
            user_id=current_user.id,
            filename=filename,
            crop=result.get("crop"),
            problem_type="pest",
            diagnosis=result.get("pest_name"),
            confidence=result.get("confidence"),
            severity=result.get("risk_level"),
            symptoms=json.dumps(result.get("symptoms", [])),
            explanation=result.get("explanation"),
            recommended_action=json.dumps(
                result.get("recommended_action", [])
            ),
            needs_expert_review=(
                1 if result.get("needs_expert_review") else 0
            ),
        )

        db.add(diagnosis_record)
        db.commit()
        db.refresh(diagnosis_record)

    except Exception as e:
        db.rollback()
        print("Pest history save error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to save pest detection history."
        )

    finally:
        db.close()

    return {
        "id": diagnosis_record.id,
        "filename": filename,
        "pest_detection": result,
    }