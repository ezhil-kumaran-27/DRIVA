from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class TransportRequest(Base):
    __tablename__ = "transport_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    cargo_weight = Column(Float, nullable=False) # e.g. 200.0 kg
    cargo_type = Column(String(100), default="General Merchandise")
    deadline = Column(String(100), default="Today")
    deadline_timestamp = Column(DateTime, nullable=True)
    special_requirements = Column(String(500), nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, MATCHED, BOOKED, COMPLETED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
