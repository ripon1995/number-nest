from rest_framework.views import APIView
from rest_framework_mongoengine.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status

from attendance.serializers import AttendanceBulkSaveSerializer


class AttendanceView(CreateAPIView):
    def post(self, request, *args, **kwargs):
        serializer = AttendanceBulkSaveSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Attendance saved successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
