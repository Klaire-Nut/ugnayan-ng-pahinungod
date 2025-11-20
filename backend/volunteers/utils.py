import random
from django.core.mail import send_mail

def send_otp_smtp(recipient_email):
    """
    Generates a 6-digit OTP and sends it to the recipient_email using Gmail SMTP.
    Returns the OTP so you can store it for verification.
    """
    otp = random.randint(100000, 999999)
    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP code is: {otp}",
        from_email=None,           
        recipient_list=[recipient_email],
    )
    return otp
