from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str = "general"
    job_id: int | None = None
    application_id: int | None = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    job_id: int | None = None
    application_id: int | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationReadUpdate(BaseModel):
    is_read: bool = True