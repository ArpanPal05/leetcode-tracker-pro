import pytest
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.models import Topic
from app.features.dashboard.repository import DashboardRepository
from app.features.dashboard.service import DashboardService, calculate_streaks
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
    u = User(username="analyticuser", email="analytic@example.com", password_hash="hash")
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_streak_empty_dataset():
    current, longest = calculate_streaks([], current_date=date(2026, 8, 17))
    assert current == 0
    assert longest == 0


def test_streak_single_day_today():
    today = date(2026, 8, 17)
    current, longest = calculate_streaks([today], current_date=today)
    assert current == 1
    assert longest == 1


def test_streak_single_day_yesterday():
    today = date(2026, 8, 17)
    yesterday = date(2026, 8, 16)
    current, longest = calculate_streaks([yesterday], current_date=today)
    assert current == 1
    assert longest == 1


def test_streak_single_day_old():
    today = date(2026, 8, 17)
    old = date(2026, 8, 14)
    current, longest = calculate_streaks([old], current_date=today)
    assert current == 0
    assert longest == 1


def test_streak_consecutive_days():
    today = date(2026, 8, 17)
    dates = [
        date(2026, 8, 17),
        date(2026, 8, 16),
        date(2026, 8, 15),
        date(2026, 8, 14),
    ]
    current, longest = calculate_streaks(dates, current_date=today)
    assert current == 4
    assert longest == 4


def test_streak_non_consecutive_days():
    today = date(2026, 8, 17)
    # Active current streak of 2, but a past streak of 5
    dates = [
        date(2026, 8, 17),
        date(2026, 8, 16),
        # Gap on Aug 15
        date(2026, 8, 10),
        date(2026, 8, 9),
        date(2026, 8, 8),
        date(2026, 8, 7),
        date(2026, 8, 6),
    ]
    current, longest = calculate_streaks(dates, current_date=today)
    assert current == 2
    assert longest == 5


def test_streak_month_and_year_boundaries():
    # Test year boundary (Dec 30, Dec 31 -> Jan 1)
    today = date(2026, 1, 1)
    dates = [
        date(2026, 1, 1),
        date(2025, 12, 31),
        date(2025, 12, 30),
    ]
    current, longest = calculate_streaks(dates, current_date=today)
    assert current == 3
    assert longest == 3


def test_heatmap_data_generation():
    class MockDashboardRepo(DashboardRepository):
        def get_heatmap_raw(self, db, user_id):
            return [
                {"date": "2026-08-10", "count": 2},
                {"date": "2026-08-11", "count": 1},
            ]

    service = DashboardService(repository=MockDashboardRepo())

    heatmap = service.get_heatmap(db=None, user_id=1)

    assert len(heatmap) == 2
    assert heatmap[0].date == "2026-08-10"
    assert heatmap[0].count == 2
    assert heatmap[1].date == "2026-08-11"
    assert heatmap[1].count == 1
