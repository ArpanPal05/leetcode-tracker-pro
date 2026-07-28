from fastapi import FastAPI

app = FastAPI(
    title="LeetCode Tracker Pro API",
    description="Backend API for tracking coding problems and user progress.",
    version="1.0.0",
)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to LeetCode Tracker Pro API"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy"
    }