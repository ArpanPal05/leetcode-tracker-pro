import pytest
from datetime import timedelta
from unittest.mock import MagicMock
from fastapi import HTTPException
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.base import Base
from app.features.auth.exceptions import EmailAlreadyExists, InvalidCredentials
from app.features.auth.schemas import LoginRequest, RegisterRequest
from app.features.auth.service import AuthService
from app.features.users.models import User
from app.features.users.repository import UserRepository


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_hash_and_verify_password():
    raw_pwd = "SecretPassword123!"
    hashed = hash_password(raw_pwd)

    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_create_access_token():
    subject = "user@example.com"
    token = create_access_token(subject)

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload.get("sub") == subject
    assert "exp" in payload


def test_auth_service_register_success(db):
    repo = UserRepository()
    service = AuthService(repository=repo)

    req = RegisterRequest(
        username="newuser",
        email="newuser@example.com",
        password="Password123!",
    )

    user = service.register(db, req)

    assert user.id is not None
    assert user.username == "newuser"
    assert user.email == "newuser@example.com"
    assert verify_password("Password123!", user.password_hash) is True


def test_auth_service_register_existing_email_raises(db):
    repo = UserRepository()
    service = AuthService(repository=repo)

    existing_user = User(
        username="existing",
        email="existing@example.com",
        password_hash=hash_password("Password123!"),
    )
    db.add(existing_user)
    db.commit()

    req = RegisterRequest(
        username="another",
        email="existing@example.com",
        password="Password123!",
    )

    with pytest.raises(EmailAlreadyExists):
        service.register(db, req)


def test_auth_service_login_success(db):
    repo = UserRepository()
    service = AuthService(repository=repo)

    user = User(
        username="loginuser",
        email="login@example.com",
        password_hash=hash_password("MySecurePass!"),
    )
    db.add(user)
    db.commit()

    login_req = LoginRequest(
        email="login@example.com",
        password="MySecurePass!",
    )

    token = service.login(db, login_req)
    assert isinstance(token, str)

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload.get("sub") == "login@example.com"


def test_auth_service_login_nonexistent_email(db):
    repo = UserRepository()
    service = AuthService(repository=repo)

    login_req = LoginRequest(
        email="nonexistent@example.com",
        password="Password123!",
    )

    with pytest.raises(InvalidCredentials):
        service.login(db, login_req)


def test_auth_service_login_wrong_password(db):
    repo = UserRepository()
    service = AuthService(repository=repo)

    user = User(
        username="loginuser2",
        email="login2@example.com",
        password_hash=hash_password("CorrectPass"),
    )
    db.add(user)
    db.commit()

    login_req = LoginRequest(
        email="login2@example.com",
        password="WrongPassword",
    )

    with pytest.raises(ValueError, match="Invalid email or password"):
        service.login(db, login_req)


def test_get_current_user_dependency_valid(db):
    user = User(
        username="authdepuser",
        email="authdep@example.com",
        password_hash="hashed",
    )
    db.add(user)
    db.commit()

    token = create_access_token(user.email)

    mock_credentials = MagicMock()
    mock_credentials.credentials = token

    repo = UserRepository()
    retrieved_user = get_current_user(
        credentials=mock_credentials,
        db=db,
        user_repository=repo,
    )

    assert retrieved_user.id == user.id
    assert retrieved_user.email == user.email


def test_get_current_user_invalid_token(db):
    mock_credentials = MagicMock()
    mock_credentials.credentials = "invalid.jwt.token"

    repo = UserRepository()
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(
            credentials=mock_credentials,
            db=db,
            user_repository=repo,
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"


def test_get_current_user_user_not_found(db):
    token = create_access_token("missing@example.com")
    mock_credentials = MagicMock()
    mock_credentials.credentials = token

    repo = UserRepository()
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(
            credentials=mock_credentials,
            db=db,
            user_repository=repo,
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"
