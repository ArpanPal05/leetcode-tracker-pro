from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.features.problems.schemas import ProblemResponse
from app.shared.enums import ProblemStatus


class UserProblemTrackRequest(BaseModel):
    leetcode_url: str = Field(
        description="Full LeetCode problem URL, e.g. https://leetcode.com/problems/two-sum/"
    )
    status: ProblemStatus = ProblemStatus.NOT_STARTED
    notes: str | None = Field(default=None, max_length=5000)
    language: str | None = Field(default=None, max_length=50)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    solution_url: str | None = Field(default=None, max_length=500)
    favorite: bool = False

    @field_validator("leetcode_url")
    @classmethod
    def validate_leetcode_url(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped.startswith("https://leetcode.com/problems/"):
            raise ValueError(
                "URL must be a valid LeetCode problem URL "
                "(https://leetcode.com/problems/<slug>/)."
            )
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
