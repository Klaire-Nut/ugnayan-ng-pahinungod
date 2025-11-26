from django.urls import path
from .views import (
    RegisterVolunteer,
    VolunteerProfileView,
    VolunteerHistoryView,
    ChangePasswordView,
    DeleteAccountView
)

app_name = "volunteers"

urlpatterns = [
    # Registration
    path("register/", RegisterVolunteer.as_view(), name="register-volunteer"),
    
    # Profile Management
    path("profile/", VolunteerProfileView.as_view(), name="volunteer-profile"),
    
    # Volunteering History
    path("history/", VolunteerHistoryView.as_view(), name="volunteer-history"),
    
    # Privacy Settings
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]