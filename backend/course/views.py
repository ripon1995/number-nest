from rest_framework.generics import ListCreateAPIView

from utils import success_response
from utils.permissions import IsAdmin, IsAdminOrIsStudent
from .models import Course
from .serializers import CourseCreateSerializer


class CourseListCreateAPIView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer

    def get_permissions(self):
        pass
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsAdminOrIsStudent()]

    def list(self, request, *args, **kwargs):
        queryset = self.queryset
        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data, message="Course list fetched successfully"
        )
