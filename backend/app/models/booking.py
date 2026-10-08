from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    total_cost = Column(Float, nullable=False)
    
    # Status progression lifecycle:
    # 'CONFIRMED' -> 'DRIVER_ASSIGNED' -> 'PICKUP' -> 'IN_TRANSIT' -> 'DELIVERED'
    status = Column(String(50), default="CONFIRMED", nullable=False)
    
    driver_name = Column(String(100), default="Ramesh Kumar")
    driver_phone = Column(String(50), default="+91 94432 18902")
    vehicle_number = Column(String(50), default="TN-30-AX-8912")
    
    current_location = Column(String(255), default="Salem Dispatch Hub")
    latitude = Column(Float, default=11.6643)
    longitude = Column(Float, default=78.1460)
    
    status_history_json = Column(Text, default="[]") # JSON list of timeline events
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
