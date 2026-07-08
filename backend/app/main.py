from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.teacher.router import router as teacher_router

app = FastAPI(title="number-nest")

# Dev-only: allow the Vite dev server to call the API. Single-teacher system,
# no cookies/credentials involved — auth is a Bearer token, so no allow_credentials needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teacher_router)


@app.get("/", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}
