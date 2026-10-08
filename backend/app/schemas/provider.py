from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProviderBase(BaseModel):
    name: str
    code: str
    fleet_type: str
    capacity_kg: float
    base_rate_per_km: float
    reliability_score: float
    avg_rating: float
    total_trips: int
    is_ev: bool
    is_active: bool
    contact_phone: Optional[str] = None

class ProviderResponse(ProviderBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
