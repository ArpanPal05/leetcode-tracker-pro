from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import Difficulty


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    difficulty: Mapped[Difficulty] = mapped_column(
        SqlEnum(Difficulty),
        nullable=False,
    )

    platform: Mapped[str] = mapped_column(
        String(50),
        default="LeetCode",
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