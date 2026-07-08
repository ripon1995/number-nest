from fastapi import FastAPI

app = FastAPI(title="number-nest")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
