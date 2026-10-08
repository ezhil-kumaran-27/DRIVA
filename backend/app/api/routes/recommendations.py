from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recommendation import Recommendation
from app.models.provider import Provider
from app.models.transport_request import TransportRequest
from app.schemas.ai import ExplainRecommendationResponse
from app.services.ai_service import ai_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/{recommendation_id}/explain", response_model=ExplainRecommendationResponse)
def explain_recommendation_endpoint(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    provider = db.query(Provider).filter(Provider.id == rec.provider_id).first()
    req = db.query(TransportRequest).filter(TransportRequest.id == rec.request_id).first()

    # Get runner-ups
    other_recs = db.query(Recommendation).filter(
        Recommendation.request_id == rec.request_id,
        Recommendation.id != rec.id
    ).all()
    
    runner_ups = []
    for o in other_recs:
        p = db.query(Provider).filter(Provider.id == o.provider_id).first()
        runner_ups.append({
            "provider_name": p.name if p else "Alternative Carrier",
            "cost": o.predicted_cost,
            "eta_hours": o.predicted_eta_hours,
            "match_score": o.match_score,
            "is_ev": p.is_ev if p else False
        })

    ai_result = ai_service.explain_recommendation(
        provider_name=provider.name if provider else "Selected Provider",
        cost=rec.predicted_cost,
        eta_hours=rec.predicted_eta_hours,
        capacity_kg=provider.capacity_kg if provider else 1000.0,
        reliability=provider.reliability_score if provider else 0.95,
        match_score=rec.match_score,
        cargo_weight=req.cargo_weight if req else 200.0,
        origin=req.origin if req else "Salem",
        destination=req.destination if req else "Bangalore",
        deadline=req.deadline if req else "Today",
        runner_ups=runner_ups
    )

    # Save to recommendation record if missing
    if not rec.ai_explanation:
        rec.ai_explanation = ai_result["explanation"]
        db.commit()

    return ExplainRecommendationResponse(
        explanation=ai_result["explanation"],
        model_used=ai_result["model_used"],
        is_fallback=ai_result["is_fallback"]
    )
