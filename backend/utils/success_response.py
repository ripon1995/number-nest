from rest_framework.response import Response
from rest_framework import status


def success_response(message="Success", data=None, status_code=status.HTTP_200_OK):
    """
    Standard success response template

    Args:
        message (str): Success message
        data (dict/list): Response data payload
        status_code (int): HTTP status code (default: 200)

    Returns:
        Response: DRF Response object with standardized success format
    """
    response_data = {
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }

    return Response(response_data, status=status_code)