import logging
from rest_framework import status
from rest_framework.views import exception_handler
from utils.error_response import error_response

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    # logger.error(exc, exc_info=True)
    logger.debug(f"Caught an error: {type(exc).__name__}")
    logger.debug(f"Occurred in view: {context['view'].__class__.__name__}")
    # drf exception handler to get the standard exception
    response = exception_handler(exc, context)

    if response.status_code==401:
        return error_response(
            message=response.data['detail'],
            errors=response.status_text,
            status_code=response.status_code,
        )

    logger.critical(f"Unhandled Exception: {exc}", exc_info=True)
    return error_response(
        message='Internal Server Error',
        errors=exc.errors() if hasattr(exc, 'errors') else None,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
