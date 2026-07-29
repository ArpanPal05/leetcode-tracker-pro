from fastapi import Depends, FastAPI

from app.api.auth import router as auth_router
from app.core.dependencies import get_current_user
from app.models.user import User

app = FastAPI(
    title="LeetCode Tracker Pro API",
    version="1.0.0",
)

app.include_router(auth_router)


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