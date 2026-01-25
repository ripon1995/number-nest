from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny

from utils.permissions import IsAdminOrIsStudent

# from .models import UserProfile
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
)
from .authentication import MongoRefreshToken
from utils import success_response


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            message="User created successfully",
            status_code=status.HTTP_201_CREATED,
            data=serializer.data,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Generate JWT tokens
        refresh = MongoRefreshToken.for_user(user)

        return success_response(
            message="Login successful",
            status_code=status.HTTP_200_OK,
            data={
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "name": user.name,
                    "phone_number": user.phone_number,
                    "is_admin": user.is_admin,
                },
            },
        )


# class ProfileView(RetrieveAPIView):
#     permission_classes = [IsAdminOrIsStudent]
#     serializer_class = UserProfileSerializer
#
#     def retrieve(self, request, *args, **kwargs):
#         user = request.user
#         profile = UserProfile.objects.filter(user=user).first()
#         serializer = self.get_serializer(user, context={"profile": profile})
#         return success_response(
#             message="Profile retrieved successfully", data=serializer.data
#         )
