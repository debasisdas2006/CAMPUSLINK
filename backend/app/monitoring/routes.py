from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.monitoring.schemas import (
    SystemHealthResponse,
    SystemStatisticsResponse
)

from app.monitoring.service import (
    check_system_health,
    get_system_statistics
)


router = APIRouter(
    prefix="/monitoring",
    tags=["Monitoring"]
)


@router.get(
    "/health",
    response_model=SystemHealthResponse
)
def system_health(
    db: Session = Depends(get_db)
):
    return check_system_health(db)


@router.get(
    "/statistics",
    response_model=SystemStatisticsResponse
)
def system_statistics(
    db: Session = Depends(get_db)
):
    return get_system_statistics(db)