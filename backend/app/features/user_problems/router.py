from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.user_problems.schemas import (
    PaginatedUserProblemResponse,
    UserProblemCreate,
    UserProblemResponse,
    UserProblemStatusUpdate,
    UserProblemTrackRequest,
    UserProblemUpdate,
)
from app.features.user_problems.service import (
    UserProblemService,
    get_user_problem_service,
)
from app.features.users.models import User
from app.shared.enums import ProblemStatus
from app.shared.responses import ApiResponse

router = APIRouter(
    prefix="/api/v1/user-problems",
    tags=["User Problem Tracker"],
)


@router.post(
    "/track",
    response_model=ApiResponse[UserProblemResponse],
    status_code=status.HTTP_201_CREATED,
)
def track_problem_by_url(
    request: UserProblemTrackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    user_problem = service.track_problem_by_url(
        db=db,
        user_id=current_user.id,
        request=request,
    )
    return ApiResponse(
        success=True,
        message="Problem tracked successfully.",
        data=UserProblemResponse.model_validate(user_problem),
    )


@router.post(
    "",
    response_model=UserProblemResponse,
    status_code=201,
)
def track_problem(
    request: UserProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.track_problem(
        db,
        user_id=current_user.id,
        request=request,
    )


@router.get(
    "",
    response_model=PaginatedUserProblemResponse,
)
def list_user_problems(
    search: str | None = Query(default=None, description="Search problem title or notes"),
    status: ProblemStatus | None = Query(default=None, description="Filter by problem status"),
    language: str | None = Query(default=None, description="Filter by programming language"),
    favorite: bool | None = Query(default=None, description="Filter by favorite status"),
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.list_user_problems(
        db,
        user_id=current_user.id,
        search=search,
        status=status,
        language=language,
        favorite=favorite,
        page=page,
        size=size,
    )


@router.get(
    "/{id}",
    response_model=UserProblemResponse,
)
def get_user_problem(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.get_user_problem(
        db,
        user_problem_id=id,
        user_id=current_user.id,
    )


@router.patch(
    "/{id}",
    response_model=UserProblemResponse,
)
def update_user_problem(
    id: int,
    request: UserProblemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.update_user_problem(
        db,
        user_problem_id=id,
        user_id=current_user.id,
        request=request,
    )


@router.delete(
    "/{id}",
    status_code=204,
)
def delete_user_problem(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    service.delete_user_problem(
        db,
        user_problem_id=id,
        user_id=current_user.id,
    )


@router.post(
    "/{id}/favorite",
    response_model=UserProblemResponse,
)
def toggle_favorite(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.toggle_favorite(
        db,
        user_problem_id=id,
        user_id=current_user.id,
    )


@router.post(
    "/{id}/revision",
    response_model=UserProblemResponse,
)
def increment_revision(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.increment_revision(
        db,
        user_problem_id=id,
        user_id=current_user.id,
    )


@router.patch(
    "/{id}/status",
    response_model=UserProblemResponse,
)
def update_status(
    id: int,
    request: UserProblemStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: UserProblemService = Depends(get_user_problem_service),
):
    return service.update_status(
        db,
        user_problem_id=id,
        user_id=current_user.id,
        status=request.status,
    )
