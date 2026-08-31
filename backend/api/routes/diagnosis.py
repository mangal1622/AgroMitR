from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

import os
import uuid
import json

from backend.database import get_db
from backend.models.diagnosis import Diagnosis
from backend.services.diagnosis_service import diagnose_image


router = APIRouter(
    prefix="/diagnose",
    tags=["Diagnosis"]
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def diagnose(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

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

    extension = allowed_types[file.content_type]

    filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    result = diagnose_image(file_path)

    diagnosis_record = Diagnosis(
        filename=filename,
        crop=result.get("crop"),
        problem_type=result.get("problem_type"),
        diagnosis=result.get("diagnosis"),
        confidence=result.get("confidence"),
        severity=result.get("severity"),
        symptoms=json.dumps(result.get("symptoms", [])),
        explanation=result.get("explanation"),
        recommended_action=json.dumps(
            result.get("recommended_action", [])
        ),
        needs_expert_review=(
            1 if result.get("needs_expert_review", False)
            else 0
        )
    )

    db.add(diagnosis_record)
    db.commit()
    db.refresh(diagnosis_record)

    return {
        "id": diagnosis_record.id,
        "filename": filename,
        "diagnosis": result
    }

@router.get("/")
def get_diagnoses(
    db: Session = Depends(get_db)
):
    records = (
        db.query(Diagnosis)
        .order_by(Diagnosis.created_at.desc())
        .all()
    )

    results = []

    for record in records:
        results.append({
            "id": record.id,
            "filename": record.filename,
            "crop": record.crop,
            "problem_type": record.problem_type,
            "diagnosis": record.diagnosis,
            "confidence": record.confidence,
            "severity": record.severity,
            "symptoms": json.loads(record.symptoms)
                if record.symptoms else [],
            "explanation": record.explanation,
            "recommended_action": json.loads(
                record.recommended_action
            )
            if record.recommended_action else [],
            "needs_expert_review": bool(
                record.needs_expert_review
            ),
            "created_at": record.created_at
        })

    return {
        "count": len(results),
        "diagnoses": results
    }