from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse
)
from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(data.password)

    # Create new user
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        role=data.role
    )

    # Save user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


# =========================
# LOGIN
# =========================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT access token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return TokenResponse(
        access_token=access_token
    )


# =========================
# CURRENT USER
# =========================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }