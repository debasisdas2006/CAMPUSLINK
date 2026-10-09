from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    company_name: str
    industry: str | None = None
    website: str | None = None
    location: str | None = None
    description: str | None = None


class CompanyResponse(BaseModel):
    id: int
    recruiter_id: int
    company_name: str
    industry: str | None
    website: str | None
    location: str | None
    description: str | None

    class Config:
        from_attributes = True