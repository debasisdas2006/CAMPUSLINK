from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.ai_ml.schemas import MatchRequest, MatchResponse
from app.ai_ml.service import match_student_with_job


router = APIRouter(
    prefix="/ai",
    tags=["AI/ML Matching"]
)


@router.post("/match", response_model=MatchResponse)
def match_student(
    data: MatchRequest,
    db: Session = Depends(get_db)
):
    try:
        result = match_student_with_job(
            db=db,
            student_id=data.student_id,
            job_id=data.job_id
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )