import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.models import Topic
from app.features.problems.models import Problem
from app.features.problems.repository import ProblemRepository
from app.features.user_problems.models import UserProblem
from app.features.user_problems.repository import UserProblemRepository
from app.features.users.models import User
from app.features.users.repository import UserRepository
from app.shared.enums import Difficulty, Platform, ProblemStatus


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


def test_user_repository(db):
    repo = UserRepository()

    user = User(username="repo_user", email="repo@example.com", password_hash="hash")
    created = repo.create(db, user)

    assert created.id is not None
    assert repo.get_by_email(db, "repo@example.com").id == created.id
    assert repo.get_by_email(db, "nonexistent@example.com") is None


def test_problem_repository(db):
    repo = ProblemRepository()

    prob = Problem(
        title="Valid Palindrome",
        slug="valid-palindrome",
        platform=Platform.LEETCODE,
        external_id="125",
        difficulty=Difficulty.EASY,
    )
    created = repo.create(db, prob)

    assert created.id is not None
    assert repo.get_by_id(db, created.id).title == "Valid Palindrome"
    assert repo.get_by_slug(db, "valid-palindrome").id == created.id
    assert (
        repo.get_by_platform_and_external_id(db, Platform.LEETCODE, "125").id
        == created.id
    )

    # Test listing problems
    items = repo.list(db, search="Palindrome", difficulty=None, skip=0, limit=10)
    assert len(items) == 1
    assert items[0].id == created.id


def test_user_problem_repository(db):
    user_repo = UserRepository()
    prob_repo = ProblemRepository()
    up_repo = UserProblemRepository()

    user = user_repo.create(db, User(username="u1", email="u1@e.com", password_hash="h"))
    p1 = prob_repo.create(
        db,
        Problem(
            title="Binary Search",
            slug="binary-search",
            platform=Platform.LEETCODE,
            external_id="704",
            difficulty=Difficulty.EASY,
        ),
    )

    up = UserProblem(
        user_id=user.id,
        problem_id=p1.id,
        status=ProblemStatus.SOLVED,
        language="C++",
        favorite=True,
    )
    created_up = up_repo.create(db, up)

    assert created_up.id is not None
    assert up_repo.get_by_id(db, created_up.id).id == created_up.id
    assert (
        up_repo.get_by_user_and_problem(db, user.id, p1.id).id == created_up.id
    )

    # Filtered list
    items, total = up_repo.list_user_problems(
        db, user_id=user.id, search="Binary", status=ProblemStatus.SOLVED
    )
    assert total == 1
    assert items[0].id == created_up.id
