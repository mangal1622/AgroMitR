from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

import os
import uuid
import json

from backend.database import get_db
from backend.models.diagnosis import Diagnosis
from backend.services.diagnosis_service import diagnose_image
from backend.services.translation_service import translate_diagnosis


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

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


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

@router.post("/")
async def diagnose(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Validate image type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are supported."
        )

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    extension = allowed_types[file.content_type]

    filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    # --------------------------------------------------------
    # Save uploaded image
    # --------------------------------------------------------

    try:

        contents = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

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

        result = diagnose_image(file_path)

    except Exception as e:

        print("Diagnosis error:", e)

        # Remove uploaded file if diagnosis failed
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

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
            filename=filename,

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
        "filename": filename,
        "diagnosis": result
    }


# ============================================================
# GET DIAGNOSIS HISTORY
# GET /diagnose/
# ============================================================

@router.get("/")
def get_diagnoses(
    db: Session = Depends(get_db)
):

    records = (
        db.query(Diagnosis)
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

            "recommended_action": (
                recommended_action
            ),

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
    db: Session = Depends(get_db)
):

    record = (
        db.query(Diagnosis)
        .filter(Diagnosis.id == diagnosis_id)
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

        file_path = os.path.join(
            UPLOAD_DIR,
            record.filename
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
    db: Session = Depends(get_db)
):

    records = (
        db.query(Diagnosis)
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

            file_path = os.path.join(
                UPLOAD_DIR,
                record.filename
            )

            try:

                if os.path.exists(file_path):
                    os.remove(file_path)

            except Exception as e:

                print(
                    f"Unable to delete image "
                    f"{record.filename}:",
                    e
                )

    # --------------------------------------------------------
    # Delete database records
    # --------------------------------------------------------

    try:

        db.query(Diagnosis).delete(
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

# ============================================================
# TRANSLATE DIAGNOSIS
# POST /diagnose/translate/
# ============================================================

@router.post("/translate/")
async def translate(
    request: TranslationRequest
):

    # --------------------------------------------------------
    # Validate language
    # --------------------------------------------------------

    if not request.language:

        raise HTTPException(
            status_code=400,
            detail="Language is required."
        )

    # --------------------------------------------------------
    # Translate diagnosis
    # --------------------------------------------------------

    try:

        translated = translate_diagnosis(
            request.diagnosis,
            request.language
        )

        return {
            "diagnosis": translated
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print(
            "Translation error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to translate diagnosis."
        )