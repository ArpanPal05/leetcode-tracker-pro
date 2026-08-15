from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, UniqueConstraint
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.features.problem_import.associations import problem_topics
from app.shared.enums import Difficulty, Platform


class Problem(Base):
    __tablename__ = "problems"

    __table_args__ = (
        UniqueConstraint(
            "platform",
            "external_id",
            name="uq_platform_external_id",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    platform: Mapped[Platform] = mapped_column(
        SqlEnum(Platform),
        default=Platform.LEETCODE,
        nullable=False,
    )

    external_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    slug: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default=None,
    )

    difficulty: Mapped[Difficulty] = mapped_column(
        SqlEnum(Difficulty),
        nullable=False,
    )

    platform_rating: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=None,
    )

    frontend_question_id: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        default=None,
    )

    is_premium: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    acceptance_rate: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        default=None,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    user_problems = relationship(
        "UserProblem",
        back_populates="problem",
        cascade="all, delete-orphan",
    )

    topics = relationship(
        "Topic",
        secondary=problem_topics,
        back_populates="problems",
    )
