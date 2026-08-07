from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problem_import.client import (
    LeetCodeClient,
    get_leetcode_client,
)
from app.features.problem_import.repository import (
    ProblemImportRepository,
    TopicRepository,
    get_problem_import_repository,
    get_topic_repository,
)
from app.features.problems.models import Problem
from app.features.problems.repository import (
    ProblemRepository,
    get_problem_repository,
)
from app.shared.enums import Difficulty


class ProblemImportService:
    """
    Service responsible ONLY for fetching problem metadata from LeetCode
    and persisting Problem and Topic entities.
    Knows nothing about users or tracking.
    """

    def __init__(
        self,
        problem_repository: ProblemRepository | None = None,
        topic_repository: TopicRepository | None = None,
        problem_import_repository: ProblemImportRepository | None = None,
        leetcode_client: LeetCodeClient | None = None,
    ):
        self.problem_repository = (
            problem_repository
            if isinstance(problem_repository, ProblemRepository)
            else get_problem_repository()
        )
        self.topic_repository = (
            topic_repository
            if isinstance(topic_repository, TopicRepository)
            else get_topic_repository()
        )
        self.problem_import_repository = (
            problem_import_repository
            if isinstance(problem_import_repository, ProblemImportRepository)
            else get_problem_import_repository()
        )
        self.leetcode_client = (
            leetcode_client
            if isinstance(leetcode_client, LeetCodeClient)
            else get_leetcode_client()
        )

    def import_problem_by_slug(self, db: Session, slug: str) -> Problem:
        """
        Fetches metadata from LeetCode by slug, creates missing Topic tags,
        and saves the Problem entity with topics in the database.
        """
        data = self.leetcode_client.fetch_problem(slug)

        try:
            difficulty_enum = Difficulty(data.difficulty)
        except ValueError:
            difficulty_enum = Difficulty.MEDIUM

        topics = self.topic_repository.get_or_create_many(db, data.topic_tags)

        new_problem = Problem(
            title=data.title,
            slug=data.slug,
            difficulty=difficulty_enum,
            platform="LeetCode",
            frontend_question_id=data.frontend_question_id,
            is_premium=data.is_premium,
            acceptance_rate=data.acceptance_rate,
        )

        return self.problem_import_repository.create_problem_with_topics(
            db, new_problem, topics
        )


def get_problem_import_service(
    problem_repository: ProblemRepository = Depends(get_problem_repository),
    topic_repository: TopicRepository = Depends(get_topic_repository),
    problem_import_repository: ProblemImportRepository = Depends(get_problem_import_repository),
    leetcode_client: LeetCodeClient = Depends(get_leetcode_client),
) -> ProblemImportService:
    return ProblemImportService(
        problem_repository=problem_repository,
        topic_repository=topic_repository,
        problem_import_repository=problem_import_repository,
        leetcode_client=leetcode_client,
    )
