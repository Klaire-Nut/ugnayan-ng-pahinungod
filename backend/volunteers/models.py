# backend/volunteers/models.py
from django.db import models
from core.models import Volunteer

class Volunteer(models.Model):
    """Main volunteer registration model"""
    # Basic Info
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100, blank=True)
    sex = models.CharField(max_length=50)
    birthdate = models.DateField()
    volunteer_identifier = models.CharField(max_length=50, unique=True, blank=True)

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
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    
    def __str__(self):
        return self.email


class VolunteerContact(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="contact")
    mobile_number = models.CharField(max_length=20, blank=True)
    facebook_link = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.volunteer.get_full_name()} Contact"


class VolunteerAddress(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name="address")
    street_address = models.CharField(max_length=255, blank=True)
    province = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)

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
    name = models.CharField(max_length=200, blank=True)
    relationship = models.CharField(max_length=100,blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

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
    volunteer = models.ForeignKey(
        'core.Volunteer',  
        on_delete=models.CASCADE
    )
    affiliation = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True, null=True)
