from pydantic import BaseModel


class SystemHealthResponse(BaseModel):
    status: str
    database: str
    api_version: str


class SystemStatisticsResponse(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_interviews: int
    total_tests: int