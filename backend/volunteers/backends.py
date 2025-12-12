from django.contrib.auth.backends import ModelBackend
from core.models import VolunteerAccount
from django.contrib.auth.hashers import check_password

class VolunteerEmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            account = VolunteerAccount.objects.get(email=email)
        except VolunteerAccount.DoesNotExist:
            return None

        if check_password(password, account.password):
            return account

        return None

    def get_user(self, user_id):
        try:
            return VolunteerAccount.objects.get(pk=user_id)
        except VolunteerAccount.DoesNotExist:
            return None