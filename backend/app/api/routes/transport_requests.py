from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.transport_request import TransportRequest
from app.models.recommendation import Recommendation
from app.models.provider import Provider
from app.schemas.transport_request import TransportRequestCreate, TransportRequestResponse
from app.schemas.recommendation import MatchResultResponse, RecommendationResponse
from app.services.matching_service import matching_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/transport-requests", tags=["Transport Requests"])

@router.post("", response_model=MatchResultResponse)
def create_transport_request(
    request_in: TransportRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Core Pipeline:
    1. Save transport request to PostgreSQL
    2. Run matching service with ML prediction (Cost, ETA, Suitability)
    3. Run decision engine to calculate match scores and rank options
    4. Save recommendations to PostgreSQL
    5. Trigger Groq AI explanation
    6. Return top recommendation and ranked candidate list
    """
    transport_req = TransportRequest(
        user_id=current_user.id,
        origin=request_in.origin,
        destination=request_in.destination,
        cargo_weight=request_in.cargo_weight,
        cargo_type=request_in.cargo_type or "General Merchandise",
        deadline=request_in.deadline or "Today",
        special_requirements=request_in.special_requirements,
        status="PENDING"
    )
    db.add(transport_req)
    db.commit()
    db.refresh(transport_req)

    # Execute ML + Decision Engine + Groq pipeline
    recommendations = matching_service.process_request_and_match(db, transport_req)

    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No providers currently available for this route."
        )

    # Format recommendations with provider details
    formatted_recs = []
    for r in recommendations:
        provider = db.query(Provider).filter(Provider.id == r.provider_id).first()
        formatted_recs.append(
            RecommendationResponse(
                id=r.id,
                request_id=r.request_id,
                provider_id=r.provider_id,
                provider=provider,
                predicted_cost=r.predicted_cost,
                predicted_eta_hours=r.predicted_eta_hours,
                suitability_score=r.suitability_score,
                match_score=r.match_score,
                rank=r.rank,
                ai_explanation=r.ai_explanation,
                created_at=r.created_at
            )
        )

    top_rec = formatted_recs[0]

    return MatchResultResponse(
        request_id=transport_req.id,
        origin=transport_req.origin,
        destination=transport_req.destination,
        cargo_weight=transport_req.cargo_weight,
        deadline=transport_req.deadline,
        top_recommendation=top_rec,
        ranked_options=formatted_recs
    )

@router.get("", response_model=List[TransportRequestResponse])
def list_transport_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requests = db.query(TransportRequest).filter(
        TransportRequest.user_id == current_user.id
    ).order_by(TransportRequest.created_at.desc()).all()
    return requests

@router.get("/{request_id}", response_model=TransportRequestResponse)
def get_transport_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(TransportRequest).filter(
        TransportRequest.id == request_id,
        TransportRequest.user_id == current_user.id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Transport request not found")
    return req
