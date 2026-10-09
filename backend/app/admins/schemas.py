from pydantic import BaseModel


class AdminDashboardResponse(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str