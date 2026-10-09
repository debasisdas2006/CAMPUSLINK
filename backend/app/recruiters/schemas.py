from pydantic import BaseModel, Field


class RecruiterProfileCreate(BaseModel):
    company_name: str | None = None

    designation: str | None = None

    phone: str | None = Field(
        default=None,
        max_length=20
    )

    company_description: str | None = None


class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    company_name: str | None
    designation: str | None
    phone: str | None
    company_description: str | None

    class Config:
        from_attributes = True