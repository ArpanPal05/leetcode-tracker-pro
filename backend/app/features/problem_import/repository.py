from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.problem_import.client import TopicTag
from app.features.problem_import.models import Topic
from app.features.problems.models import Problem


class TopicRepository:

    def get_by_slug(self, db: Session, slug: str) -> Topic | None:
        statement = select(Topic).where(Topic.slug == slug)
        return db.scalar(statement)

    def get_or_create_many(self, db: Session, tags: list[TopicTag]) -> list[Topic]:
        if not tags:
            return []

        slugs = [t.slug for t in tags]
        statement = select(Topic).where(Topic.slug.in_(slugs))
        existing_topics = list(db.scalars(statement))
        existing_slug_map = {t.slug: t for t in existing_topics}

        result = []
        new_topics = []

        for tag in tags:
            if tag.slug in existing_slug_map:
                result.append(existing_slug_map[tag.slug])
            else:
                new_topic = Topic(name=tag.name, slug=tag.slug)
                db.add(new_topic)
                new_topics.append(new_topic)
                result.append(new_topic)

        if new_topics:
            db.flush()

        return result


class ProblemImportRepository:

    def create_problem_with_topics(
        self,
        db: Session,
        problem: Problem,
        topics: list[Topic],
    ) -> Problem:
        problem.topics = topics
        db.add(problem)
        db.commit()
        db.refresh(problem)
        return problem


def get_topic_repository() -> TopicRepository:
    return TopicRepository()


def get_problem_import_repository() -> ProblemImportRepository:
    return ProblemImportRepository()
