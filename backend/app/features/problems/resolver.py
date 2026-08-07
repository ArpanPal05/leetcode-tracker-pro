from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problem_import.client import extract_slug_from_url
from app.features.problem_import.exceptions import InvalidLeetCodeURL
from app.features.problem_import.service import (
    ProblemImportService,
    get_problem_import_service,
)
from app.features.problems.models import Problem
from app.features.problems.repository import (
    ProblemRepository,
    get_problem_repository,
)


class ProblemResolverService:
    """
    Service responsible ONLY for obtaining a Problem entity given a LeetCode URL.
    Checks the local database cache first; if missing, delegates to ProblemImportService.
    """

    def __init__(
        self,
        problem_repository: ProblemRepository | None = None,
        problem_import_service: ProblemImportService | None = None,
    ):
        self.problem_repository = (
            problem_repository
            if isinstance(problem_repository, ProblemRepository)
            else get_problem_repository()
        )
        self.problem_import_service = (
            problem_import_service
            if isinstance(problem_import_service, ProblemImportService)
            else get_problem_import_service()
        )

    def resolve_problem(self, db: Session, leetcode_url: str) -> Problem:
        """
        Given a LeetCode URL, extracts slug, checks database cache,
        or imports from LeetCode if missing. Returns the Problem entity.
        """
        try:
            slug = extract_slug_from_url(leetcode_url)
        except ValueError as exc:
            raise InvalidLeetCodeURL(str(exc)) from exc

        existing_problem = self.problem_repository.get_by_slug(db, slug)

        if existing_problem is not None:
            return existing_problem

        return self.problem_import_service.import_problem_by_slug(db, slug)


def get_problem_resolver_service(
    problem_repository: ProblemRepository = Depends(get_problem_repository),
    problem_import_service: ProblemImportService = Depends(get_problem_import_service),
) -> ProblemResolverService:
    return ProblemResolverService(
        problem_repository=problem_repository,
        problem_import_service=problem_import_service,
    )
