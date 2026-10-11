from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from pathlib import Path
import os
import uuid
import json

from database import get_db
from models.diagnosis import Diagnosis
from models.user import User
from services.diagnosis_service import diagnose_images
from api.routes.auth import get_current_user, get_current_user_optional


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/diagnose",
    tags=["Diagnosis"]
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path("/tmp/agromitr/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# TRANSLATION REQUEST MODEL
# ============================================================

class TranslationRequest(BaseModel):
    diagnosis: dict
    language: str


# ============================================================
# DIAGNOSE IMAGE
# POST /diagnose/
# ============================================================

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/")
async def diagnose(
    files: list[UploadFile] = File(...),
    language: str = Form("en"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):


    # --------------------------------------------------------
    # Validate image type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }

    if not files or len(files) > 5:
        raise HTTPException(
            status_code=400,
            detail="Upload between 1 and 5 images."
        )

    if any(file.content_type not in allowed_types for file in files):
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are supported."
        )

    # --------------------------------------------------------
    # Validate file size
    # --------------------------------------------------------

    for file in files:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB."
            )
        # Reset file pointer for later reading
        await file.seek(0)

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    filenames = []
    file_paths = []

    # --------------------------------------------------------
    # Save uploaded image
    # --------------------------------------------------------

    try:

        for file in files:
            filename = f"{uuid.uuid4()}{allowed_types[file.content_type]}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            contents = await file.read()

            with open(file_path, "wb") as buffer:
                buffer.write(contents)

            filenames.append(filename)
            file_paths.append(file_path)

    except Exception as e:

        print("File save error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded image."
        )

    # --------------------------------------------------------
    # Run AI diagnosis
    # --------------------------------------------------------

    try:

        result = diagnose_images(file_paths, language=language)

    except Exception as e:

        # Log the detailed error for debugging
        print("Diagnosis error:", e)

        # Remove uploaded file if diagnosis failed
        try:
            for file_path in file_paths:
                if os.path.exists(file_path):
                    os.remove(file_path)
        except Exception:
            pass

        # Determine if the error is due to an invalid model
        error_message = str(e).lower()
        if "model_not_found" in error_message or "model" in error_message and "not found" in error_message:
            raise HTTPException(
                status_code=400,
                detail="Configured Groq model not found or inaccessible."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Unable to diagnose the uploaded image."
            )

    # --------------------------------------------------------
    # Validate AI response
    # --------------------------------------------------------

    if not isinstance(result, dict):

        raise HTTPException(
            status_code=500,
            detail="Invalid diagnosis response from AI."
        )

    # --------------------------------------------------------
    # Save diagnosis to database
    # --------------------------------------------------------

    try:

        diagnosis_record = Diagnosis(

            # 🔐 Link diagnosis to logged-in farmer if authenticated
            user_id=current_user.id if current_user else None,

            filename=",".join(filenames),

            crop=result.get("crop"),

            problem_type=result.get(
                "problem_type"
            ),

            diagnosis=result.get(
                "diagnosis"
            ),

            confidence=result.get(
                "confidence"
            ),

            severity=result.get(
                "severity"
            ),

            symptoms=json.dumps(
                result.get(
                    "symptoms",
                    []
                )
            ),

            explanation=result.get(
                "explanation"
            ),

            recommended_action=json.dumps(
                result.get(
                    "recommended_action",
                    []
                )
            ),

            needs_expert_review=(
                1
                if result.get(
                    "needs_expert_review",
                    False
                )
                else 0
            )
        )

        db.add(diagnosis_record)

        db.commit()

        db.refresh(diagnosis_record)

    except Exception as e:

        db.rollback()

        print("Database error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to save diagnosis."
        )

    # --------------------------------------------------------
    # Return diagnosis
    # --------------------------------------------------------

    return {
        "id": diagnosis_record.id,
        "filename": ",".join(filenames),
        "filenames": filenames,
        "diagnosis": result
    }


# ============================================================
# GET DIAGNOSIS HISTORY
# GET /diagnose/
# ============================================================

