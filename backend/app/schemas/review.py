from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    booking_id: int
    rating: float = Field(..., ge=1.0, le=5.0)
    feedback: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    user_id: int
    provider_id: int
    rating: float
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
