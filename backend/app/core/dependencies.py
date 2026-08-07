from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.features.users.repository import UserRepository, get_user_repository

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
    user_repository: UserRepository = Depends(get_user_repository),
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        email = payload.get("sub")

        user = user_repository.get_by_email(
            db,
            email,
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        return user

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )