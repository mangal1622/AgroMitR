from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey

from database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    # Basic crop information
    crop_name = Column(String, nullable=False)
    variety = Column(String, nullable=True)

    # Land information
    area = Column(Float, nullable=False)
    area_unit = Column(String, nullable=False, default="acre")

    # Growing information
    planted_date = Column(Date, nullable=False)
    expected_harvest_date = Column(Date, nullable=True)

    # Farm information
    location = Column(String, nullable=True)
    irrigation_type = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)

    # Additional information
    notes = Column(Text, nullable=True)

    # Crop status
    # 1 = active, 0 = completed/deleted from active list
    is_active = Column(
        Integer,
        default=1,
        nullable=False
    )

    # Record information
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )