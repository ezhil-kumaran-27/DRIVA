from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransportRequestCreate(BaseModel):
    origin: str
    destination: str
    cargo_weight: float # e.g. 200 kg
    cargo_type: Optional[str] = "General Merchandise"
    deadline: Optional[str] = "Today"
    special_requirements: Optional[str] = None

class TransportRequestResponse(BaseModel):
    id: int
    user_id: int
    origin: str
    destination: str
    cargo_weight: float
    cargo_type: str
    deadline: str
    special_requirements: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
