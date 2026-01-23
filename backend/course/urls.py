from django.urls import path

from .views import CourseListCreateAPIView, CourseRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('courses/', CourseListCreateAPIView.as_view(), name='course-list-create'),
    path('course/<str:id>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail-update-destroy'),
]
