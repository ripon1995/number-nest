from mongoengine import Document, StringField, DateTimeField, IntField, DecimalField


class Course(Document):
    title = StringField(required=True)
    description = StringField(required=True)
    batch_days = StringField(required=True)
    batch_time = DateTimeField(required=True)
    capacity = IntField(required=True)
    course_fee = DecimalField(required=True)
    speech = StringField(default="Math is fun")
