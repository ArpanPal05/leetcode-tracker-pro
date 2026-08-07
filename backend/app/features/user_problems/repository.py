from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.features.problems.models import Problem
from app.features.user_problems.models import UserProblem
from app.shared.enums import ProblemStatus


class UserProblemRepository:

    def create(
        self,
        db: Session,
        user_problem: UserProblem,
    ) -> UserProblem:
        db.add(user_problem)
        db.commit()
        db.refresh(user_problem)
        return user_problem

    def update(
        self,
        db: Session,
        user_problem: UserProblem,
    ) -> UserProblem:
        db.commit()
        db.refresh(user_problem)
        return user_problem

    def delete(
        self,
        db: Session,
        user_problem: UserProblem,
    ) -> None:
        db.delete(user_problem)
        db.commit()

    def get_by_id(
        self,
        db: Session,
        user_problem_id: int,
    ) -> UserProblem | None:
        statement = (
            select(UserProblem)
            .options(joinedload(UserProblem.problem))
            .where(UserProblem.id == user_problem_id)
        )
        return db.scalar(statement)

    def get_by_user_and_problem(
        self,
        db: Session,
        user_id: int,
        problem_id: int,
    ) -> UserProblem | None:
        statement = (
            select(UserProblem)
            .options(joinedload(UserProblem.problem))
            .where(
                UserProblem.user_id == user_id,
                UserProblem.problem_id == problem_id,
            )
        )
        return db.scalar(statement)

    def list_user_problems(
        self,
        db: Session,
        user_id: int,
        search: str | None = None,
        status: ProblemStatus | None = None,
        language: str | None = None,
        favorite: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[UserProblem], int]:

        base_query = (
            select(UserProblem)
            .join(UserProblem.problem)
            .where(UserProblem.user_id == user_id)
        )

        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(
                (Problem.title.ilike(search_pattern))
                | (UserProblem.notes.ilike(search_pattern))
            )

        if status:
            base_query = base_query.where(UserProblem.status == status)

        if language:
            base_query = base_query.where(UserProblem.language.ilike(f"%{language}%"))

        if favorite is not None:
            base_query = base_query.where(UserProblem.favorite == favorite)

        # Count total matching items
        count_statement = select(func.count()).select_from(base_query.subquery())
        total = db.scalar(count_statement) or 0

        # Execute paginated query with eager loaded relationships
        paginated_statement = (
            base_query.options(joinedload(UserProblem.problem))
            .order_by(UserProblem.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.scalars(paginated_statement).unique())

        return items, total


def get_user_problem_repository() -> UserProblemRepository:
    return UserProblemRepository()
