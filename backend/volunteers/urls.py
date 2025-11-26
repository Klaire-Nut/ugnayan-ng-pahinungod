from django.urls import path
from .views import RegisterStep1, VerifyOTP, FinalRegistration, VolunteerLogin

app_name = "volunteers"

urlpatterns = [
    # empty for now
    path('register/step1/', RegisterStep1.as_view(), name='register-step1'),
    path('verify-otp/', VerifyOTP.as_view(), name='verify-otp'),
    path('register/final/', FinalRegistration.as_view(), name='final-registration'),
    path('login/', VolunteerLogin.as_view(), name='volunteer-login'),
]
