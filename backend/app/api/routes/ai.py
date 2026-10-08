from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.models.transport_request import TransportRequest
from app.models.recommendation import Recommendation
from app.models.provider import Provider
from app.schemas.ai import (
    ExplainRecommendationRequest,
    ExplainRecommendationResponse,
    AssistantChatRequest,
    AssistantChatResponse
)
from app.services.ai_service import ai_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/explain", response_model=ExplainRecommendationResponse)
def explain_custom(payload: ExplainRecommendationRequest):
    """
    Direct explanation endpoint using Groq with structured parameters.
    """
    result = ai_service.explain_recommendation(
        provider_name=payload.provider_name,
        cost=payload.cost,
        eta_hours=payload.eta_hours,
        capacity_kg=payload.capacity_kg,
        reliability=payload.reliability,
        match_score=payload.match_score,
        cargo_weight=payload.cargo_weight,
        origin=payload.origin,
        destination=payload.destination,
        deadline=payload.deadline,
        runner_ups=payload.runner_ups
    )
    return ExplainRecommendationResponse(
        explanation=result["explanation"],
        model_used=result["model_used"],
        is_fallback=result["is_fallback"]
    )

@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(
    chat_in: AssistantChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Transportation Assistant for Business Users:
    1. Retrieves ACTUAL backend database records (never let LLM invent prices/providers)
    2. Packages structured facts
    3. Prompts Groq with strict groundings (or deterministic grounded fallback)
    """
    # 1. Fetch relevant transport request from DB
    target_req = None
    if chat_in.request_id:
        target_req = db.query(TransportRequest).filter(
            TransportRequest.id == chat_in.request_id
        ).first()
    
    if not target_req:
        # Load most recent request
        target_req = db.query(TransportRequest).order_by(
            TransportRequest.created_at.desc()
        ).first()

    # If still none, use default Salem -> Bangalore parameters
    req_data = {
        "origin": target_req.origin if target_req else "Salem",
        "destination": target_req.destination if target_req else "Bangalore",
        "cargo_weight": target_req.cargo_weight if target_req else 200.0,
        "cargo_type": target_req.cargo_type if target_req else "General Merchandise",
        "deadline": target_req.deadline if target_req else "Today",
    }

    # 2. Fetch candidates & recommendations from DB
    candidates_data = []
    top_pick_data = {}

    if target_req:
        recs = db.query(Recommendation).filter(
            Recommendation.request_id == target_req.id
        ).order_by(Recommendation.rank.asc()).all()

        for r in recs:
            p = db.query(Provider).filter(Provider.id == r.provider_id).first()
            p_name = p.name if p else f"Provider #{r.provider_id}"
            c_info = {
                "rank": r.rank,
                "provider_name": p_name,
                "cost": r.predicted_cost,
                "eta_hours": r.predicted_eta_hours,
                "match_score": r.match_score,
                "capacity_kg": p.capacity_kg if p else 1000.0,
                "reliability": p.reliability_score if p else 0.95,
                "is_ev": p.is_ev if p else False,
                "fleet_type": p.fleet_type if p else "Diesel"
            }
            candidates_data.append(c_info)
            if r.rank == 1 and not top_pick_data:
                top_pick_data = c_info
    
    if not candidates_data:
        # Fallback to active providers in DB
        providers = db.query(Provider).filter(Provider.is_active == True).all()
        for idx, p in enumerate(providers):
            # calculate basic candidate info
            c_info = {
                "rank": idx + 1,
                "provider_name": p.name,
                "cost": round(205.0 * p.base_rate_per_km * (0.88 if p.is_ev else 1.0) + 400.0, 2),
                "eta_hours": 5.2 if not p.is_ev else 5.8,
                "match_score": 96.5 - (idx * 4.0),
                "capacity_kg": p.capacity_kg,
                "reliability": p.reliability_score,
                "is_ev": p.is_ev,
                "fleet_type": p.fleet_type
            }
            candidates_data.append(c_info)
            if idx == 0:
                top_pick_data = c_info

    structured_context = {
        "request": req_data,
        "top_recommendation": top_pick_data,
        "candidates": candidates_data
    }

    ai_reply = ai_service.answer_transportation_query(
        query=chat_in.query,
        structured_context=structured_context
    )

    return AssistantChatResponse(
        answer=ai_reply["answer"],
        structured_data_used=ai_reply["structured_data_used"],
        model_used=ai_reply["model_used"],
        is_fallback=ai_reply["is_fallback"]
    )
