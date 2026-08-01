from sqlalchemy.orm import Session

from app.exceptions.problem import ProblemNotFound
from app.models.problem import Problem
from app.repositories.problem_repository import ProblemRepository
from app.schemas.problem import ProblemCreate, ProblemUpdate


class ProblemService:

    def __init__(self):
        self.repository = ProblemRepository()

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