@router.get("/")
def get_diagnoses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔐 Only fetch this farmer's diagnoses
    records = (
        db.query(Diagnosis)
        .filter(
            Diagnosis.user_id == current_user.id
        )
        .order_by(
            Diagnosis.created_at.desc()
        )
        .all()
    )

    results = []

    for record in records:

        # ----------------------------------------------------
        # Safely decode symptoms
        # ----------------------------------------------------

        try:

            symptoms = (
                json.loads(record.symptoms)
                if record.symptoms
                else []
            )

        except (json.JSONDecodeError, TypeError):

            symptoms = []

        # ----------------------------------------------------
        # Safely decode recommendations
        # ----------------------------------------------------

        try:

            recommended_action = (
                json.loads(
                    record.recommended_action
                )
                if record.recommended_action
                else []
            )

        except (json.JSONDecodeError, TypeError):

            recommended_action = []

        # ----------------------------------------------------
        # Add record
        # ----------------------------------------------------

        results.append({

            "id": record.id,

            "filename": record.filename,

            "crop": record.crop,

            "problem_type": record.problem_type,

            "diagnosis": record.diagnosis,

            "confidence": record.confidence,

            "severity": record.severity,

            "symptoms": symptoms,

            "explanation": record.explanation,

            "recommended_action": recommended_action,

            "needs_expert_review": bool(
                record.needs_expert_review
            ),

            "created_at": record.created_at
        })

    return {
        "count": len(results),
        "diagnoses": results
    }


# ============================================================
# DELETE ONE DIAGNOSIS
# DELETE /diagnose/{diagnosis_id}
# ============================================================

@router.delete("/{diagnosis_id}")
def delete_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔐 Only find a diagnosis belonging to this farmer
    record = (
        db.query(Diagnosis)
        .filter(
            Diagnosis.id == diagnosis_id,
            Diagnosis.user_id == current_user.id
        )
        .first()
    )

    if not record:

        raise HTTPException(
            status_code=404,
            detail="Diagnosis record not found."
        )

    # --------------------------------------------------------
    # Delete uploaded image
    # --------------------------------------------------------

    if record.filename:

        # Handle multiple filenames
        for filename in record.filename.split(","):

            file_path = os.path.join(
                UPLOAD_DIR,
                filename
            )

            try:

                if os.path.exists(file_path):
                    os.remove(file_path)

            except Exception as e:

                print(
                    "Unable to delete image:",
                    e
                )

    # --------------------------------------------------------
    # Delete database record
    # --------------------------------------------------------

    try:

        db.delete(record)
        db.commit()

    except Exception as e:

        db.rollback()

        print(
            "Delete diagnosis error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete diagnosis."
        )

    return {
        "message": "Diagnosis deleted successfully.",
        "id": diagnosis_id
    }


# ============================================================
# DELETE ALL DIAGNOSIS HISTORY
# DELETE /diagnose/
# ============================================================

@router.delete("/")
def delete_all_diagnoses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔐 Only fetch this farmer's diagnoses
    records = (
        db.query(Diagnosis)
        .filter(
            Diagnosis.user_id == current_user.id
        )
        .all()
    )

    if not records:

        return {
            "message": "Diagnosis history is already empty.",
            "deleted_count": 0
        }

    deleted_count = len(records)

    # --------------------------------------------------------
    # Delete uploaded images
    # --------------------------------------------------------

    for record in records:

        if record.filename:

            for filename in record.filename.split(","):

                file_path = os.path.join(
                    UPLOAD_DIR,
                    filename
                )

                try:

                    if os.path.exists(file_path):
                        os.remove(file_path)

                except Exception as e:

                    print(
                        f"Unable to delete image "
                        f"{filename}:",
                        e
                    )

    # --------------------------------------------------------
    # Delete only this farmer's database records
    # --------------------------------------------------------

    try:

        db.query(Diagnosis).filter(
            Diagnosis.user_id == current_user.id
        ).delete(
            synchronize_session=False
        )

        db.commit()

    except Exception as e:

        db.rollback()

        print(
            "Delete all diagnoses error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete diagnosis history."
        )

    return {
        "message": "All diagnosis history deleted successfully.",
        "deleted_count": deleted_count
    }
