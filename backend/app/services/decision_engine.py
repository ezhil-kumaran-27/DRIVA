from typing import List, Dict, Any

class DecisionEngine:
    """
    DRIVA Decision Engine:
    Evaluates multi-attribute candidate vectors using ML predictions, business rules,
    deadline constraints, and provider reliability to compute composite Match Scores
    and generate optimal rankings.
    """

    def calculate_match_scores(
        self,
        candidates: List[Dict[str, Any]],
        deadline: str = "Today"
    ) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        # Find min and max cost and eta across candidates for normalization
        costs = [c["predicted_cost"] for c in candidates]
        etas = [c["predicted_eta_hours"] for c in candidates]

        min_cost = min(costs)
        max_cost = max(costs) if max(costs) > min_cost else min_cost + 1.0

        min_eta = min(etas)
        max_eta = max(etas) if max(etas) > min_eta else min_eta + 1.0

        scored_candidates = []

        for cand in candidates:
            cost = cand["predicted_cost"]
            eta = cand["predicted_eta_hours"]
            reliability = cand["reliability_score"] # e.g. 0.96
            suitability = cand["suitability_score"] # e.g. 95.0

            # 1. Cost Score (0 to 100): Lower cost gets higher score
            cost_ratio = (max_cost - cost) / (max_cost - min_cost) if max_cost > min_cost else 1.0
            cost_score = 70.0 + (cost_ratio * 30.0) # Scale between 70 and 100

            # 2. ETA Score (0 to 100): Faster ETA gets higher score
            eta_ratio = (max_eta - eta) / (max_eta - min_eta) if max_eta > min_eta else 1.0
            eta_score = 70.0 + (eta_ratio * 30.0)

            # Deadline penalty if ETA exceeds 10 hours for "Today"
            if "today" in deadline.lower() and eta > 8.0:
                eta_score -= 20.0

            # 3. Reliability Score (0 to 100)
            reliability_score = reliability * 100.0 if reliability <= 1.0 else reliability

            # 4. Suitability Score (0 to 100)
            suitability_score = suitability

            # Composite Match Score (Weighted Average)
            # Cost (30%), ETA (25%), Reliability (25%), Suitability (20%)
            match_score = (
                0.30 * cost_score +
                0.25 * eta_score +
                0.25 * reliability_score +
                0.20 * suitability_score
            )

            # Clamp between 50 and 99.8
            final_match_score = round(max(50.0, min(99.8, match_score)), 1)

            cand_copy = dict(cand)
            cand_copy["match_score"] = final_match_score
            scored_candidates.append(cand_copy)

        # Sort descending by match_score
        scored_candidates.sort(key=lambda x: x["match_score"], reverse=True)

        # Assign ranks
        for idx, item in enumerate(scored_candidates):
            item["rank"] = idx + 1

        return scored_candidates

decision_engine = DecisionEngine()
