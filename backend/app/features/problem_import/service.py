from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problem_import.client import (
    LeetCodeClient,
    get_leetcode_client,
)
from app.features.problem_import.clients.codechef import (
    CodeChefClient,
    get_codechef_client,
)
from app.features.problem_import.clients.codeforces import (
    CodeforcesClient,
    get_codeforces_client,
)
from app.features.problem_import.normalizer import (
    CommonProblemData,
    normalize_codechef,
    normalize_codeforces,
    normalize_leetcode,
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


class ProblemImportService:
    """
    Service responsible for fetching problem metadata from supported platforms
    (LeetCode, Codeforces, CodeChef) and persisting Problem and Topic entities.
    Knows nothing about users or tracking.
    """

    def __init__(
        self,
        problem_repository: ProblemRepository | None = None,
        topic_repository: TopicRepository | None = None,
        problem_import_repository: ProblemImportRepository | None = None,
        leetcode_client: LeetCodeClient | None = None,
        codeforces_client: CodeforcesClient | None = None,
        codechef_client: CodeChefClient | None = None,
    ):
        self.problem_repository = (
            problem_repository
            if problem_repository is not None
            else get_problem_repository()
        )
        self.topic_repository = (
            topic_repository
            if topic_repository is not None
            else get_topic_repository()
        )
        self.problem_import_repository = (
            problem_import_repository
            if problem_import_repository is not None
            else get_problem_import_repository()
        )
        self.leetcode_client = (
            leetcode_client
            if leetcode_client is not None
            else get_leetcode_client()
        )
        self.codeforces_client = (
            codeforces_client
            if codeforces_client is not None
            else get_codeforces_client()
        )
        self.codechef_client = (
            codechef_client
            if codechef_client is not None
            else get_codechef_client()
        )

    def import_common_problem(self, db: Session, common_data: CommonProblemData) -> Problem:
        """
        Creates/reuses topics and creates a new Problem entity with topics in the database.
        """
        topics = self.topic_repository.get_or_create_many(db, common_data.topic_tags)

        new_problem = Problem(
            title=common_data.title,
            platform=common_data.platform,
            external_id=common_data.external_id,
            slug=common_data.slug,
            difficulty=common_data.difficulty,
            platform_rating=common_data.platform_rating,
            frontend_question_id=common_data.frontend_question_id,
            is_premium=common_data.is_premium,
            acceptance_rate=common_data.acceptance_rate,
        )

        return self.problem_import_repository.create_problem_with_topics(
            db, new_problem, topics
        )

    def import_problem_by_slug(self, db: Session, slug: str) -> Problem:
        """
        Fetches metadata from LeetCode by slug, normalizes, and persists Problem and Topics.
        """
        raw_data = self.leetcode_client.fetch_problem(slug)
        common_data = normalize_leetcode(raw_data)
        return self.import_common_problem(db, common_data)

    def import_codeforces_problem(
        self, db: Session, contest_id: int, problem_index: str
    ) -> Problem:
        """
        Fetches metadata from Codeforces by contest ID and index, normalizes, and persists.
        """
        raw_data = self.codeforces_client.fetch_problem(contest_id, problem_index)
        common_data = normalize_codeforces(raw_data)
        return self.import_common_problem(db, common_data)

    def import_codechef_problem(
        self, db: Session, problem_code: str
    ) -> Problem:
        """
        Fetches metadata from CodeChef by problem code, normalizes, and persists.
        """
        raw_data = self.codechef_client.fetch_problem(problem_code)
        common_data = normalize_codechef(raw_data)
        return self.import_common_problem(db, common_data)


def get_problem_import_service(
    problem_repository: ProblemRepository = Depends(get_problem_repository),
    topic_repository: TopicRepository = Depends(get_topic_repository),
    problem_import_repository: ProblemImportRepository = Depends(get_problem_import_repository),
    leetcode_client: LeetCodeClient = Depends(get_leetcode_client),
    codeforces_client: CodeforcesClient = Depends(get_codeforces_client),
    codechef_client: CodeChefClient = Depends(get_codechef_client),
) -> ProblemImportService:
    return ProblemImportService(
        problem_repository=problem_repository,
        topic_repository=topic_repository,
        problem_import_repository=problem_import_repository,
        leetcode_client=leetcode_client,
        codeforces_client=codeforces_client,
        codechef_client=codechef_client,
    )

