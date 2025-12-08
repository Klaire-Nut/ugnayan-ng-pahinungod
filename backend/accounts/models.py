from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)

    is_admin = models.BooleanField(default=False)
    is_volunteer = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # <- volunteers do NOT need a username

    def __str__(self):
        return self.email
