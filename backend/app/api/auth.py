from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


service = AuthService()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):

    try:

        service.register(
            db,
            request,
        )

        return RegisterResponse(
            message="User registered successfully."
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )