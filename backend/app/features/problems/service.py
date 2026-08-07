from fastapi import Depends
from sqlalchemy.orm import Session

from app.features.problems.exceptions import ProblemNotFound
from app.features.problems.models import Problem
from app.features.problems.repository import ProblemRepository, get_problem_repository
from app.features.problems.schemas import ProblemCreate, ProblemUpdate


class ProblemService:

    def __init__(self, repository: ProblemRepository | None = None):
        self.repository = repository or ProblemRepository()

    def create_problem(
        self,
        db: Session,
        request: ProblemCreate,
    ):

        existing = self.repository.get_by_slug(
            db,
            request.slug,
        )

        if existing:
            raise ValueError(
                "Problem already exists."
            )

        problem = Problem(
            title=request.title,
            slug=request.slug,
            difficulty=request.difficulty,
            platform=request.platform,
        )

        return self.repository.create(
            db,
            problem,
        )

    def list_problems(
        self,
        db: Session,
    ):

        return self.repository.get_all(db)

    def get_problem(
        self,
        db: Session,
        problem_id: int,
    ):

        problem = self.repository.get_by_id(
            db,
            problem_id,
        )

        if problem is None:
            raise ProblemNotFound()

        return problem

    def update_problem(
        self,
        db: Session,
        problem_id: int,
        request: ProblemUpdate,
    ):

        problem = self.get_problem(
            db,
            problem_id,
        )

        updates = request.model_dump(
            exclude_unset=True
        )

        for field, value in updates.items():
            setattr(
                problem,
                field,
                value,
            )

        return self.repository.update(
            db,
            problem,
        )

    def delete_problem(
        self,
        db: Session,
        problem_id: int,
    ):

        problem = self.get_problem(
            db,
            problem_id,
        )

        self.repository.delete(
            db,
            problem,
        )


def get_problem_service(
    repository: ProblemRepository = Depends(get_problem_repository),
) -> ProblemService:
    return ProblemService(repository=repository)
