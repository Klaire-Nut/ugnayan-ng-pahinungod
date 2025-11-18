from django.urls import path
from . import views

app_name = 'volunteers'

urlpatterns = [
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('register/', views.register_volunteer_with_otp, name='register'),
]
