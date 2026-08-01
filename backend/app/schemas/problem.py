from pydantic import BaseModel, Field

from app.models.enums import Difficulty


class ProblemCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255,
    )

    slug: str

    difficulty: Difficulty

    platform: str = "LeetCode"


class ProblemResponse(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: Difficulty
    platform: str

    model_config = {
        "from_attributes": True
    }

class ProblemUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    difficulty: Difficulty | None = None
    platform: str | None = None