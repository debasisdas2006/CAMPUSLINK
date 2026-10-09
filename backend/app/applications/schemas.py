from pydantic import BaseModel


# ==========================================
# STUDENT - CREATE APPLICATION
# ==========================================

class ApplicationCreate(BaseModel):
    job_id: int
    cover_message: str | None = None


# ==========================================
# STUDENT - APPLICATION RESPONSE
# ==========================================

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    cover_message: str | None

    class Config:
        from_attributes = True


# ==========================================
# RECRUITER - VIEW APPLICATION
# ==========================================

class RecruiterApplicationResponse(BaseModel):
    application_id: int
    student_id: int
    job_id: int
    status: str
    cover_message: str | None


# ==========================================
# RECRUITER - UPDATE APPLICATION STATUS
# ==========================================

class ApplicationStatusUpdate(BaseModel):
    status: str