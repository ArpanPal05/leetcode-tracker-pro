from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.auth.schemas import (
    LoginRequest,
    LoginResponse,
    MeResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.features.auth.service import AuthService, get_auth_service
from app.features.users.models import User
from app.shared.responses import ApiResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
    service: AuthService = Depends(get_auth_service),
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
    service: AuthService = Depends(get_auth_service),
):
    token = service.login(
        db,
        request,
    )

    return LoginResponse(
        access_token=token,
    )


@router.get(
    "/me",
    response_model=ApiResponse[MeResponse],
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return ApiResponse(
        success=True,
        message="Current user profile retrieved successfully.",
        data=MeResponse(
            id=current_user.id,
            username=current_user.username,
            email=current_user.email,
            created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        ),
    )

