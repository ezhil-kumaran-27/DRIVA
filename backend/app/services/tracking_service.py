import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.booking import Booking

STATUS_PROGRESSION = [
    "CONFIRMED",
    "DRIVER_ASSIGNED",
    "PICKUP",
    "IN_TRANSIT",
    "DELIVERED"
]

ROUTE_WAYPOINTS = {
    "CONFIRMED": {
        "location": "Salem Logistics Hub - Booking Confirmed",
        "latitude": 11.6643,
        "longitude": 78.1460,
        "desc": "Shipment order validated and dispatch scheduled."
    },
    "DRIVER_ASSIGNED": {
        "location": "Salem Fleet Depot - Vehicle Allocated",
        "latitude": 11.6710,
        "longitude": 78.1390,
        "desc": "Commercial freight driver assigned and pre-trip inspection complete."
    },
    "PICKUP": {
        "location": "Salem Industrial Area - Cargo Loaded",
        "latitude": 11.6850,
        "longitude": 78.1250,
        "desc": "200 kg cargo verified, weighed, and securely loaded onto transport."
    },
    "IN_TRANSIT": {
        "location": "NH44 Highway - Krishnagiri Toll Corridor",
        "latitude": 12.5186,
        "longitude": 78.2137,
        "desc": "Vehicle en route along NH44 express freight corridor at 52 km/h."
    },
    "DELIVERED": {
        "location": "Electronic City / Bangalore Destination Hub",
        "latitude": 12.8452,
        "longitude": 77.6602,
        "desc": "Consignment safely delivered and digital POD signature captured."
    }
}

class TrackingService:
    def advance_status(self, db: Session, booking: Booking, new_status: str, notes: str = None) -> Booking:
        status_key = new_status.upper()
        waypoint = ROUTE_WAYPOINTS.get(status_key, {
            "location": booking.current_location,
            "latitude": booking.latitude,
            "longitude": booking.longitude,
            "desc": notes or f"Status changed to {new_status}"
        })

        booking.status = status_key
        booking.current_location = waypoint["location"]
        booking.latitude = waypoint["latitude"]
        booking.longitude = waypoint["longitude"]

        # Parse and append to status history
        history = []
        try:
            if booking.status_history_json:
                history = json.loads(booking.status_history_json)
        except Exception:
            history = []

        history.append({
            "status": status_key,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "location": waypoint["location"],
            "description": notes or waypoint["desc"]
        })

        booking.status_history_json = json.dumps(history)
        booking.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(booking)
        return booking

    def get_next_status(self, current_status: str) -> str:
        curr = current_status.upper()
        if curr in STATUS_PROGRESSION:
            idx = STATUS_PROGRESSION.index(curr)
            if idx < len(STATUS_PROGRESSION) - 1:
                return STATUS_PROGRESSION[idx + 1]
        return current_status

tracking_service = TrackingService()
