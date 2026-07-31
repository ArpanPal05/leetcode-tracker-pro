from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services.auth_service import AuthService, get_auth_service

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

service: AuthService = Depends(
    get_auth_service
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    service.register(
        db,
        request,
    )

    return RegisterResponse(
        message="User registered successfully."
    )


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    token = service.login(
        db,
        request,
    )

    return LoginResponse(
        access_token=token,
    )