from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.provider import ProviderResponse

class BookingCreate(BaseModel):
    request_id: int
    recommendation_id: int

class BookingUpdateStatus(BaseModel):
    status: str # CONFIRMED, DRIVER_ASSIGNED, PICKUP, IN_TRANSIT, DELIVERED
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_location: Optional[str] = None

class BookingTimelineItem(BaseModel):
    status: str
    timestamp: str
    location: str
    description: str

class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    request_id: int
    provider_id: int
    recommendation_id: Optional[int]
    user_id: int
    total_cost: float
    status: str
    driver_name: str
    driver_phone: str
    vehicle_number: str
    current_location: str
    latitude: float
    longitude: float
    status_history: List[BookingTimelineItem] = []
    created_at: datetime
    updated_at: datetime
    provider: Optional[ProviderResponse] = None

    class Config:
        from_attributes = True
