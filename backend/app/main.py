from fastapi import Depends, FastAPI

from app.core.dependencies import get_current_user
from app.core.handlers import register_exception_handlers
from app.core.logging import setup_logging
from app.features.auth.router import router as auth_router
from app.features.dashboard.router import router as dashboard_router
from app.features.problem_import.associations import problem_topics  # noqa: F401
from app.features.problem_import.models import Topic  # noqa: F401
from app.features.problem_import.router import router as problem_import_router
from app.features.problems.models import Problem
from app.features.problems.router import router as problem_router
from app.features.user_problems.models import UserProblem
from app.features.user_problems.router import router as user_problem_router
from app.features.users.models import User

setup_logging()

app = FastAPI(
    title="LeetCode Tracker Pro API",
    version="1.0.0",
)

app.include_router(problem_router)
app.include_router(auth_router)
app.include_router(user_problem_router)
app.include_router(problem_import_router)
app.include_router(dashboard_router)
from fastapi.middleware.cors import CORSMiddleware

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome"
    }


@app.get("/me")
def me(
    current_user: User = Depends(
        get_current_user,
    ),
):

    return {
        "username": current_user.username,
        "email": current_user.email,
    }