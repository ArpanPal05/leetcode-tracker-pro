from app.exceptions.auth import (
    EmailAlreadyExists,
    InvalidCredentials,
)
from fastapi import FastAPI
from fastapi.responses import JSONResponse


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(EmailAlreadyExists)
    async def email_exists_handler(request, exc):

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Email already registered."
            },
        )

    @app.exception_handler(InvalidCredentials)
    async def invalid_credentials_handler(request, exc):

        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "message": "Invalid email or password."
            },
        )