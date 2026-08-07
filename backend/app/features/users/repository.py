from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.users.models import User


class UserRepository:

    def get_by_email(
        self,
        db: Session,
        email: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(User.email == email)
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        user: User,
    ) -> User:

        db.add(user)

        db.commit()

        db.refresh(user)

        return user


def get_user_repository() -> UserRepository:
    return UserRepository()
