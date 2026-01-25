from django.urls import path
from .views import StudentListCreateAPIView, StudentProfileRetrieveUpdateDestroyAPIView

urlpatterns = [
    path("profiles/", StudentListCreateAPIView.as_view()),
    path("profile/<str:pk>/", StudentProfileRetrieveUpdateDestroyAPIView.as_view()),
]
