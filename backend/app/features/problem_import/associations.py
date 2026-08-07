from sqlalchemy import Column, ForeignKey, Integer, Table

from app.db.base import Base

problem_topics = Table(
    "problem_topics",
    Base.metadata,
    Column(
        "problem_id",
        Integer,
        ForeignKey("problems.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "topic_id",
        Integer,
        ForeignKey("topics.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
