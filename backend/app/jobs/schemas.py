from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    job_title: str
    description: str | None = None

    degree_required: str | None = None

    minimum_cgpa: float | None = Field(
        default=None,
        ge=0,
        le=10
    )

    experience_required: float | None = Field(
        default=None,
        ge=0
    )

    programming_languages: str | None = None

    technical_skills: str | None = None

    vacancies: int | None = Field(
        default=None,
        ge=1
    )

    location: str | None = None


class JobResponse(BaseModel):
    id: int
    company_id: int
    job_title: str
    description: str | None
    degree_required: str | None
    minimum_cgpa: float | None
    experience_required: float | None
    programming_languages: str | None
    technical_skills: str | None
    vacancies: int | None
    location: str | None

    class Config:
        from_attributes = True