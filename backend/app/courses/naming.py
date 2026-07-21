"""Derives a course's course_name from its class/subject/exam_year/class_time/batch_type.

See .claude/rules/features/course.md — course_name is not teacher-entered, it's composed
from these fields on every create/update, e.g. HSC-MATH-2026-5PM-Regular.
"""
from datetime import time

from app.courses.models import CourseBatchType, CourseClass, CourseSubject


def format_class_time(class_time: time) -> str:
    hour12 = class_time.hour % 12 or 12
    period = "PM" if class_time.hour >= 12 else "AM"
    if class_time.minute == 0:
        return f"{hour12}{period}"
    return f"{hour12}{class_time.minute:02d}{period}"


def build_course_name(
    class_level: CourseClass,
    subject: CourseSubject,
    exam_year: int,
    class_time: time,
    batch_type: CourseBatchType,
) -> str:
    return (
        f"{class_level.value.upper()}-{subject.value.upper()}-{exam_year}-"
        f"{format_class_time(class_time)}-{batch_type.value.upper()}"
    )
