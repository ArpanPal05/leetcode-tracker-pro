from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.features.auth.exceptions import (
    EmailAlreadyExists,
    InvalidCredentials,
)
from app.features.problem_import.exceptions import (
    CodeChefParsingError,
    CodeChefProblemNotFound,
    CodeChefUnavailable,
    CodeforcesProblemNotFound,
    CodeforcesUnavailable,
    InvalidCodeforcesURL,
    InvalidLeetCodeURL,
    InvalidProblemURL,
    LeetCodeProblemNotFound,
    LeetCodeUnavailable,
    UnsupportedPlatform,
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
                "detail": "Invalid email or password.",
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

    @app.exception_handler(InvalidProblemURL)
    async def invalid_problem_url_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": str(exc) or "Invalid problem URL provided.",
            },
        )

    @app.exception_handler(UnsupportedPlatform)
    async def unsupported_platform_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": str(exc) or "Unsupported coding platform.",
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

    @app.exception_handler(CodeforcesUnavailable)
    async def codeforces_unavailable_handler(request, exc):
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": "Codeforces service is currently unavailable.",
            },
        )

    @app.exception_handler(CodeforcesProblemNotFound)
    async def codeforces_problem_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc) or "Problem not found on Codeforces.",
            },
        )

    @app.exception_handler(CodeChefUnavailable)
    async def codechef_unavailable_handler(request, exc):
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": "CodeChef service is currently unavailable.",
            },
        )

    @app.exception_handler(CodeChefProblemNotFound)
    async def codechef_problem_not_found_handler(request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": str(exc) or "Problem not found on CodeChef.",
            },
        )

    @app.exception_handler(CodeChefParsingError)
    async def codechef_parsing_error_handler(request, exc):
        return JSONResponse(
            status_code=502,
            content={
                "success": False,
                "message": str(exc) or "Failed to parse problem metadata from CodeChef.",
            },
        )

