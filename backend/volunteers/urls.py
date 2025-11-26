from django.urls import path
from .views import RegisterVolunteer
app_name = "volunteers"

urlpatterns = [
    path("register/", RegisterVolunteer.as_view(), name="register-volunteer"),
]
