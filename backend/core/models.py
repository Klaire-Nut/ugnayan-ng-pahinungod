from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# Models for the Table Set-up in the Database
from django.db import models

# Volunteer Table
class Volunteer(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Suspended', 'Suspended'),
    ]

    volunteer_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    sex = models.CharField(max_length=10)  
    birthdate = models.DateField()
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_joined = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    total_hours = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# VolunteerContact
class VolunteerContact(models.Model):
    contact_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='contacts')
    mobile_number = models.CharField(max_length=15)
    facebook_link = models.URLField(blank=True, null=True)

# VolunteerAddress
class VolunteerAddress(models.Model):
    address_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255)
    province = models.CharField(max_length=100)
    region = models.CharField(max_length=100)

# VolunteerEducation
class VolunteerEducation(models.Model):
    education_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='educations')
    degree_program = models.CharField(max_length=100)
    year_level = models.CharField(max_length=10)
    college = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    year_graduated = models.CharField(max_length=4, blank=True, null=True)

# VolunteerBackground
class VolunteerBackground(models.Model):
    background_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='backgrounds')
    occupation = models.CharField(max_length=100, blank=True, null=True)
    org_affiliation = models.CharField(max_length=255, blank=True, null=True)
    hobbies_interests = models.TextField(blank=True, null=True)

# Volunteer EmergencyContact
class EmergencyContact(models.Model):
    contact_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255)

# VolunteerAccount
class VolunteerAccount(models.Model):
    account_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='accounts')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    # check password method
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    

# ProgramInterest
class ProgramInterest(models.Model):
    program_interest_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='program_interests')
    program_name = models.CharField(max_length=255)

# VolunteerAffiliation
class VolunteerAffiliation(models.Model):
    volunteer_affiliation_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='affiliations')
    affiliation = models.ForeignKey('Affiliation', on_delete=models.CASCADE)

# Affiliation
class Affiliation(models.Model):
    affiliation_id = models.AutoField(primary_key=True)
    affiliation_name = models.CharField(max_length=255)

    def __str__(self):
        return self.affiliation_name

# Admin Table
class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.username

# Events Table
class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=255)
    description = models.TextField()
    date_start = models.DateTimeField()
    date_end = models.DateTimeField()
    max_participants = models.IntegerField()
    location = models.CharField(max_length=255)
    created_by = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='events')

    def __str__(self):
        return self.event_name

# VolunteerEvent
class VolunteerEvent(models.Model):
    STATUS_CHOICES = [
        ('Joined', 'Joined'),
        ('Completed', 'Completed'),
        ('Dropped', 'Dropped'),
    ]

    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    hours_rendered = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    availability_time = models.BooleanField(default=False)
    availability_orientation = models.BooleanField(default=False)
    signup_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('volunteer', 'event')

    def __str__(self):
        return f"{self.volunteer} - {self.event}"
