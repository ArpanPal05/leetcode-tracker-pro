from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.exceptions.auth import (
    EmailAlreadyExists,
    InvalidCredentials,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:

    def __init__(self):
        self.repository = UserRepository()

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