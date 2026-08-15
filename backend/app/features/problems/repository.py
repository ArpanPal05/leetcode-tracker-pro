from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.problems.models import Problem
from app.shared.enums import Difficulty, Platform, ProblemStatus


class ProblemRepository:

    def create(
        self,
        db: Session,
        problem: Problem,
    ) -> Problem:
        db.add(problem)
        db.commit()
        db.refresh(problem)
        return problem

    def get_by_id(
        self,
        db: Session,
        problem_id: int,
    ) -> Problem | None:
        statement = select(Problem).where(Problem.id == problem_id)
        return db.scalar(statement)

    def get_by_slug(
        self,
        db: Session,
        slug: str,
    ) -> Problem | None:
        statement = select(Problem).where(Problem.slug == slug)
        return db.scalar(statement)

    def get_by_platform_and_external_id(
        self,
        db: Session,
        platform: Platform,
        external_id: str,
    ) -> Problem | None:
        statement = select(Problem).where(
            Problem.platform == platform,
            Problem.external_id == external_id,
        )
        return db.scalar(statement)

    def get_all(
        self,
        db: Session,
    ) -> list[Problem]:
        statement = select(Problem)
        return list(db.scalars(statement))

    def search(
        self,
        db: Session,
        search: str,
    ):
        statement = select(Problem).where(
            Problem.title.ilike(f"%{search}%")
        )
        return list(db.scalars(statement))

    def update(
        self,
        db: Session,
        problem: Problem,
    ):
        db.commit()
        db.refresh(problem)
        return problem

    def delete(
        self,
        db: Session,
        problem: Problem,
    ):
        db.delete(problem)
        db.commit()

    def list(
        self,
        db: Session,
        search: str | None,
        difficulty: Difficulty | None,
        skip: int,
        limit: int,
    ):
        statement = select(Problem)

        if search:
            statement = statement.where(
                Problem.title.ilike(f"%{search}%")
            )

        if difficulty:
            statement = statement.where(
                Problem.difficulty == difficulty
            )

        statement = statement.offset(skip).limit(limit)

        return list(db.scalars(statement))


def get_problem_repository() -> ProblemRepository:
    return ProblemRepository()
