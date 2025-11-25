# events/models.py

"""
This file imports all models from core.models
Since all your models are already defined in core/models.py,
we just need to import them here to make them accessible to the events app.
"""

from core.models import (
    # Volunteer related models
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerEducation,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    ProgramInterest,
    VolunteerAffiliation,
    Affiliation,
    
    # Admin model
    Admin,
    
    # Event related models
    Event,
    VolunteerEvent,
)