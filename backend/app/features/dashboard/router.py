from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.dashboard.schemas import (
    DashboardActivityResponse,
    DashboardDistributionsResponse,
    DashboardStreakResponse,
    DashboardSummaryResponse,
    HeatmapItem,
)
from app.features.dashboard.service import (
    DashboardService,
    get_dashboard_service,
)
from app.features.users.models import User
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=ApiResponse[DashboardSummaryResponse],
    status_code=status.HTTP_200_OK,
)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    summary = service.get_summary(db=db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard summary retrieved successfully.",
        data=summary,
    )


@router.get(
    "/distributions",
    response_model=ApiResponse[DashboardDistributionsResponse],
    status_code=status.HTTP_200_OK,
)
def get_distributions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    distributions = service.get_distributions(db=db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard distributions retrieved successfully.",
        data=distributions,
    )


@router.get(
    "/activity",
    response_model=ApiResponse[DashboardActivityResponse],
    status_code=status.HTTP_200_OK,
)
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    activity = service.get_activity(db=db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard activity retrieved successfully.",
        data=activity,
    )


@router.get(
    "/streak",
    response_model=ApiResponse[DashboardStreakResponse],
    status_code=status.HTTP_200_OK,
)
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    streak = service.get_streak(db=db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard streak retrieved successfully.",
        data=streak,
    )


@router.get(
    "/heatmap",
    response_model=ApiResponse[list[HeatmapItem]],
    status_code=status.HTTP_200_OK,
)
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
):
    heatmap = service.get_heatmap(db=db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard heatmap retrieved successfully.",
        data=heatmap,
    )
