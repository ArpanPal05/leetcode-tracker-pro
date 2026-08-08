from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_tracked: int
    total_solved: int
    currently_solving: int
    not_started: int
    favorites: int
    needs_revision: int
    mastered: int


class DifficultyDistribution(BaseModel):
    easy: int = 0
    medium: int = 0
    hard: int = 0


class LanguageCount(BaseModel):
    language: str
    count: int


class DashboardDistributionsResponse(BaseModel):
    difficulty: DifficultyDistribution
    languages: list[LanguageCount]


class RecentActivityItem(BaseModel):
    title: str
    difficulty: str
    status: str
    language: str | None = None
    tracked_at: str
    solved_at: str | None = None


class TimeStatistics(BaseModel):
    average_minutes: float = 0.0
    minimum_minutes: int = 0
    maximum_minutes: int = 0
    total_minutes: int = 0


class DashboardActivityResponse(BaseModel):
    recent: list[RecentActivityItem]
    time_statistics: TimeStatistics


class DashboardStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int


class HeatmapItem(BaseModel):
    date: str
    count: int
