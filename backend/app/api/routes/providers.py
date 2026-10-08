from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.provider import Provider
from app.schemas.provider import ProviderResponse

router = APIRouter(prefix="/providers", tags=["Providers"])

@router.get("", response_model=List[ProviderResponse])
def get_providers(db: Session = Depends(get_db)):
    return db.query(Provider).filter(Provider.is_active == True).all()
