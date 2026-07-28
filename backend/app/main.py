from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(
    title="LeetCode Tracker Pro API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome",
        "algorithm": settings.ALGORITHM
    }