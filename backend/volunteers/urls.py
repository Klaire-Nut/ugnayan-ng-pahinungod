from django.urls import path
from .views import RegisterStep1, VerifyOTP, FinalRegistration


app_name = "volunteers"

urlpatterns = [
    # Step 1: Send OTP
    path('register/', RegisterStep1.as_view(), name='register_step1'),
    
    # Step 2: Verify OTP
    path('verify-otp/', VerifyOTP.as_view(), name='verify_otp'),
    
    # Step 3: Final registration with all data
    path('register-final/', FinalRegistration.as_view(), name='final_registration'),

]
