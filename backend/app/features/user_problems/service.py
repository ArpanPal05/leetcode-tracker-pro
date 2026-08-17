from datetime import datetime, timezone

from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problems.exceptions import ProblemNotFound
from app.features.problems.repository import ProblemRepository, get_problem_repository
from app.features.problems.resolver import (
    ProblemResolverService,
    get_problem_resolver_service,
)
from app.features.user_problems.exceptions import (
    UserProblemAlreadyExists,
    UserProblemNotFound,
)
from app.features.user_problems.models import UserProblem
from app.features.user_problems.repository import (
    UserProblemRepository,
    get_user_problem_repository,
)
from app.features.user_problems.schemas import (
    PaginatedUserProblemResponse,
    UserProblemCreate,
    UserProblemTrackRequest,
    UserProblemUpdate,
)
from app.shared.enums import ProblemStatus


class UserProblemService:

    def __init__(
        self,
        repository: UserProblemRepository | None = None,
        problem_repository: ProblemRepository | None = None,
        problem_resolver: ProblemResolverService | None = None,
    ):
        self.repository = (
            repository
            if isinstance(repository, UserProblemRepository)
            else get_user_problem_repository()
        )
        self.problem_repository = (
            problem_repository
            if isinstance(problem_repository, ProblemRepository)
            else get_problem_repository()
        )
        self.problem_resolver = (
            problem_resolver
            if isinstance(problem_resolver, ProblemResolverService)
            else get_problem_resolver_service()
        )

    def track_problem_by_url(
        self,
        db: Session,
        user_id: int,
        request: UserProblemTrackRequest,
    ) -> UserProblem:
        """
        Primary entry point for frontend: resolves the problem from a LeetCode URL
        (fetching from DB or importing from LeetCode automatically), then tracks it.
        """
        problem = self.problem_resolver.resolve_problem(db, request.leetcode_url)

        # Check if user is already tracking this problem
        existing = self.repository.get_by_user_and_problem(
            db,
            user_id=user_id,
            problem_id=problem.id,
        )
        if existing is not None:
            raise UserProblemAlreadyExists()

        now = datetime.now(timezone.utc)
        solved_at = (
            now
            if request.status in (ProblemStatus.SOLVED, ProblemStatus.MASTERED)
            else None
        )

        user_problem = UserProblem(
            user_id=user_id,
            problem_id=problem.id,
            status=request.status,
            notes=request.notes,
            language=request.language,
            time_taken_minutes=request.time_taken_minutes,
            solution_url=request.solution_url,
            favorite=request.favorite,
            first_attempted_at=now,
            solved_at=solved_at,
        )

        return self.repository.create(db, user_problem)

    def track_problem(
        self,
        db: Session,
        user_id: int,
        request: UserProblemCreate,
    ) -> UserProblem:
        # Check if the target problem exists
        problem = self.problem_repository.get_by_id(db, request.problem_id)
        if problem is None:
            raise ProblemNotFound()

        # Check if user is already tracking this problem
        existing = self.repository.get_by_user_and_problem(
            db,
            user_id=user_id,
            problem_id=request.problem_id,
        )
        if existing is not None:
            raise UserProblemAlreadyExists()

        now = datetime.now(timezone.utc)
        solved_at = (
            now
            if request.status in (ProblemStatus.SOLVED, ProblemStatus.MASTERED)
            else None
        )

        user_problem = UserProblem(
            user_id=user_id,
            problem_id=request.problem_id,
            status=request.status,
            notes=request.notes,
            language=request.language,
            time_taken_minutes=request.time_taken_minutes,
            solution_url=request.solution_url,
            favorite=request.favorite,
            first_attempted_at=now,
            solved_at=solved_at,
        )

        return self.repository.create(db, user_problem)

    def get_user_problem(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
    ) -> UserProblem:
        user_problem = self.repository.get_by_id(db, user_problem_id)
        if user_problem is None or user_problem.user_id != user_id:
            raise UserProblemNotFound()
        return user_problem

    def update_user_problem(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
        request: UserProblemUpdate,
    ) -> UserProblem:
        user_problem = self.get_user_problem(db, user_problem_id, user_id)

        update_data = request.model_dump(exclude_unset=True)

        # Check if status changed to SOLVED or MASTERED and update solved_at if not set
        if "status" in update_data and update_data["status"] in (
            ProblemStatus.SOLVED,
            ProblemStatus.MASTERED,
        ):
            if user_problem.solved_at is None:
                user_problem.solved_at = datetime.now(timezone.utc)

        for field, value in update_data.items():
            if field == "solved_at" and user_problem.solved_at is not None:
                continue
            setattr(user_problem, field, value)

        return self.repository.update(db, user_problem)

    def delete_user_problem(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
    ) -> None:
        user_problem = self.get_user_problem(db, user_problem_id, user_id)
        self.repository.delete(db, user_problem)

    def toggle_favorite(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
    ) -> UserProblem:
        user_problem = self.get_user_problem(db, user_problem_id, user_id)
        user_problem.favorite = not user_problem.favorite
        return self.repository.update(db, user_problem)

    def increment_revision(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
    ) -> UserProblem:
        user_problem = self.get_user_problem(db, user_problem_id, user_id)
        user_problem.revision_count += 1
        user_problem.last_revised_at = datetime.now(timezone.utc)
        return self.repository.update(db, user_problem)

    def update_status(
        self,
        db: Session,
        user_problem_id: int,
        user_id: int,
        status: ProblemStatus,
    ) -> UserProblem:
        user_problem = self.get_user_problem(db, user_problem_id, user_id)
        user_problem.status = status
        if status in (ProblemStatus.SOLVED, ProblemStatus.MASTERED) and not user_problem.solved_at:
            user_problem.solved_at = datetime.now(timezone.utc)
        return self.repository.update(db, user_problem)

    def list_user_problems(
        self,
        db: Session,
        user_id: int,
        search: str | None = None,
        status: ProblemStatus | None = None,
        language: str | None = None,
        favorite: bool | None = None,
        page: int = 1,
        size: int = 20,
    ) -> PaginatedUserProblemResponse:
        skip = (page - 1) * size
        items, total = self.repository.list_user_problems(
            db,
            user_id=user_id,
            search=search,
            status=status,
            language=language,
            favorite=favorite,
            skip=skip,
            limit=size,
        )
        pages = (total + size - 1) // size if total > 0 else 0
        return PaginatedUserProblemResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
        )


def get_user_problem_service(
    repository: UserProblemRepository = Depends(get_user_problem_repository),
    problem_repository: ProblemRepository = Depends(get_problem_repository),
    problem_resolver: ProblemResolverService = Depends(get_problem_resolver_service),
) -> UserProblemService:
    return UserProblemService(
        repository=repository,
        problem_repository=problem_repository,
        problem_resolver=problem_resolver,
    )
