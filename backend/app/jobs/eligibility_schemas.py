from pydantic import BaseModel


class EligibilityResponse(BaseModel):
    eligible: bool
    reasons: list[str]


class AvailableJobResponse(BaseModel):
    job_id: int
    job_title: str
    company_id: int
    location: str | None
    eligible: bool
    reasons: list[str]