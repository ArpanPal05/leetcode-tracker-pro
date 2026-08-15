from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problem_import.parsers import (
    detect_platform,
    extract_codechef_problem_code,
    extract_codeforces_identifier,
    extract_slug_from_url,
)
from app.features.problem_import.service import (
    ProblemImportService,
    get_problem_import_service,
)
from app.features.problems.models import Problem
from app.features.problems.repository import (
    ProblemRepository,
    get_problem_repository,
)
from app.shared.enums import Platform


class ProblemResolverService:
    """
    Service responsible for obtaining a Problem entity given a problem URL (LeetCode, Codeforces, or CodeChef).
    Checks the local database cache first by platform and identifier;
    if missing, delegates to ProblemImportService to fetch, normalize, and persist.
    """

    def __init__(
        self,
        problem_repository: ProblemRepository | None = None,
        problem_import_service: ProblemImportService | None = None,
    ):
        self.problem_repository = (
            problem_repository
            if problem_repository is not None
            else get_problem_repository()
        )
        self.problem_import_service = (
            problem_import_service
            if problem_import_service is not None
            else get_problem_import_service()
        )

    def resolve_problem(self, db: Session, url: str) -> Problem:
        """
        Given a LeetCode, Codeforces, or CodeChef problem URL, detects platform,
        checks database cache, or imports if missing. Returns the Problem entity.
        """
        platform = detect_platform(url)

        if platform == Platform.LEETCODE:
            slug = extract_slug_from_url(url)
            existing = self.problem_repository.get_by_slug(db, slug)
            if existing is not None:
                return existing
            return self.problem_import_service.import_problem_by_slug(db, slug)

        elif platform == Platform.CODEFORCES:
            identifier = extract_codeforces_identifier(url)
            existing = self.problem_repository.get_by_platform_and_external_id(
                db, Platform.CODEFORCES, identifier.external_id
            )
            if existing is not None:
                return existing
            return self.problem_import_service.import_codeforces_problem(
                db, identifier.contest_id, identifier.problem_index
            )

        elif platform == Platform.CODECHEF:
            problem_code = extract_codechef_problem_code(url)
            existing = self.problem_repository.get_by_platform_and_external_id(
                db, Platform.CODECHEF, problem_code
            )
            if existing is not None:
                return existing
            return self.problem_import_service.import_codechef_problem(
                db, problem_code
            )

        raise ValueError(f"Unsupported platform: {platform}")


def get_problem_resolver_service(
    problem_repository: ProblemRepository = Depends(get_problem_repository),
    problem_import_service: ProblemImportService = Depends(get_problem_import_service),
) -> ProblemResolverService:
    return ProblemResolverService(
        problem_repository=problem_repository,
        problem_import_service=problem_import_service,
    )

