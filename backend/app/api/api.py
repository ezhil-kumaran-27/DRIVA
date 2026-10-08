from fastapi import APIRouter
from app.api.routes import (
    auth,
    transport_requests,
    recommendations,
    bookings,
    reviews,
    ai,
    providers,
    analytics
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(transport_requests.router)
api_router.include_router(recommendations.router)
api_router.include_router(bookings.router)
api_router.include_router(reviews.router)
api_router.include_router(ai.router)
api_router.include_router(providers.router)
api_router.include_router(analytics.router)
