from django.urls import path
from .views import (
    VolunteerProfileView,
    VolunteerHistoryView,
    ChangePasswordView,
    RegisterVolunteer,
)

app_name = "volunteers"


urlpatterns = [
    # Volunteer Registration
    path("register/", RegisterVolunteer.as_view(), name="register-volunteer"),

    # Profile Management
    path("profile/", VolunteerProfileView.as_view(), name="volunteer-profile"),
    
    # Volunteering History
    path("history/", VolunteerHistoryView.as_view(), name="volunteer-history"),
    
    # Privacy Settings
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]