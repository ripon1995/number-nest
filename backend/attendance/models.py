from mongoengine import Document, ReferenceField, ListField, StringField, DateTimeField, CASCADE
from datetime import datetime


class Attendance(Document):
    # Reference to the Course
    course = ReferenceField('Course', required=True, reverse_delete_rule=CASCADE)

    # Store the date as a string (YYYY-MM-DD) for easy querying or a DateTimeField
    date = StringField(required=True)  # Example: "2026-02-02"

    # Store the YYYY-MM separately to make "Monthly GET requests" extremely fast
    month_year = StringField(required=True)  # Example: "2026-02"

    # List of References to StudentProfile who were present
    present_students = ListField(ReferenceField('StudentProfile'))

    # List of References to StudentProfile who were absent
    absent_students = ListField(ReferenceField('StudentProfile'))

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "attendance",
        "indexes": [
            # Create a unique index so you can't have two attendance docs for same course/day
            {'fields': ('course', 'date'), 'unique': True},
            # Index for fast monthly student reports
            'month_year',
            'present_students'
        ]
    }
