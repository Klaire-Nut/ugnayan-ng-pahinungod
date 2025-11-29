from django.contrib import admin
from .models import (
    Volunteer,
    VolunteerAccount,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    ProgramInterest,
    EmergencyContact,
    Event,
    VolunteerEvent,
    Admin as AdminUser
)

# Register all models
admin.site.register(Volunteer)
admin.site.register(VolunteerAccount)
admin.site.register(VolunteerContact)
admin.site.register(VolunteerAddress)
admin.site.register(VolunteerBackground)
admin.site.register(ProgramInterest)
admin.site.register(EmergencyContact)
admin.site.register(Event)
admin.site.register(VolunteerEvent)
admin.site.register(AdminUser)
