
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """Generate a secure bcrypt password hash."""
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Verify a password safely, including malformed stored hashes."""

    if not isinstance(hashed_password, str):
        return False

    # Accept standard bcrypt hash prefixes only
    if not hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        return False

    try:
        return pwd_context.verify(
            plain_password,
            hashed_password
        )
    except (ValueError, TypeError):
        return False


# Create JWT access token
def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

    return encoded_jwt