# backend/user/models.py
from mongoengine import Document, StringField, EmailField, ReferenceField, BooleanField
from django.contrib.auth.hashers import make_password


class User(Document):
    # Auth Fields
    name = StringField(required=True, max_length=100)
    phone_number = StringField(required=True, unique=True)
    password = StringField(required=True)
    is_admin = BooleanField(default=False)

    meta = {
        'collection': 'users',  # Name of the collection in MongoDB
        'indexes': ['phone_number']
    }

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    @property
    def is_authenticated(self):
        return True

    def get_username(self):
        return self.phone_number


class UserProfile(Document):
    user = ReferenceField(User)
    father_name = StringField(required=True, max_length=100)
    college = StringField(required=True, max_length=100)
    father_contact = StringField()
    email = EmailField()

    meta = {
        'collection': 'user_profiles',
    }
