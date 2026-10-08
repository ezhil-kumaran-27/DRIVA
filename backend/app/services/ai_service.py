import os
import json
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger(__name__)

# Attempt to import Groq client
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        self.client = None
        if GROQ_AVAILABLE and self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self.client = None

    def _get_client(self) -> Optional[Any]:
        # Dynamically refresh if api key was set in environment
        if not self.client and GROQ_AVAILABLE:
            key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
            if key:
                try:
                    self.client = Groq(api_key=key)
                except Exception as e:
                    logger.warning(f"Could not initialize Groq client: {e}")
        return self.client

    def explain_recommendation(
        self,
        provider_name: str,
        cost: float,
        eta_hours: float,
        capacity_kg: float,
        reliability: float,
        match_score: float,
        cargo_weight: float,
        origin: str,
        destination: str,
        deadline: str = "Today",
        runner_ups: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        AI Use Case 1: Recommendation Explanation.
        Input: Recommended provider, Cost, ETA, Capacity, Reliability, Match score.
        Output: Concise business-friendly explanation.
        """
        client = self._get_client()

        if client:
            try:
                prompt = f"""You are the enterprise logistics AI explanation engine for DRIVA.
Given the verified backend matching data below, produce a concise, professional, 1-to-2 sentence business-friendly explanation of why this provider is recommended for this shipment.

Shipment Details:
- Origin: {origin}
- Destination: {destination}
- Cargo Weight: {cargo_weight} kg
- Deadline: {deadline}

Top Recommended Provider:
- Provider: {provider_name}
- Total Transportation Cost: INR {cost:,.2f}
- Estimated Delivery Time: {eta_hours:.1f} hours
- Vehicle Capacity: {capacity_kg:,.0f} kg
- Historical Reliability: {reliability * 100:.1f}%
- DRIVA Decision Match Score: {match_score:.1f}/100

Alternative Options considered:
{json.dumps(runner_ups or [], indent=2)}

Guidelines:
- Emphasize meeting delivery deadline, capacity sufficiency, reliability, and competitive cost.
- Do NOT make up any numbers. Use strictly the provided data.
- Tone should match: "{provider_name} is recommended because it meets the delivery deadline, provides sufficient capacity for the {cargo_weight} kg shipment, has strong reliability, and offers a competitive total transportation cost."
- Output ONLY the explanation text, no markdown headers or conversational chatter.
"""

                completion = client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a specialized enterprise logistics AI explanation agent. Be concise, authoritative, and fact-based."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=200
                )
                text = completion.choices[0].message.content.strip()
                if text:
                    return {
                        "explanation": text,
                        "model_used": settings.GROQ_MODEL,
                        "is_fallback": False
                    }
            except Exception as e:
                logger.error(f"Groq API call failed: {e}")

        # Fallback explanation if Groq is unavailable
        reliability_pct = int(reliability * 100) if reliability <= 1.0 else int(reliability)
        fallback_text = (
            f"{provider_name} is recommended because it meets the {deadline.lower()} delivery deadline "
            f"with an estimated {eta_hours:.1f}h transit time, provides sufficient capacity ({int(capacity_kg)} kg) "
            f"for the {cargo_weight:,.0f} kg shipment, maintains a {reliability_pct}% historical reliability rating, "
            f"and achieves an optimal DRIVA match score of {match_score:.1f}% at INR {cost:,.2f}."
        )

        return {
            "explanation": fallback_text,
            "model_used": "Deterministic Rule-Engine (Groq Fallback)",
            "is_fallback": True
        }

    def answer_transportation_query(
        self,
        query: str,
        structured_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        AI Use Case 2: Transportation Assistant for Business Users.
        Must use actual backend data first. Does NOT allow LLM to invent prices or availability.
        """
        client = self._get_client()

        # Extract structured facts for safety & fallback
        candidates = structured_context.get("candidates", [])
        top_pick = structured_context.get("top_recommendation", {})
        request_data = structured_context.get("request", {})

        if client:
            try:
                system_prompt = (
                    "You are the DRIVA AI Transportation Assistant for an enterprise logistics platform.\n"
                    "You assist supply chain managers with intelligent dispatch decisions.\n"
                    "RULES:\n"
                    "1. Use ONLY the provided verified backend data below.\n"
                    "2. NEVER invent provider prices, speeds, vehicles, or capacities.\n"
                    "3. If asked about cheapest or fastest, compare the actual numbers in candidates.\n"
                    "4. If asked why an EV or alternative wasn't chosen, explain based on its cost, capacity, or ETA.\n"
                    "5. Keep responses concise, objective, and executive-ready."
                )

                user_prompt = f"""User Question: "{query}"

Verified Backend Data:
- Route: {request_data.get('origin', 'Salem')} to {request_data.get('destination', 'Bangalore')}
- Cargo Weight: {request_data.get('cargo_weight', 200)} kg
- Deadline: {request_data.get('deadline', 'Today')}
- Top Recommended Provider: {json.dumps(top_pick, indent=2)}
- All Evaluated Candidates:
{json.dumps(candidates, indent=2)}

Please answer the user's question clearly using the exact figures above."""

                completion = client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=350
                )
                answer = completion.choices[0].message.content.strip()
                if answer:
                    return {
                        "answer": answer,
                        "structured_data_used": structured_context,
                        "model_used": settings.GROQ_MODEL,
                        "is_fallback": False
                    }
            except Exception as e:
                logger.error(f"Groq assistant call failed: {e}")

        # Deterministic Grounded Fallback based on real backend data
        answer = self._generate_grounded_fallback_answer(query, top_pick, candidates, request_data)
        return {
            "answer": answer,
            "structured_data_used": structured_context,
            "model_used": "DRIVA Data Engine (Groq Fallback)",
            "is_fallback": True
        }

    def _generate_grounded_fallback_answer(
        self,
        query: str,
        top_pick: Dict[str, Any],
        candidates: List[Dict[str, Any]],
        request_data: Dict[str, Any]
    ) -> str:
        q_lower = query.lower()

        # 1. Cheapest query
        if "cheap" in q_lower or "lowest cost" in q_lower or "least expensive" in q_lower:
            if candidates:
                cheapest = min(candidates, key=lambda c: c.get("cost", 999999))
                diff = abs(top_pick.get("cost", 0) - cheapest.get("cost", 0))
                if cheapest.get("provider_name") == top_pick.get("provider_name"):
                    return f"The cheapest option is {cheapest.get('provider_name')} at INR {cheapest.get('cost', 0):,.2f}, which is also the top recommended provider."
                else:
                    return (
                        f"The cheapest option is {cheapest.get('provider_name')} at INR {cheapest.get('cost', 0):,.2f} "
                        f"(INR {diff:,.2f} lower than {top_pick.get('provider_name')}). However, {top_pick.get('provider_name')} "
                        f"was selected for higher reliability ({top_pick.get('reliability', 0)*100:.0f}% vs {cheapest.get('reliability', 0)*100:.0f}%) "
                        f"and faster ETA ({top_pick.get('eta_hours', 0):.1f}h vs {cheapest.get('eta_hours', 0):.1f}h)."
                    )

        # 2. Fastest query
        if "fast" in q_lower or "quick" in q_lower or "speed" in q_lower or "eta" in q_lower:
            if candidates:
                fastest = min(candidates, key=lambda c: c.get("eta_hours", 999))
                if fastest.get("provider_name") == top_pick.get("provider_name"):
                    return f"The fastest option is {fastest.get('provider_name')} with an estimated transit time of {fastest.get('eta_hours', 0):.1f} hours."
                else:
                    return (
                        f"The fastest option is {fastest.get('provider_name')} ({fastest.get('eta_hours', 0):.1f} hours), "
                        f"but {top_pick.get('provider_name')} ({top_pick.get('eta_hours', 0):.1f} hours) achieved the higher composite "
                        f"match score due to superior cost efficiency (INR {top_pick.get('cost', 0):,.2f} vs INR {fastest.get('cost', 0):,.2f})."
                    )

        # 3. EV query
        if "ev" in q_lower or "electric" in q_lower:
            ev_candidate = next((c for c in candidates if c.get("is_ev", False)), None)
            if ev_candidate:
                if ev_candidate.get("provider_name") == top_pick.get("provider_name"):
                    return f"The selected provider ({top_pick.get('provider_name')}) is an Electric Vehicle fleet with zero direct tailpipe emissions."
                else:
                    return (
                        f"The EV provider ({ev_candidate.get('provider_name')}) was evaluated with an estimated cost of "
                        f"INR {ev_candidate.get('cost', 0):,.2f} and ETA of {ev_candidate.get('eta_hours', 0):.1f}h. It was not selected as top choice "
                        f"because {top_pick.get('provider_name')} offered better cost efficiency (INR {top_pick.get('cost', 0):,.2f}) "
                        f"and higher overall reliability score ({top_pick.get('reliability', 0)*100:.0f}% vs {ev_candidate.get('reliability', 0)*100:.0f}%)."
                    )
            return "No EV provider was eligible for this route that satisfied both capacity and deadline constraints."

        # 4. Save money
        if "save" in q_lower or "money" in q_lower or "budget" in q_lower:
            if candidates:
                cheapest = min(candidates, key=lambda c: c.get("cost", 999999))
                if cheapest.get("provider_name") != top_pick.get("provider_name"):
                    savings = top_pick.get("cost", 0) - cheapest.get("cost", 0)
                    return (
                        f"You could save INR {savings:,.2f} by choosing {cheapest.get('provider_name')} (INR {cheapest.get('cost', 0):,.2f}), "
                        f"though this extends delivery ETA by {cheapest.get('eta_hours', 0) - top_pick.get('eta_hours', 0):.1f} hours."
                    )
                return "The recommended provider is already the most cost-effective tier meeting the delivery window."

        # 5. Why DRIVA choose this agency
        if "why" in q_lower or "choose" in q_lower or "selected" in q_lower:
            return (
                f"DRIVA chose {top_pick.get('provider_name', 'the recommended provider')} with a match score of "
                f"{top_pick.get('match_score', 95):.1f}/100 because it delivers the optimal balance of total cost "
                f"(INR {top_pick.get('cost', 0):,.2f}), {top_pick.get('eta_hours', 0):.1f}h transit window meeting your {request_data.get('deadline', 'today')} deadline, "
                f"and {top_pick.get('reliability', 0)*100:.0f}% verified historical on-time performance."
            )

        # Default fallback
        return (
            f"Based on backend analysis for {request_data.get('origin', 'Salem')} to {request_data.get('destination', 'Bangalore')}, "
            f"{top_pick.get('provider_name')} is ranked #1 with a {top_pick.get('match_score', 95):.1f}% match score, "
            f"estimated cost of INR {top_pick.get('cost', 0):,.2f}, and transit time of {top_pick.get('eta_hours', 0):.1f} hours."
        )

ai_service = AIService()
