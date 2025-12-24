from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer, UserLoginSerializer
from .authentication import MongoRefreshToken
from utils import success_response, handle_exceptions


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @handle_exceptions
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            message="User created successfully",
            status_code=status.HTTP_201_CREATED,
            data=serializer.data
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @handle_exceptions
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = MongoRefreshToken.for_user(user)

        return success_response(
            message="Login successful",
            status_code=status.HTTP_200_OK,
            data={
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'name': user.name,
                    'phone_number': user.phone_number,
                    'is_admin': user.is_admin
                }
            }
        )

