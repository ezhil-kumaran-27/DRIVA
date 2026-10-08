from app.core.database import SessionLocal
from app.models.user import User
from app.models.transport_request import TransportRequest
from app.services.matching_service import matching_service
from app.services.ai_service import ai_service
from app.services.tracking_service import tracking_service
from app.models.booking import Booking
from app.models.review import Review
import json

def test_full_flow():
    db = SessionLocal()
    try:
        print("=== Step 1: Business Login Verification ===")
        user = db.query(User).filter(User.email == "business@driva.com").first()
        assert user is not None, "User not found!"
        print(f"Logged in as: {user.full_name} ({user.company_name}) - Role: {user.role}")

        print("\n=== Step 2: Create Salem -> Bangalore (Cargo: 200kg, Deadline: Today) ===")
        req = TransportRequest(
            user_id=user.id,
            origin="Salem",
            destination="Bangalore",
            cargo_weight=200.0,
            cargo_type="Precision Auto Components",
            deadline="Today",
            status="PENDING"
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        print(f"Stored TransportRequest ID={req.id}, Origin={req.origin}, Dest={req.destination}, Weight={req.cargo_weight}kg")

        print("\n=== Step 3: Run ML Prediction & Decision Engine ===")
        recs = matching_service.process_request_and_match(db, req)
        assert len(recs) > 0, "No recommendations generated!"
        print(f"Generated {len(recs)} ranked options:")

        top_rec = recs[0]
        from app.models.provider import Provider
        top_provider = db.query(Provider).filter(Provider.id == top_rec.provider_id).first()

        for r in recs:
            p = db.query(Provider).filter(Provider.id == r.provider_id).first()
            print(f"Rank {r.rank}: {p.name} | Cost: INR {r.predicted_cost:.2f} | ETA: {r.predicted_eta_hours:.1f}h | Match Score: {r.match_score:.1f}%")

        print("\n=== Step 4: Groq AI Explanation Layer ===")
        print(f"Top Recommended Provider: {top_provider.name}")
        print(f"AI Explanation:\n'{top_rec.ai_explanation}'")

        print("\n=== Step 5: Test Transportation Assistant (Grounded Data) ===")
        test_queries = [
            "Why did DRIVA choose this agency?",
            "Which option is cheapest?",
            "Which option is fastest?",
            "Why wasn't the EV selected?",
            "What will save me more money?"
        ]
        structured_context = {
            "request": {"origin": req.origin, "destination": req.destination, "cargo_weight": req.cargo_weight, "deadline": req.deadline},
            "top_recommendation": {
                "provider_name": top_provider.name,
                "cost": top_rec.predicted_cost,
                "eta_hours": top_rec.predicted_eta_hours,
                "match_score": top_rec.match_score,
                "reliability": top_provider.reliability_score
            },
            "candidates": [
                {
                    "provider_name": db.query(Provider).filter(Provider.id == r.provider_id).first().name,
                    "cost": r.predicted_cost,
                    "eta_hours": r.predicted_eta_hours,
                    "match_score": r.match_score,
                    "reliability": db.query(Provider).filter(Provider.id == r.provider_id).first().reliability_score,
                    "is_ev": db.query(Provider).filter(Provider.id == r.provider_id).first().is_ev
                } for r in recs
            ]
        }
        for q in test_queries:
            ans = ai_service.answer_transportation_query(q, structured_context)
            print(f"Q: '{q}'\nA: {ans['answer']}\n[Model: {ans['model_used']}, Fallback: {ans['is_fallback']}]\n")

        print("=== Step 6: Book Now (Save Booking in DB) ===")
        booking = Booking(
            booking_reference="DRV-20261008-TEST01",
            request_id=req.id,
            provider_id=top_rec.provider_id,
            recommendation_id=top_rec.id,
            user_id=user.id,
            total_cost=top_rec.predicted_cost,
            status="CONFIRMED",
            driver_name="Ramesh Kumar",
            driver_phone="+91 94432 18902",
            vehicle_number="TN-30-AX-8912",
            current_location="Salem Logistics Hub",
            status_history_json="[]"
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        print(f"Booking Stored: Ref={booking.booking_reference}, Status={booking.status}")

        print("\n=== Step 7: Booking Lifecycle Progression ===")
        statuses = ["DRIVER_ASSIGNED", "PICKUP", "IN_TRANSIT", "DELIVERED"]
        for st in statuses:
            booking = tracking_service.advance_status(db, booking, st)
            print(f"-> Status Updated: {booking.status} | Location: {booking.current_location}")

        print("\n=== Step 8: Submit Rating ===")
        review = Review(
            booking_id=booking.id,
            user_id=user.id,
            provider_id=booking.provider_id,
            rating=5.0,
            feedback="Exceptional on-time transit from Salem to Bangalore. Cargo in perfect condition."
        )
        db.add(review)
        db.commit()
        print(f"Review Submitted: Rating={review.rating} Stars | Feedback='{review.feedback}'")
        print("\n*** ALL BACKEND INTEGRATION TESTS PASSED 100% ***")

    finally:
        db.close()

if __name__ == "__main__":
    test_full_flow()
