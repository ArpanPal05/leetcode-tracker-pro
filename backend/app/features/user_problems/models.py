from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy import (
    Enum as SqlEnum,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base
from app.shared.enums import ProblemStatus


class UserProblem(Base):
    __tablename__ = "user_problems"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "problem_id",
            name="uq_user_problem",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    problem_id: Mapped[int] = mapped_column(
        ForeignKey("problems.id"),
        nullable=False,
    )

    status: Mapped[ProblemStatus] = mapped_column(
        SqlEnum(ProblemStatus),
        default=ProblemStatus.NOT_STARTED,
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    language: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    time_taken_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    revision_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )

    favorite: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    solution_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    solved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    last_revised_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    first_attempted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="user_problems",
    )

    problem = relationship(
        "Problem",
        back_populates="user_problems",
    )
