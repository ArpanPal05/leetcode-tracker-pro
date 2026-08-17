import pytest
from datetime import datetime
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.models import Topic
from app.features.problems.exceptions import ProblemNotFound
from app.features.problems.models import Problem
from app.features.problems.repository import ProblemRepository
from app.features.user_problems.exceptions import (
    UserProblemAlreadyExists,
    UserProblemNotFound,
)
from app.features.user_problems.models import UserProblem
from app.features.user_problems.repository import UserProblemRepository
from app.features.user_problems.schemas import (
    UserProblemCreate,
    UserProblemTrackRequest,
    UserProblemUpdate,
)
from app.features.user_problems.service import UserProblemService
from app.features.users.models import User
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


@pytest.fixture
def test_user(db):
    user = User(username="testuser", email="user@example.com", password_hash="hash")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_problem(db):
    problem = Problem(
        title="3Sum",
        slug="3sum",
        platform=Platform.LEETCODE,
        external_id="3sum",
        difficulty=Difficulty.MEDIUM,
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


def test_track_problem_success(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    req = UserProblemCreate(
        problem_id=test_problem.id,
        status=ProblemStatus.SOLVED,
        notes="Two pointers technique",
        language="Python",
        time_taken_minutes=15,
        favorite=True,
    )

    up = service.track_problem(db, test_user.id, req)

    assert up.id is not None
    assert up.user_id == test_user.id
    assert up.problem_id == test_problem.id
    assert up.status == ProblemStatus.SOLVED
    assert up.notes == "Two pointers technique"
    assert up.language == "Python"
    assert up.time_taken_minutes == 15
    assert up.favorite is True
    assert up.solved_at is not None


def test_track_problem_nonexistent_problem_raises(db, test_user):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    req = UserProblemCreate(problem_id=999, status=ProblemStatus.ATTEMPTING)

    with pytest.raises(ProblemNotFound):
        service.track_problem(db, test_user.id, req)


def test_track_problem_duplicate_raises(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    req = UserProblemCreate(problem_id=test_problem.id, status=ProblemStatus.ATTEMPTING)
    service.track_problem(db, test_user.id, req)

    with pytest.raises(UserProblemAlreadyExists):
        service.track_problem(db, test_user.id, req)


def test_get_user_problem_isolation(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    up = UserProblem(
        user_id=test_user.id,
        problem_id=test_problem.id,
        status=ProblemStatus.NOT_STARTED,
    )
    db.add(up)
    db.commit()

    # Successful retrieval by correct owner
    res = service.get_user_problem(db, up.id, test_user.id)
    assert res.id == up.id

    # Attempt retrieval by different user raises UserProblemNotFound
    with pytest.raises(UserProblemNotFound):
        service.get_user_problem(db, up.id, user_id=9999)


def test_update_user_problem(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    up = UserProblem(
        user_id=test_user.id,
        problem_id=test_problem.id,
        status=ProblemStatus.ATTEMPTING,
        time_taken_minutes=10,
    )
    db.add(up)
    db.commit()

    update_req = UserProblemUpdate(
        status=ProblemStatus.SOLVED,
        notes="Optimized solution",
        time_taken_minutes=25,
        solution_url="https://github.com/my-solution",
    )

    updated = service.update_user_problem(db, up.id, test_user.id, update_req)

    assert updated.status == ProblemStatus.SOLVED
    assert updated.notes == "Optimized solution"
    assert updated.time_taken_minutes == 25
    assert updated.solution_url == "https://github.com/my-solution"
    assert updated.solved_at is not None


def test_toggle_favorite_and_increment_revision(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    up = UserProblem(
        user_id=test_user.id,
        problem_id=test_problem.id,
        status=ProblemStatus.SOLVED,
        favorite=False,
        revision_count=0,
    )
    db.add(up)
    db.commit()

    # Toggle favorite to True
    fav_up = service.toggle_favorite(db, up.id, test_user.id)
    assert fav_up.favorite is True

    # Toggle favorite back to False
    unfav_up = service.toggle_favorite(db, up.id, test_user.id)
    assert unfav_up.favorite is False

    # Increment revision count
    rev_up = service.increment_revision(db, up.id, test_user.id)
    assert rev_up.revision_count == 1
    assert rev_up.last_revised_at is not None


def test_delete_user_problem(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    up = UserProblem(
        user_id=test_user.id,
        problem_id=test_problem.id,
        status=ProblemStatus.NOT_STARTED,
    )
    db.add(up)
    db.commit()

    service.delete_user_problem(db, up.id, test_user.id)

    with pytest.raises(UserProblemNotFound):
        service.get_user_problem(db, up.id, test_user.id)


def test_list_user_problems_pagination_and_filter(db, test_user, test_problem):
    service = UserProblemService(
        repository=UserProblemRepository(),
        problem_repository=ProblemRepository(),
    )

    up1 = UserProblem(
        user_id=test_user.id,
        problem_id=test_problem.id,
        status=ProblemStatus.SOLVED,
        language="Python",
        favorite=True,
    )
    db.add(up1)
    db.commit()

    res = service.list_user_problems(
        db,
        user_id=test_user.id,
        status=ProblemStatus.SOLVED,
        language="Python",
        favorite=True,
        page=1,
        size=10,
    )

    assert res.total == 1
    assert len(res.items) == 1
    assert res.items[0].id == up1.id
