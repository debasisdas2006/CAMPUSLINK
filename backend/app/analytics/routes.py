from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.analytics.schemas import (
    PlacementAnalyticsResponse,
    CompanyAnalyticsResponse,
    JobAnalyticsResponse
)

from app.analytics.service import (
    get_placement_analytics,
    get_company_analytics,
    get_job_analytics
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get(
    "/placement",
    response_model=PlacementAnalyticsResponse
)
def placement_analytics(
    db: Session = Depends(get_db)
):
    return get_placement_analytics(db)


@router.get(
    "/company/{company_id}",
    response_model=CompanyAnalyticsResponse
)
def company_analytics(
    company_id: int,
    db: Session = Depends(get_db)
):
    try:
        return get_company_analytics(
            db=db,
            company_id=company_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.get(
    "/job/{job_id}",
    response_model=JobAnalyticsResponse
)
def job_analytics(
    job_id: int,
    db: Session = Depends(get_db)
):
    try:
        return get_job_analytics(
            db=db,
            job_id=job_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )