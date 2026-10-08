from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.provider import Provider
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.post("", response_model=ReviewResponse)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == review_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    existing = db.query(Review).filter(Review.booking_id == review_in.booking_id).first()
    if existing:
        existing.rating = review_in.rating
        existing.feedback = review_in.feedback
        db.commit()
        db.refresh(existing)
        return existing

    rev = Review(
        booking_id=booking.id,
        user_id=current_user.id,
        provider_id=booking.provider_id,
        rating=review_in.rating,
        feedback=review_in.feedback
    )
    db.add(rev)

    # Recalculate provider average rating
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if provider:
        all_revs = db.query(Review).filter(Review.provider_id == provider.id).all()
        ratings = [r.rating for r in all_revs] + [review_in.rating]
        provider.avg_rating = round(sum(ratings) / len(ratings), 1)

    db.commit()
    db.refresh(rev)
    return rev

@router.get("", response_model=List[ReviewResponse])
def list_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Review).filter(Review.user_id == current_user.id).all()
