from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(50), nullable=False)
    fleet_type = Column(String(100), default="Mixed Fleet") # Electric, Diesel, Heavy Commercial
    capacity_kg = Column(Float, nullable=False)
    base_rate_per_km = Column(Float, nullable=False)
    reliability_score = Column(Float, nullable=False) # 0.0 - 1.0 (e.g. 0.96 = 96%)
    avg_rating = Column(Float, default=4.5)
    total_trips = Column(Integer, default=150)
    is_ev = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    contact_phone = Column(String(50), default="+91 98765 43210")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
