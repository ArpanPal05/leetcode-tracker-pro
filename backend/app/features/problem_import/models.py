from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.features.problem_import.associations import problem_topics


class Topic(Base):

    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    problems = relationship(
        "Problem",
        secondary=problem_topics,
        back_populates="topics",
    )
