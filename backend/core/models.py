from django.db import models
from django.contrib.auth.hashers import check_password
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

# Volunteer (Main Profile)
class Volunteer(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Suspended', 'Suspended'),
    ]

    AFFILIATION_CHOICES = [
        ('student', 'Student'),
        ('alumni', 'Alumni'),
        ('staff', 'UP Staff'),
        ('faculty', 'Faculty'),
        ('retiree', 'Retiree'),
    ]

    volunteer_id = models.AutoField(primary_key=True)
    volunteer_identifier = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )
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
    affiliation_type = models.CharField(
        max_length=20,
        choices=AFFILIATION_CHOICES,
        null=True,   
        blank=True
    )
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        from core.utils import generate_volunteer_identifier, auto_update_total_hours

        # Auto-generate volunteer identifier ONLY if empty
        if not self.volunteer_identifier:
            self.volunteer_identifier = generate_volunteer_identifier()

        super().save(*args, **kwargs)

        # Update total hours automatically (no loop)
        auto_update_total_hours(self, skip_save=True)


# Contact, Address, Background, Emergency
class VolunteerContact(models.Model):
    contact_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='contacts')
    mobile_number = models.CharField(max_length=15)
    facebook_link = models.URLField(blank=True, null=True)


class VolunteerAddress(models.Model):
    address_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255)
    province = models.CharField(max_length=100)
    region = models.CharField(max_length=100)


class VolunteerBackground(models.Model):
    background_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='backgrounds')
    occupation = models.CharField(max_length=100, blank=True, null=True)
    org_affiliation = models.CharField(max_length=255, blank=True, null=True)
    hobbies_interests = models.TextField(blank=True, null=True)


class EmergencyContact(models.Model):
    contact_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255)


# Volunteer Login
class VolunteerAccount(models.Model):
    account_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='accounts')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

# Program Interests
class ProgramInterest(models.Model):
    program_interest_id = models.AutoField(primary_key=True)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='program_interests')
    program_name = models.CharField(max_length=255)


# Models Per Affiliation
class StudentProfile(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name='student_profile')
    degree_program = models.CharField(max_length=100)
    year_level = models.CharField(max_length=20)
    college = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

class AlumniProfile(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name='alumni_profile')
    constituent_unit = models.CharField(max_length=100)
    degree_program = models.CharField(max_length=100)
    year_graduated = models.CharField(max_length=4)

class StaffProfile(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name='staff_profile')
    office_department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)

class FacultyProfile(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name='faculty_profile')
    college = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

class RetireeProfile(models.Model):
    volunteer = models.OneToOneField(Volunteer, on_delete=models.CASCADE, related_name='retiree_profile')
    designation_while_in_up = models.CharField(max_length=100)
    office_college_department = models.CharField(max_length=255)

# Events
class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    is_cancelled = models.BooleanField(default=False)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


# Giadd ko ni diri, wala koy gitanggal - Quennie 
class EventSchedule(models.Model):
    event = models.ForeignKey(Event, related_name="schedules", on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    # Use a realistic default
    max_slots = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.date} {self.start_time}-{self.end_time}"


class VolunteerEvent(models.Model):
    STATUS_CHOICES = [
        ('Joined', 'Joined'),
        ('Completed', 'Completed'),
        ('Dropped', 'Dropped'),
    ]

    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    hours_rendered = models.IntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Joined")
    availability_time = models.CharField(max_length=255, blank=True, null=True)
    availability_orientation = models.BooleanField(default=False)
    signup_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('volunteer', 'event')

    def __str__(self):
        return f"{self.volunteer} - {self.event}"
    
class VolunteerScheduleSelection(models.Model):
    """
    Links a VolunteerEvent (the user joining the event) to the chosen EventSchedule.
    """
    volunteer_event = models.ForeignKey(
        'VolunteerEvent',
        on_delete=models.CASCADE,
        related_name='schedule_selections'
    )
    schedule = models.ForeignKey(
        EventSchedule,
        related_name="volunteers",  # keep .volunteers to count slots taken
        on_delete=models.CASCADE
    )
    
    hours_rendered = models.FloatField(default=0) #pre-schedule hours

    class Meta:
        # optional, avoid duplicate selection for same vol_event and schedule
        unique_together = ('volunteer_event', 'schedule')

    def __str__(self):
        return f"{self.volunteer_event} -> {self.schedule}"