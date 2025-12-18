from django.urls import path

from .views import CourseListCreateAPIView

urlpatterns = [
    path('courses/', CourseListCreateAPIView.as_view(), name='course-list-create'),
]
