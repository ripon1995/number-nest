from rest_framework.generics import ListCreateAPIView

from .models import Course
from .serializers import CourseCreateSerializer


class CourseListCreateAPIView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
