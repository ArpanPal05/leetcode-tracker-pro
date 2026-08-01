from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.problem import (
    ProblemCreate,
    ProblemResponse,
    ProblemUpdate,
)
from app.services.problem_service import ProblemService

router = APIRouter(
    prefix="/api/v1/problems",
    tags=["Problems"],
)

service = ProblemService()


@router.post(
    "",
    response_model=ProblemResponse,
)
def create_problem(
    request: ProblemCreate,
    db: Session = Depends(get_db),
):

    return service.create_problem(
        db,
        request,
    )


@router.get(
    "",
    response_model=list[ProblemResponse],
)
def list_problems(
    db: Session = Depends(get_db),
):

    return service.list_problems(db)

@router.get(
    "/{problem_id}",
    response_model=ProblemResponse,
)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):

    return service.get_problem(
        db,
        problem_id,
    )

@router.patch(
    "/{problem_id}",
    response_model=ProblemResponse,
)
def update_problem(
    problem_id: int,
    request: ProblemUpdate,
    db: Session = Depends(get_db),
):

    return service.update_problem(
        db,
        problem_id,
        request,
    )

@router.delete(
    "/{problem_id}",
    status_code=204,
)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):

    service.delete_problem(
        db,
        problem_id,
    )