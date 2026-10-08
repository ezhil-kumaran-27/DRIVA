from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    
    # ML & Decision Engine Outputs
    predicted_cost = Column(Float, nullable=False) # Total cost in INR (₹)
    predicted_eta_hours = Column(Float, nullable=False) # e.g. 5.5 hours
    suitability_score = Column(Float, nullable=False) # 0.0 - 100.0
    match_score = Column(Float, nullable=False) # 0.0 - 100.0
    rank = Column(Integer, default=1) # 1 = Top Recommended
    
    # AI Explanation Layer (Groq / Fallback)
    ai_explanation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
