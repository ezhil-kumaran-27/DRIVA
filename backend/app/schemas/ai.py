from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ExplainRecommendationRequest(BaseModel):
    provider_name: str
    cost: float
    eta_hours: float
    capacity_kg: float
    reliability: float
    match_score: float
    cargo_weight: float
    origin: str
    destination: str
    deadline: str
    runner_ups: Optional[List[Dict[str, Any]]] = None

class ExplainRecommendationResponse(BaseModel):
    explanation: str
    model_used: str
    is_fallback: bool

class AssistantChatRequest(BaseModel):
    query: str
    request_id: Optional[int] = None
    context_data: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    answer: str
    structured_data_used: Dict[str, Any]
    model_used: str
    is_fallback: bool
