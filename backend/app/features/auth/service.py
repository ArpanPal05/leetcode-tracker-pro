from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.features.auth.exceptions import (
    EmailAlreadyExists,
    InvalidCredentials,
)
from app.features.auth.schemas import LoginRequest, RegisterRequest
from app.features.users.models import User
from app.features.users.repository import UserRepository, get_user_repository


class AuthService:

    def __init__(self, repository: UserRepository | None = None):
        self.repository = repository or UserRepository()

    def register(
        self,
        db: Session,
        request: RegisterRequest,
    ):

        existing_user = self.repository.get_by_email(
            db,
            request.email,
        )

        if existing_user:
            raise EmailAlreadyExists()

        user = User(
            username=request.username,
            email=request.email,
            password_hash=hash_password(
                request.password
            ),
        )

        return self.repository.create(
            db,
            user,
        )

    def login(
        self,
        db: Session,
        request: LoginRequest,
    ):

        user = self.repository.get_by_email(
            db,
            request.email,
        )

        if user is None:
            raise InvalidCredentials()

        if not verify_password(
            request.password,
            user.password_hash,
        ):
            raise ValueError(
                "Invalid email or password."
            )

        token = create_access_token(
            user.email,
        )

        return token


def get_auth_service(
    repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(repository=repository)
