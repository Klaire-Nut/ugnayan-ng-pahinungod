# backend/volunteers/models.py
from django.db import models
from django.core.validators import EmailValidator

class Volunteer(models.Model):
    """Main volunteer registration model"""
    
    # Email & Consent (Step 1)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    data_consent = models.BooleanField(default=False)
    
    # Basic Information
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    
    AGE_CHOICES = [
        ('18-25 years old', '18-25 years old'),
        ('26-35 years old', '26-35 years old'),
        ('36-45 years old', '36-45 years old'),
        ('45-55 years old', '45-55 years old'),
        ('56 above years old', '56 above years old'),
    ]
    age = models.CharField(max_length=50, choices=AGE_CHOICES)
    
    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Prefer not to say', 'Prefer not to say'),
    ]
    sex = models.CharField(max_length=50, choices=SEX_CHOICES)
    
    birthdate = models.DateField()
    indigenous_affiliation = models.CharField(max_length=200, blank=True)
    mobile_number = models.CharField(max_length=20)
    facebook_link = models.URLField(max_length=500)
    hobbies = models.TextField()
    organizations = models.TextField()
    
    # Permanent Address
    street_barangay = models.CharField(max_length=255)
    city_municipality = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    region = models.CharField(max_length=200)
    
    # UP Address
    same_as_permanent = models.BooleanField(default=False)
    up_street_barangay = models.CharField(max_length=255, blank=True)
    up_city_municipality = models.CharField(max_length=100, blank=True)
    up_province = models.CharField(max_length=100, blank=True)
    up_region = models.CharField(max_length=200, blank=True)
    
    # Affiliation (Step 2)
    AFFILIATION_CHOICES = [
        ('STUDENT', 'Student'),
        ('ALUMNI', 'Alumni'),
        ('UP STAFF', 'UP Staff'),
        ('FACULTY', 'Faculty'),
        ('RETIREE', 'Retiree'),
    ]
    affiliation = models.CharField(max_length=20, choices=AFFILIATION_CHOICES)
    
    # Student Fields
    degree_program = models.CharField(max_length=200, blank=True)
    year_level = models.CharField(max_length=50, blank=True)
    college = models.CharField(max_length=50, blank=True)
    shs_type = models.CharField(max_length=200, blank=True)
    grad_bachelors = models.CharField(max_length=255, blank=True)
    first_college = models.CharField(max_length=10, blank=True)
    first_grad = models.CharField(max_length=10, blank=True)
    first_up = models.CharField(max_length=10, blank=True)
    
    # Emergency Contact (Student only)
    emer_name = models.CharField(max_length=200, blank=True)
    emer_relation = models.CharField(max_length=100, blank=True)
    emer_contact = models.CharField(max_length=20, blank=True)
    emer_address = models.TextField(blank=True)
    
    # Faculty Fields
    faculty_dept = models.CharField(max_length=255, blank=True)
    
    # Alumni Fields
    constituent_unit = models.CharField(max_length=100, blank=True)
    alumni_degree = models.CharField(max_length=200, blank=True)
    year_grad = models.CharField(max_length=4, blank=True)
    first_grad_college = models.CharField(max_length=10, blank=True)
    first_grad_up = models.CharField(max_length=10, blank=True)
    occupation = models.CharField(max_length=255, blank=True)
    
    # Retiree Fields
    retire_designation = models.CharField(max_length=255, blank=True)
    retire_office = models.CharField(max_length=255, blank=True)
    
    # Staff Fields
    staff_office = models.CharField(max_length=255, blank=True)
    staff_position = models.CharField(max_length=255, blank=True)
    
    # Programs (Step 3)
    volunteer_programs = models.JSONField(default=list)  # Array of selected programs
    affirmative_action_subjects = models.JSONField(default=list)  # Array of subjects
    
    VOLUNTEER_STATUS_CHOICES = [
        ('First time to apply as volunteer (no engagements yet)', 'First time'),
        ('Already signed up in the previous sign up form but no engagements yet', 'Signed up - no engagements'),
        ('Signed up in the previous sign up form and already have engagements with Pahinungod', 'Signed up - with engagements'),
    ]
    volunteer_status = models.CharField(max_length=255, choices=VOLUNTEER_STATUS_CHOICES)
    
    tagapag_ugnay = models.CharField(max_length=3)  # YES/NO
    other_organization = models.CharField(max_length=3)  # YES/NO
    organization_name = models.CharField(max_length=255, blank=True)
    how_did_you_hear = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'volunteers'
        ordering = ['-created_at']
        verbose_name = 'Volunteer'
        verbose_name_plural = 'Volunteers'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}"


class OTPVerification(models.Model):
    """Store OTP codes for email verification"""
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otp_verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.email} - {self.otp_code}"