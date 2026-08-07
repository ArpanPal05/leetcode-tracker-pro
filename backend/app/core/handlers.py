from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.features.auth.exceptions import (
    EmailAlreadyExists,
    InvalidCredentials,
)
from app.features.problem_import.exceptions import (
    InvalidLeetCodeURL,
    LeetCodeProblemNotFound,
    LeetCodeUnavailable,
)
from app.features.problems.exceptions import ProblemNotFound
from app.features.user_problems.exceptions import (
    UserProblemAlreadyExists,
    UserProblemNotFound,
)


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(EmailAlreadyExists)
    async def email_exists_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Email already registered.",
            },
        )

    @app.exception_handler(InvalidCredentials)
    async def invalid_credentials_handler(request, exc):
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "message": "Invalid email or password.",
            },
        )

    @app.exception_handler(ProblemNotFound)
    async def problem_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Problem not found.",
            },
        )

    @app.exception_handler(UserProblemNotFound)
    async def user_problem_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Tracked problem not found.",
            },
        )

    @app.exception_handler(UserProblemAlreadyExists)
    async def user_problem_already_exists_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Problem is already tracked by this user.",
            },
        )

    @app.exception_handler(InvalidLeetCodeURL)
    async def invalid_leetcode_url_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": str(exc) or "Invalid LeetCode URL provided.",
            },
        )

    @app.exception_handler(LeetCodeUnavailable)
    async def leetcode_unavailable_handler(request, exc):
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": "LeetCode service is currently unavailable.",
            },
        )

    @app.exception_handler(LeetCodeProblemNotFound)
    async def leetcode_problem_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc) or "Problem not found on LeetCode.",
            },
        )
