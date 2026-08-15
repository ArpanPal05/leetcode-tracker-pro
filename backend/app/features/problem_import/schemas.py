from pydantic import BaseModel, Field, field_validator

from app.features.problem_import.parsers.detector import detect_platform
from app.features.problems.schemas import TopicResponse
from app.features.user_problems.schemas import UserProblemResponse
from app.shared.enums import ProblemStatus


class ProblemImportRequest(BaseModel):
    problem_url: str = Field(
        description="Full problem URL (LeetCode or Codeforces), e.g. https://leetcode.com/problems/two-sum/ or https://codeforces.com/problemset/problem/4/A"
    )
    status: ProblemStatus = ProblemStatus.NOT_STARTED
    language: str | None = Field(default=None, max_length=50)
    notes: str | None = Field(default=None, max_length=5000)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    favorite: bool = False
    solution_url: str | None = Field(default=None, max_length=500)

    @field_validator("problem_url")
    @classmethod
    def validate_problem_url(cls, value: str) -> str:
        stripped = value.strip()
        detect_platform(stripped)
        return stripped


class ProblemImportResponse(BaseModel):
    tracked: UserProblemResponse
    imported: bool = Field(
        description="True if the problem was fetched from external API; "
                    "False if it already existed in the database."
    )


class LeetCodeImportRequest(ProblemImportRequest):
    leetcode_url: str = Field(
        default="",
        description="Full LeetCode problem URL (legacy alias for problem_url)"
    )

    @field_validator("leetcode_url", mode="before")
    @classmethod
    def set_problem_url_from_leetcode_url(cls, value: str) -> str:
        return value

    def model_post_init(self, __context) -> None:
        if self.leetcode_url and not self.problem_url:
            self.problem_url = self.leetcode_url
        elif self.problem_url and not self.leetcode_url:
            self.leetcode_url = self.problem_url


class LeetCodeImportResponse(ProblemImportResponse):
    pass
