from fastapi import FastAPI

from app.teacher.router import router as teacher_router

app = FastAPI(title="number-nest")

app.include_router(teacher_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
