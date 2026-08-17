import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.models import Topic
from app.features.dashboard.repository import DashboardRepository
from app.features.dashboard.service import DashboardService
from app.features.problems.models import Problem
from app.features.user_problems.models import UserProblem
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
def user(db):
    u = User(username="dashuser", email="dash@example.com", password_hash="hash")
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_dashboard_summary_deterministic_calculations(db, user):
    repo = DashboardRepository()
    service = DashboardService(repository=repo)

    # 1. Easy - Solved - Favorite
    p1 = Problem(title="P1", slug="p1", platform=Platform.LEETCODE, difficulty=Difficulty.EASY, external_id="1")
    # 2. Medium - Attempting
    p2 = Problem(title="P2", slug="p2", platform=Platform.LEETCODE, difficulty=Difficulty.MEDIUM, external_id="2")
    # 3. Hard - Mastered - Favorite
    p3 = Problem(title="P3", slug="p3", platform=Platform.LEETCODE, difficulty=Difficulty.HARD, external_id="3")
    # 4. Easy - Needs Revision
    p4 = Problem(title="P4", slug="p4", platform=Platform.CODEFORCES, difficulty=Difficulty.EASY, external_id="4")
    # 5. Medium - Not Started
    p5 = Problem(title="P5", slug="p5", platform=Platform.CODECHEF, difficulty=Difficulty.MEDIUM, external_id="5")
    db.add_all([p1, p2, p3, p4, p5])
    db.commit()

    up1 = UserProblem(user_id=user.id, problem_id=p1.id, status=ProblemStatus.SOLVED, favorite=True, language="Python", time_taken_minutes=15)
    up2 = UserProblem(user_id=user.id, problem_id=p2.id, status=ProblemStatus.ATTEMPTING, favorite=False, language="C++", time_taken_minutes=30)
    up3 = UserProblem(user_id=user.id, problem_id=p3.id, status=ProblemStatus.MASTERED, favorite=True, language="Python", time_taken_minutes=45)
    up4 = UserProblem(user_id=user.id, problem_id=p4.id, status=ProblemStatus.NEEDS_REVISION, favorite=False, language="Java", time_taken_minutes=20)
    up5 = UserProblem(user_id=user.id, problem_id=p5.id, status=ProblemStatus.NOT_STARTED, favorite=False)

    db.add_all([up1, up2, up3, up4, up5])
    db.commit()

    summary = service.get_summary(db, user.id)

    assert summary.total_tracked == 5
    assert summary.total_solved == 2  # up1 (SOLVED) + up3 (MASTERED)
    assert summary.currently_solving == 1  # up2 (ATTEMPTING)
    assert summary.not_started == 1  # up5 (NOT_STARTED)
    assert summary.favorites == 2  # up1 + up3
    assert summary.needs_revision == 1  # up4
    assert summary.mastered == 1  # up3


def test_dashboard_distributions_and_activity(db, user):
    repo = DashboardRepository()
    service = DashboardService(repository=repo)

    p1 = Problem(title="P1", slug="p1", platform=Platform.LEETCODE, difficulty=Difficulty.EASY, external_id="1")
    p2 = Problem(title="P2", slug="p2", platform=Platform.LEETCODE, difficulty=Difficulty.EASY, external_id="2")
    p3 = Problem(title="P3", slug="p3", platform=Platform.LEETCODE, difficulty=Difficulty.HARD, external_id="3")
    db.add_all([p1, p2, p3])
    db.commit()

    up1 = UserProblem(user_id=user.id, problem_id=p1.id, status=ProblemStatus.SOLVED, language="Python", time_taken_minutes=10, created_at=datetime(2026, 1, 1))
    up2 = UserProblem(user_id=user.id, problem_id=p2.id, status=ProblemStatus.SOLVED, language="Python", time_taken_minutes=20, created_at=datetime(2026, 1, 2))
    up3 = UserProblem(user_id=user.id, problem_id=p3.id, status=ProblemStatus.ATTEMPTING, language="Go", time_taken_minutes=60, created_at=datetime(2026, 1, 3))
    db.add_all([up1, up2, up3])
    db.commit()

    dist = service.get_distributions(db, user.id)
    assert dist.difficulty.easy == 2
    assert dist.difficulty.medium == 0
    assert dist.difficulty.hard == 1

    lang_dict = {l.language: l.count for l in dist.languages}
    assert lang_dict["Python"] == 2
    assert lang_dict["Go"] == 1

    activity = service.get_activity(db, user.id)
    assert len(activity.recent) == 3
    stats = activity.time_statistics
    assert stats.total_minutes == 90
    assert stats.minimum_minutes == 10
    assert stats.maximum_minutes == 60
    assert stats.average_minutes == 30.0
