import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.transport_request import TransportRequest
from app.models.recommendation import Recommendation
from app.models.provider import Provider
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingUpdateStatus, BookingResponse
from app.schemas.provider import ProviderResponse
from app.services.tracking_service import tracking_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def _format_booking_response(b: Booking, db: Session) -> BookingResponse:
    provider = db.query(Provider).filter(Provider.id == b.provider_id).first()
    p_resp = ProviderResponse.from_orm(provider) if provider else None
    history = []
    try:
        if b.status_history_json:
            history = json.loads(b.status_history_json)
    except Exception:
        history = []

    return BookingResponse(
        id=b.id,
        booking_reference=b.booking_reference,
        request_id=b.request_id,
        provider_id=b.provider_id,
        recommendation_id=b.recommendation_id,
        user_id=b.user_id,
        total_cost=b.total_cost,
        status=b.status,
        driver_name=b.driver_name,
        driver_phone=b.driver_phone,
        vehicle_number=b.vehicle_number,
        current_location=b.current_location,
        latitude=b.latitude,
        longitude=b.longitude,
        status_history=history,
        created_at=b.created_at,
        updated_at=b.updated_at,
        provider=p_resp
    )

@router.post("", response_model=BookingResponse)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == booking_in.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    req = db.query(TransportRequest).filter(TransportRequest.id == booking_in.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Transport request not found")

    provider = db.query(Provider).filter(Provider.id == rec.provider_id).first()

    booking_ref = f"DRV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    # Initial history event
    initial_history = [{
        "status": "CONFIRMED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": "Salem Logistics Hub - Booking Confirmed",
        "description": f"Shipment booked with {provider.name if provider else 'Carrier'}. Dispatch pending."
    }]

    booking = Booking(
        booking_reference=booking_ref,
        request_id=req.id,
        provider_id=rec.provider_id,
        recommendation_id=rec.id,
        user_id=current_user.id,
        total_cost=rec.predicted_cost,
        status="CONFIRMED",
        driver_name="Ramesh Kumar",
        driver_phone="+91 94432 18902",
        vehicle_number="TN-30-AX-8912" if not (provider and provider.is_ev) else "KA-01-EV-4421",
        current_location="Salem Logistics Hub",
        latitude=11.6643,
        longitude=78.1460,
        status_history_json=json.dumps(initial_history)
    )

    req.status = "BOOKED"
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return _format_booking_response(booking, db)

@router.get("", response_model=List[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    return [_format_booking_response(b, db) for b in bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _format_booking_response(b, db)

@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status_update: BookingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Progress lifecycle:
    CONFIRMED -> DRIVER_ASSIGNED -> PICKUP -> IN_TRANSIT -> DELIVERED
    """
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    updated = tracking_service.advance_status(
        db=db,
        booking=b,
        new_status=status_update.status,
        notes=status_update.notes
    )

    if status_update.status.upper() == "DELIVERED":
        req = db.query(TransportRequest).filter(TransportRequest.id == b.request_id).first()
        if req:
            req.status = "COMPLETED"
            db.commit()

    return _format_booking_response(updated, db)
