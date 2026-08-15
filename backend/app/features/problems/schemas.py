from pydantic import BaseModel, Field

from app.shared.enums import Difficulty, Platform


class ProblemCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255,
    )
    slug: str | None = None
    difficulty: Difficulty
    platform: Platform = Platform.LEETCODE
    external_id: str
    platform_rating: int | None = None


class TopicResponse(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {
        "from_attributes": True
    }


class ProblemResponse(BaseModel):
    id: int
    title: str
    slug: str | None = None
    difficulty: Difficulty
    platform: Platform
    external_id: str | None = None
    platform_rating: int | None = None
    frontend_question_id: str | None = None
    is_premium: bool = False
    acceptance_rate: float | None = None
    topics: list[TopicResponse] = []

    model_config = {
        "from_attributes": True
    }


class ProblemUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    difficulty: Difficulty | None = None
    platform: Platform | None = None
    external_id: str | None = None
    platform_rating: int | None = None
