from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.features.problem_import.parsers.detector import detect_platform
from app.features.problems.schemas import ProblemResponse
from app.shared.enums import ProblemStatus


class UserProblemTrackRequest(BaseModel):
    leetcode_url: str = Field(
        description="Full problem URL (LeetCode, Codeforces, or CodeChef), e.g. https://leetcode.com/problems/two-sum/ or https://codeforces.com/problemset/problem/4/A or https://www.codechef.com/problems/START01"
    )
    status: ProblemStatus = ProblemStatus.NOT_STARTED
    notes: str | None = Field(default=None, max_length=5000)
    language: str | None = Field(default=None, max_length=50)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    solution_url: str | None = Field(default=None, max_length=500)
    favorite: bool = False

    @field_validator("leetcode_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        stripped = value.strip()
        detect_platform(stripped)
        return stripped


class UserProblemCreate(BaseModel):
    problem_id: int = Field(gt=0, description="ID of the problem to track")
    status: ProblemStatus = ProblemStatus.NOT_STARTED
    notes: str | None = Field(default=None, max_length=5000)
    language: str | None = Field(default=None, max_length=50)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    solution_url: str | None = Field(default=None, max_length=500)
    favorite: bool = False


class UserProblemUpdate(BaseModel):
    status: ProblemStatus | None = None
    notes: str | None = Field(default=None, max_length=5000)
    language: str | None = Field(default=None, max_length=50)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    solution_url: str | None = Field(default=None, max_length=500)
    favorite: bool | None = None


class UserProblemStatusUpdate(BaseModel):
    status: ProblemStatus


class UserProblemResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    status: ProblemStatus
    notes: str | None = None
    language: str | None = None
    time_taken_minutes: int | None = None
    revision_count: int
    favorite: bool
    solution_url: str | None = None
    solved_at: datetime | None = None
    first_attempted_at: datetime
    last_revised_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    problem: ProblemResponse | None = None

    model_config = {
        "from_attributes": True
    }


class PaginatedUserProblemResponse(BaseModel):
    items: list[UserProblemResponse]
    total: int
    page: int
    size: int
    pages: int
