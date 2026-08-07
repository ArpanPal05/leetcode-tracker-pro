from pydantic import BaseModel, Field, field_validator

from app.features.problems.schemas import TopicResponse
from app.features.user_problems.schemas import UserProblemResponse
from app.shared.enums import ProblemStatus


class LeetCodeImportRequest(BaseModel):
    leetcode_url: str = Field(
        description="Full LeetCode problem URL, e.g. https://leetcode.com/problems/two-sum/"
    )
    status: ProblemStatus = ProblemStatus.NOT_STARTED
    language: str | None = Field(default=None, max_length=50)
    notes: str | None = Field(default=None, max_length=5000)
    time_taken_minutes: int | None = Field(default=None, ge=0)
    favorite: bool = False
    solution_url: str | None = Field(default=None, max_length=500)

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



class LeetCodeImportResponse(BaseModel):
    
    tracked: UserProblemResponse
    imported: bool = Field(
        description="True if the problem was fetched from LeetCode; "
                    "False if it already existed in the database."
    )
