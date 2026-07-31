from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
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

from app.database.base import Base
from app.models.enums import ProblemStatus


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
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    time_taken: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    solved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="user_problems",
    )

    problem = relationship(
        "Problem",
        back_populates="user_problems",
    )