import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.transport_request import TransportRequest
from app.models.provider import Provider
from app.models.recommendation import Recommendation
from app.services.ml_service import ml_service
from app.services.decision_engine import decision_engine
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class MatchingService:
    def process_request_and_match(
        self,
        db: Session,
        transport_request: TransportRequest
    ) -> List[Recommendation]:
        """
        Orchestration pipeline:
        POST /transport-requests -> save request -> matching service -> ML prediction
        -> decision engine -> rank options -> save recommendation -> return -> Groq explanation
        """
        # 1. Fetch available active providers
        providers = db.query(Provider).filter(Provider.is_active == True).all()
        if not providers:
            # In case DB is fresh, return empty or seed
            return []

        distance_km = ml_service.get_route_distance(
            transport_request.origin,
            transport_request.destination
        )

        candidates = []
        for p in providers:
            # ML Predictions
            pred_cost = ml_service.predict_cost(
                distance_km=distance_km,
                cargo_weight_kg=transport_request.cargo_weight,
                base_rate_per_km=p.base_rate_per_km,
                is_ev=p.is_ev
            )
            pred_eta = ml_service.predict_eta(
                distance_km=distance_km,
                is_ev=p.is_ev,
                cargo_weight_kg=transport_request.cargo_weight
            )
            suitability = ml_service.predict_suitability(
                cargo_weight_kg=transport_request.cargo_weight,
                provider_capacity_kg=p.capacity_kg,
                is_ev=p.is_ev,
                distance_km=distance_km,
                cargo_type=transport_request.cargo_type
            )

            candidates.append({
                "provider_id": p.id,
                "provider_name": p.name,
                "provider_code": p.code,
                "capacity_kg": p.capacity_kg,
                "base_rate_per_km": p.base_rate_per_km,
                "reliability_score": p.reliability_score,
                "avg_rating": p.avg_rating,
                "is_ev": p.is_ev,
                "fleet_type": p.fleet_type,
                "predicted_cost": pred_cost,
                "predicted_eta_hours": pred_eta,
                "suitability_score": suitability,
            })

        # 2. DRIVA Decision Engine: Multi-factor scoring and ranking
        ranked_candidates = decision_engine.calculate_match_scores(
            candidates,
            deadline=transport_request.deadline
        )

        # 3. Save recommendations to database
        created_recommendations: List[Recommendation] = []
        top_cand = ranked_candidates[0] if ranked_candidates else None
        
        # Prepare runner-ups for AI explanation context
        runner_ups = []
        for cand in ranked_candidates[1:4]:
            runner_ups.append({
                "provider_name": cand["provider_name"],
                "cost": cand["predicted_cost"],
                "eta_hours": cand["predicted_eta_hours"],
                "match_score": cand["match_score"],
                "is_ev": cand["is_ev"]
            })

        # 4. Generate Groq AI explanation for top pick
        top_ai_explanation = None
        if top_cand:
            ai_result = ai_service.explain_recommendation(
                provider_name=top_cand["provider_name"],
                cost=top_cand["predicted_cost"],
                eta_hours=top_cand["predicted_eta_hours"],
                capacity_kg=top_cand["capacity_kg"],
                reliability=top_cand["reliability_score"],
                match_score=top_cand["match_score"],
                cargo_weight=transport_request.cargo_weight,
                origin=transport_request.origin,
                destination=transport_request.destination,
                deadline=transport_request.deadline,
                runner_ups=runner_ups
            )
            top_ai_explanation = ai_result.get("explanation")

        # Persist each recommendation in DB
        for item in ranked_candidates:
            rec = Recommendation(
                request_id=transport_request.id,
                provider_id=item["provider_id"],
                predicted_cost=item["predicted_cost"],
                predicted_eta_hours=item["predicted_eta_hours"],
                suitability_score=item["suitability_score"],
                match_score=item["match_score"],
                rank=item["rank"],
                ai_explanation=top_ai_explanation if item["rank"] == 1 else None
            )
            db.add(rec)
            created_recommendations.append(rec)

        transport_request.status = "MATCHED"
        db.commit()

        # Refresh all created recommendations
        for rec in created_recommendations:
            db.refresh(rec)

        return created_recommendations

matching_service = MatchingService()
