from bson import ObjectId
from rest_framework import serializers
from student.models import StudentProfile
from .models import Attendance


class AttendanceBulkSaveSerializer(serializers.Serializer):
    course_id = serializers.CharField(required=True)
    date = serializers.CharField(required=True)  # Expected format: "YYYY-MM-DD"
    present_student_ids = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )

    def save(self):
        # Now course_obj is a real Course document thanks to validation
        course_obj = self.validated_data['course_id']
        date_str = self.validated_data['date']
        present_ids = self.validated_data['present_student_ids']

        month_year = date_str[:7]

        # 1. Fetch all students currently enrolled in this course
        all_enrolled_students = StudentProfile.objects(course=course_obj)
        all_enrolled_ids = [str(s.id) for s in all_enrolled_students]

        # 2. Calculate absent IDs
        absent_ids = list(set(all_enrolled_ids) - set(present_ids))

        # 3. Convert string IDs to ObjectIds for MongoEngine References
        present_refs = [ObjectId(pid) for pid in present_ids]
        absent_refs = [ObjectId(aid) for aid in absent_ids]

        # 4. Upsert the daily record
        Attendance.objects(course=course_obj, date=date_str).update_one(
            set__month_year=month_year,
            set__present_students=present_refs,
            set__absent_students=absent_refs,
            upsert=True
        )

        return True
