from pydantic import BaseModel
from typing import List, Dict, Any

class KPICard(BaseModel):
    title: str
    value: str
    change: str
    trend: str # 'up', 'down', 'neutral'

class ProviderPerformance(BaseModel):
    name: str
    reliability: float
    total_trips: int
    avg_rating: float
    on_time_rate: float
    is_ev: bool

class RouteAnalytics(BaseModel):
    route: str
    trips: int
    avg_cost: float
    avg_eta_hours: float

class AnalyticsDashboardResponse(BaseModel):
    kpis: List[KPICard]
    provider_scorecards: List[ProviderPerformance]
    top_routes: List[RouteAnalytics]
    carbon_saved_kg: float
    total_logistics_spend: float
    avg_decision_engine_score: float
