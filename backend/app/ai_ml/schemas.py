from pydantic import BaseModel


class MatchRequest(BaseModel):
    student_id: int
    job_id: int


class MatchResponse(BaseModel):
    student_id: int
    job_id: int
    match_score: float
    reasons: list[str]