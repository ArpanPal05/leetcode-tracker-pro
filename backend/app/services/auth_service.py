from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest


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
            raise ValueError(
                "Email already registered."
            )

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