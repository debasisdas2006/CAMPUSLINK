from pydantic import BaseModel, Field


class StudentProfileCreate(BaseModel):
    degree: str | None = None
    branch: str | None = None

    cgpa: float | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    graduation_year: int | None = None

    experience_years: float | None = Field(
        default=None,
        ge=0,
    )

    programming_languages: str | None = None
    technical_skills: str | None = None
    resume_url: str | None = None
    profile_summary: str | None = None


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int

    full_name: str
    email: str

    degree: str | None = None
    branch: str | None = None
    cgpa: float | None = None
    graduation_year: int | None = None

    experience_years: float | None = None

    programming_languages: str | None = None
    technical_skills: str | None = None

    resume_url: str | None = None
    profile_summary: str | None = None

    model_config = {
        "from_attributes": True
    }