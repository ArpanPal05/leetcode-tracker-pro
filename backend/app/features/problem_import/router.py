from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.problem_import.schemas import (
    LeetCodeImportRequest,
    LeetCodeImportResponse,
    ProblemImportRequest,
    ProblemImportResponse,
)
from app.features.problems.resolver import (
    ProblemResolverService,
    get_problem_resolver_service,
)
from app.features.user_problems.schemas import UserProblemCreate, UserProblemResponse
from app.features.user_problems.service import (
    UserProblemService,
    get_user_problem_service,
)
from app.features.users.models import User
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/api/v1/import", tags=["Import"])


@router.post(
    "",
    response_model=ApiResponse[ProblemImportResponse],
    status_code=status.HTTP_201_CREATED,
)
def import_problem(
    request: ProblemImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    resolver: ProblemResolverService = Depends(get_problem_resolver_service),
    user_problem_service: UserProblemService = Depends(get_user_problem_service),
):
    problem = resolver.resolve_problem(db, request.problem_url)

    track_req = UserProblemCreate(
        problem_id=problem.id,
        status=request.status,
        notes=request.notes,
        language=request.language,
        time_taken_minutes=request.time_taken_minutes,
        solution_url=request.solution_url,
        favorite=request.favorite,
    )

    user_problem = user_problem_service.track_problem(
        db, user_id=current_user.id, request=track_req
    )

    return ApiResponse(
        success=True,
        message="Problem imported and tracked successfully.",
        data=ProblemImportResponse(
            tracked=UserProblemResponse.model_validate(user_problem),
            imported=True,
        ),
    )


@router.post(
    "/leetcode",
    response_model=ApiResponse[LeetCodeImportResponse],
    status_code=status.HTTP_201_CREATED,
)
def import_leetcode_problem(
    request: LeetCodeImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    resolver: ProblemResolverService = Depends(get_problem_resolver_service),
    user_problem_service: UserProblemService = Depends(get_user_problem_service),
):
    problem = resolver.resolve_problem(db, request.leetcode_url or request.problem_url)

    track_req = UserProblemCreate(
        problem_id=problem.id,
        status=request.status,
        notes=request.notes,
        language=request.language,
        time_taken_minutes=request.time_taken_minutes,
        solution_url=request.solution_url,
        favorite=request.favorite,
    )

    user_problem = user_problem_service.track_problem(
        db, user_id=current_user.id, request=track_req
    )

    return ApiResponse(
        success=True,
        message="Problem imported and tracked successfully.",
        data=LeetCodeImportResponse(
            tracked=UserProblemResponse.model_validate(user_problem),
            imported=True,
        ),
    )
