from dataclasses import dataclass, field
import re

from app.features.problem_import.client import LeetCodeProblemData, TopicTag
from app.features.problem_import.clients.codeforces import CodeforcesProblemData
from app.features.problem_import.difficulty import map_codeforces_rating_to_difficulty
from app.shared.enums import Difficulty, Platform


def slugify_tag(tag: str) -> str:
    """Helper to generate a clean URL-friendly slug for a topic tag."""
    cleaned = tag.strip().lower()
    cleaned = re.sub(r"[^\w\s-]", "", cleaned)
    return re.sub(r"[-\s]+", "-", cleaned)


@dataclass
class CommonProblemData:
    platform: Platform
    external_id: str
    title: str
    difficulty: Difficulty
    platform_rating: int | None = None
    slug: str | None = None
    frontend_question_id: str | None = None
    is_premium: bool = False
    acceptance_rate: float | None = None
    topic_tags: list[TopicTag] = field(default_factory=list)


def normalize_leetcode(data: LeetCodeProblemData) -> CommonProblemData:
    try:
        difficulty_enum = Difficulty(data.difficulty)
    except ValueError:
        difficulty_enum = Difficulty.MEDIUM

    external_id = data.frontend_question_id or data.slug

    return CommonProblemData(
        platform=Platform.LEETCODE,
        external_id=external_id,
        title=data.title,
        difficulty=difficulty_enum,
        platform_rating=None,
        slug=data.slug,
        frontend_question_id=data.frontend_question_id,
        is_premium=data.is_premium,
        acceptance_rate=data.acceptance_rate,
        topic_tags=data.topic_tags,
    )


def normalize_codeforces(data: CodeforcesProblemData) -> CommonProblemData:
    difficulty_enum = map_codeforces_rating_to_difficulty(data.rating)
    external_id = f"{data.contest_id}{data.problem_index}"

    topic_tags = [
        TopicTag(name=tag, slug=slugify_tag(tag))
        for tag in data.tags
        if tag.strip()
    ]

    return CommonProblemData(
        platform=Platform.CODEFORCES,
        external_id=external_id,
        title=data.title,
        difficulty=difficulty_enum,
        platform_rating=data.rating,
        slug=None,
        frontend_question_id=None,
        is_premium=False,
        acceptance_rate=None,
        topic_tags=topic_tags,
    )
