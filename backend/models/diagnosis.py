from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Text

from backend.database import Base


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    crop = Column(String)
    problem_type = Column(String)
    diagnosis = Column(String)

    confidence = Column(Float)
    severity = Column(String)

    symptoms = Column(Text)
    explanation = Column(Text)
    recommended_action = Column(Text)

    needs_expert_review = Column(Integer, default=0)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )