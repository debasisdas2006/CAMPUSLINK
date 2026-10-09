from pydantic import BaseModel


class PlacementAnalyticsResponse(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int
    selected_students: int
    pending_applications: int


class CompanyAnalyticsResponse(BaseModel):
    company_id: int
    company_name: str
    total_jobs: int
    total_applications: int


class JobAnalyticsResponse(BaseModel):
    job_id: int
    job_title: str
    total_applications: int
    selected_applications: int