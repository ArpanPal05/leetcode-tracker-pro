from datetime import date, timedelta

from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.dashboard.repository import (
    DashboardRepository,
    get_dashboard_repository,
)
from app.features.dashboard.schemas import (
    DashboardActivityResponse,
    DashboardDistributionsResponse,
    DashboardStreakResponse,
    DashboardSummaryResponse,
    HeatmapItem,
)


def calculate_streaks(
    solved_dates: list[date], current_date: date | None = None
) -> tuple[int, int]:
    """
    Given a list of distinct solved calendar dates, calculates:
    - current_streak: consecutive solved days up to today or yesterday
    - longest_streak: maximum consecutive solved days in history
    """
    if not solved_dates:
        return 0, 0

    if current_date is None:
        current_date = date.today()

    yesterday = current_date - timedelta(days=1)

    # Ensure sorted descending
    sorted_dates = sorted(solved_dates, reverse=True)

    # 1. Calculate longest streak across entire history
    longest_streak = 0
    current_temp = 0
    prev_d = None

    for d in sorted_dates:
        if prev_d is None:
            current_temp = 1
        elif prev_d - d == timedelta(days=1):
            current_temp += 1
        elif prev_d == d:
            continue
        else:
            current_temp = 1

        if current_temp > longest_streak:
            longest_streak = current_temp
        prev_d = d

    # 2. Calculate current streak (active if solved today or yesterday)
    most_recent = sorted_dates[0]
    if most_recent != current_date and most_recent != yesterday:
        current_streak = 0
    else:
        current_streak = 1
        prev_d = most_recent
        for d in sorted_dates[1:]:
            if prev_d - d == timedelta(days=1):
                current_streak += 1
                prev_d = d
            elif prev_d == d:
                continue
            else:
                break

    return current_streak, longest_streak


class DashboardService:

    def __init__(
        self,
        repository: DashboardRepository | None = None,
    ):
        self.repository = (
            repository
            if isinstance(repository, DashboardRepository)
            else get_dashboard_repository()
        )

    def get_summary(self, db: Session, user_id: int) -> DashboardSummaryResponse:
        data = self.repository.get_summary_raw(db, user_id)
        return DashboardSummaryResponse(**data)

    def get_distributions(
        self, db: Session, user_id: int
    ) -> DashboardDistributionsResponse:
        data = self.repository.get_distributions_raw(db, user_id)
        return DashboardDistributionsResponse(**data)

    def get_activity(
        self, db: Session, user_id: int
    ) -> DashboardActivityResponse:
        data = self.repository.get_activity_raw(db, user_id)
        return DashboardActivityResponse(**data)

    def get_streak(self, db: Session, user_id: int) -> DashboardStreakResponse:
        solved_dates = self.repository.get_solved_dates_raw(db, user_id)
        current_s, longest_s = calculate_streaks(solved_dates)
        return DashboardStreakResponse(
            current_streak=current_s,
            longest_streak=longest_s,
        )

    def get_heatmap(self, db: Session, user_id: int) -> list[HeatmapItem]:
        data = self.repository.get_heatmap_raw(db, user_id)
        return [HeatmapItem(**item) for item in data]


def get_dashboard_service(
    repository: DashboardRepository = Depends(get_dashboard_repository),
) -> DashboardService:
    return DashboardService(repository=repository)
