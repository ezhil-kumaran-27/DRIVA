from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.provider import ProviderResponse

class RecommendationResponse(BaseModel):
    id: int
    request_id: int
    provider_id: int
    provider: ProviderResponse
    predicted_cost: float
    predicted_eta_hours: float
    suitability_score: float
    match_score: float
    rank: int
    ai_explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MatchResultResponse(BaseModel):
    request_id: int
    origin: str
    destination: str
    cargo_weight: float
    deadline: str
    top_recommendation: RecommendationResponse
    ranked_options: List[RecommendationResponse]
