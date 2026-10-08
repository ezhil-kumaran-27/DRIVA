from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsDashboardResponse
from app.services.analytics_service import analytics_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return analytics_service.get_dashboard_metrics(db)
