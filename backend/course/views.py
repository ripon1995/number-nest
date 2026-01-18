from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from utils import success_response
from .models import Course
from .serializers import CourseCreateSerializer


class CourseListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.queryset
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data, message="Course list fetched successfully")
