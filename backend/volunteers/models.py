# backend/volunteers/models.py
from django.db import models
from django.core.validators import EmailValidator


class Volunteer(models.Model):
    """Main volunteer registration model"""
    # Basic Info
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100, blank=True)
    sex = models.CharField(max_length=50)
    birthdate = models.DateField()
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_full_name(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}"


class VolunteerAccount(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="account")
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    username = models.CharField(max_length=150, unique=True, default='temp_user')  # Make sure this line exists
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.email


class VolunteerContact(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="contact")
    mobile_number = models.CharField(max_length=20)
    facebook_link = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Contact"


class VolunteerAddress(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="address")
    street_address = models.CharField(max_length=255)
    province = models.CharField(max_length=100)
    region = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Address"


class VolunteerEducation(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="education")
    degree_program = models.CharField(max_length=200, blank=True)
    year_level = models.CharField(max_length=50, blank=True)
    college = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=50, blank=True)
    year_graduated = models.CharField(max_length=4, blank=True)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Education"


class EmergencyContact(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="emergency_contact")
    name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Emergency Contact"


class VolunteerBackground(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="background")
    occupation = models.CharField(max_length=255, blank=True)
    org_affiliation = models.CharField(max_length=255, blank=True)
    hobbies_interests = models.TextField(blank=True)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Background"


class VolunteerAffiliation(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="affiliation")
    affiliation = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Affiliation"


class OTPVerification(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "otp_verifications"  
