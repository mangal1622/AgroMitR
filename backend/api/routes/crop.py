from datetime import date

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from database import SessionLocal
from models.crop import Crop
from models.user import User
from api.routes.auth import get_current_user


router = APIRouter(
    prefix="/crops",
    tags=["Crop Monitoring"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class CropCreate(BaseModel):
    crop_name: str
    variety: str | None = None

    area: float
    area_unit: str = "acre"

    planted_date: date
    expected_harvest_date: date | None = None

    location: str | None = None
    irrigation_type: str | None = None
    soil_type: str | None = None

    notes: str | None = None


class CropUpdate(CropCreate):
    pass


def serialize_crop(crop: Crop):
    return {
        "id": crop.id,
        "crop_name": crop.crop_name,
        "variety": crop.variety,
        "area": crop.area,
        "area_unit": crop.area_unit,
        "planted_date": crop.planted_date,
        "days_since_planted": (date.today() - crop.planted_date).days,
        "expected_harvest_date": crop.expected_harvest_date,
        "location": crop.location,
        "irrigation_type": crop.irrigation_type,
        "soil_type": crop.soil_type,
        "notes": crop.notes,
        "created_at": crop.created_at,
    }


# ============================================================
# ADD CROP
# POST /crops/
# ============================================================

@router.post("/")
def create_crop(
    crop_data: CropCreate,
    current_user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        crop = Crop(
            # 🔐 Link crop to logged-in farmer
            user_id=current_user.id,

            crop_name=crop_data.crop_name,
            is_active=1,
            variety=crop_data.variety,

            area=crop_data.area,
            area_unit=crop_data.area_unit,

            planted_date=crop_data.planted_date,
            expected_harvest_date=crop_data.expected_harvest_date,

            location=crop_data.location,
            irrigation_type=crop_data.irrigation_type,
            soil_type=crop_data.soil_type,

            notes=crop_data.notes,
        )

        db.add(crop)
        db.commit()
        db.refresh(crop)

        return serialize_crop(crop)

    except Exception as e:

        db.rollback()

        print("Crop creation error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to add crop."
        )

    finally:
        db.close()


# ============================================================
# GET ALL CROPS
# GET /crops/
# ============================================================

@router.get("/")
def get_crops(
    current_user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        crops = (
            db.query(Crop)
            .filter(
                Crop.user_id == current_user.id,
                Crop.is_active == 1,
            )
            .order_by(Crop.created_at.desc())
            .all()
        )

        return [
            serialize_crop(crop)
            for crop in crops
        ]

    finally:
        db.close()


# ============================================================
# GET SINGLE CROP
# GET /crops/{crop_id}
# ============================================================

@router.get("/{crop_id}")
def get_crop(
    crop_id: int,
    current_user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        crop = (
            db.query(Crop)
            .filter(
                Crop.id == crop_id,
                Crop.user_id == current_user.id,
                Crop.is_active == 1,
            )
            .first()
        )

        if not crop:

            raise HTTPException(
                status_code=404,
                detail="Crop not found."
            )

        return serialize_crop(crop)

    finally:
        db.close()


# ============================================================
# UPDATE CROP
# PUT /crops/{crop_id}
# ============================================================

@router.put("/{crop_id}")
def update_crop(
    crop_id: int,
    crop_data: CropUpdate,
    current_user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        crop = (
            db.query(Crop)
            .filter(
                Crop.id == crop_id,
                Crop.user_id == current_user.id,
                Crop.is_active == 1,
            )
            .first()
        )

        if not crop:

            raise HTTPException(
                status_code=404,
                detail="Crop not found."
            )

        for field, value in crop_data.model_dump().items():
            setattr(crop, field, value)

        db.commit()
        db.refresh(crop)

        return serialize_crop(crop)

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print("Crop update error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to update crop."
        )

    finally:
        db.close()


# ============================================================
# DELETE / COMPLETE CROP
# DELETE /crops/{crop_id}
# ============================================================

@router.delete("/{crop_id}")
def delete_crop(
    crop_id: int,
    current_user: User = Depends(get_current_user),
):

    db = SessionLocal()

    try:

        crop = (
            db.query(Crop)
            .filter(
                Crop.id == crop_id,
                Crop.user_id == current_user.id,
                Crop.is_active == 1,
            )
            .first()
        )

        if not crop:

            raise HTTPException(
                status_code=404,
                detail="Crop not found."
            )

        # Soft delete:
        # Remove from active crops but keep the record
        # in the database for history.
        crop.is_active = 0

        db.commit()

        return {
            "message": "Crop removed from active crops.",
            "id": crop.id,
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print("Crop deletion error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to remove crop."
        )

    finally:
        db.close()