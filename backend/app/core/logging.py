import logging
import time
from collections.abc import Awaitable, Callable
from datetime import datetime

from fastapi import Request, Response

from app.core.config import settings

request_logger = logging.getLogger("request")


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


async def log_requests(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    environment = settings.environment.upper()
    request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    request_logger.info("START | %s | %s | %s | ", request_time, environment, request.method)

    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000

    request_logger.info(
        "FINISHED | %s | %s | Status: %s | Duration: %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response
