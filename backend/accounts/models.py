from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    username = None  # disable username field
    email = models.EmailField(unique=True)

    is_admin = models.BooleanField(default=False)
    is_volunteer = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # no username required

    objects = UserManager()  # <-- IMPORTANT

    def __str__(self):
        return self.email
