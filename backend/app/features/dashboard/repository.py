from sqlalchemy import Date, case, cast, distinct, func, select
from sqlalchemy.orm import Session, joinedload

from app.features.problems.models import Problem
from app.features.user_problems.models import UserProblem
from app.shared.enums import Difficulty, ProblemStatus


class DashboardRepository:
    """
    Read-only repository for executing SQL aggregation queries
    for the dashboard analytics feature.
    """

    def get_summary_raw(self, db: Session, user_id: int) -> dict:
        statement = (
            select(
                func.count(UserProblem.id).label("total_tracked"),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                UserProblem.status.in_(
                                    [ProblemStatus.SOLVED, ProblemStatus.MASTERED]
                                ),
                                1,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("total_solved"),
                func.coalesce(
                    func.sum(
                        case(
                            (UserProblem.status == ProblemStatus.ATTEMPTING, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("currently_solving"),
                func.coalesce(
                    func.sum(
                        case(
                            (UserProblem.status == ProblemStatus.NOT_STARTED, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("not_started"),
                func.coalesce(
                    func.sum(
                        case(
                            (UserProblem.favorite.is_(True), 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("favorites"),
                func.coalesce(
                    func.sum(
                        case(
                            (UserProblem.status == ProblemStatus.NEEDS_REVISION, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("needs_revision"),
                func.coalesce(
                    func.sum(
                        case(
                            (UserProblem.status == ProblemStatus.MASTERED, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("mastered"),
            )
            .where(UserProblem.user_id == user_id)
        )

        row = db.execute(statement).one()

        return {
            "total_tracked": row.total_tracked,
            "total_solved": int(row.total_solved),
            "currently_solving": int(row.currently_solving),
            "not_started": int(row.not_started),
            "favorites": int(row.favorites),
            "needs_revision": int(row.needs_revision),
            "mastered": int(row.mastered),
        }

    def get_distributions_raw(self, db: Session, user_id: int) -> dict:
        # 1. Difficulty distribution via JOIN with problems
        diff_stmt = (
            select(
                Problem.difficulty,
                func.count(UserProblem.id).label("count"),
            )
            .join(UserProblem, UserProblem.problem_id == Problem.id)
            .where(UserProblem.user_id == user_id)
            .group_by(Problem.difficulty)
        )
        diff_rows = db.execute(diff_stmt).all()

        diff_counts = {"easy": 0, "medium": 0, "hard": 0}
        for row in diff_rows:
            diff_val = (
                row.difficulty.value
                if hasattr(row.difficulty, "value")
                else str(row.difficulty)
            )
            key = diff_val.lower()
            if key in diff_counts:
                diff_counts[key] = row.count

        # 2. Languages distribution GROUP BY language
        lang_stmt = (
            select(
                UserProblem.language,
                func.count(UserProblem.id).label("count"),
            )
            .where(
                UserProblem.user_id == user_id,
                UserProblem.language.isnot(None),
                UserProblem.language != "",
            )
            .group_by(UserProblem.language)
            .order_by(func.count(UserProblem.id).desc())
        )
        lang_rows = db.execute(lang_stmt).all()

        languages = [
            {"language": row.language, "count": row.count}
            for row in lang_rows
        ]

        return {
            "difficulty": diff_counts,
            "languages": languages,
        }

    def get_activity_raw(self, db: Session, user_id: int) -> dict:
        # 1. Recent 10 tracked problems (latest first)
        recent_stmt = (
            select(UserProblem)
            .options(joinedload(UserProblem.problem))
            .where(UserProblem.user_id == user_id)
            .order_by(UserProblem.created_at.desc())
            .limit(10)
        )
        recent_rows = list(db.scalars(recent_stmt).all())

        recent_list = [
            {
                "title": up.problem.title if up.problem else "Unknown",
                "difficulty": (
                    up.problem.difficulty.value
                    if up.problem and hasattr(up.problem.difficulty, "value")
                    else str(up.problem.difficulty) if up.problem else "Unknown"
                ),
                "status": (
                    up.status.value
                    if hasattr(up.status, "value")
                    else str(up.status)
                ),
                "language": up.language,
                "tracked_at": (
                    up.created_at.isoformat() if up.created_at else ""
                ),
                "solved_at": (
                    up.solved_at.isoformat() if up.solved_at else None
                ),
            }
            for up in recent_rows
        ]

        # 2. Time statistics via SQL aggregation
        time_stmt = (
            select(
                func.coalesce(
                    func.avg(UserProblem.time_taken_minutes), 0.0
                ).label("avg_min"),
                func.coalesce(
                    func.min(UserProblem.time_taken_minutes), 0
                ).label("min_min"),
                func.coalesce(
                    func.max(UserProblem.time_taken_minutes), 0
                ).label("max_min"),
                func.coalesce(
                    func.sum(UserProblem.time_taken_minutes), 0
                ).label("sum_min"),
            ).where(
                UserProblem.user_id == user_id,
                UserProblem.time_taken_minutes.isnot(None),
            )
        )
        time_row = db.execute(time_stmt).one()

        time_stats = {
            "average_minutes": round(float(time_row.avg_min), 2),
            "minimum_minutes": int(time_row.min_min),
            "maximum_minutes": int(time_row.max_min),
            "total_minutes": int(time_row.sum_min),
        }

        return {
            "recent": recent_list,
            "time_statistics": time_stats,
        }

    def get_solved_dates_raw(self, db: Session, user_id: int) -> list:
        stmt = (
            select(distinct(cast(UserProblem.solved_at, Date)).label("solved_date"))
            .where(
                UserProblem.user_id == user_id,
                UserProblem.solved_at.isnot(None),
            )
            .order_by(cast(UserProblem.solved_at, Date).desc())
        )
        rows = list(db.scalars(stmt).all())
        return rows

    def get_heatmap_raw(self, db: Session, user_id: int) -> list[dict]:
        date_col = cast(UserProblem.solved_at, Date).label("date")
        stmt = (
            select(
                date_col,
                func.count(UserProblem.id).label("count"),
            )
            .where(
                UserProblem.user_id == user_id,
                UserProblem.solved_at.isnot(None),
            )
            .group_by(date_col)
            .order_by(date_col.asc())
        )
        rows = db.execute(stmt).all()
        return [
            {
                "date": (
                    row.date.strftime("%Y-%m-%d")
                    if hasattr(row.date, "strftime")
                    else str(row.date)
                ),
                "count": row.count,
            }
            for row in rows
        ]


def get_dashboard_repository() -> DashboardRepository:
    return DashboardRepository()
