from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import AllowAny

from .models import Course
from .serializers import CourseCreateSerializer







class CourseListCreateAPIView(ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
