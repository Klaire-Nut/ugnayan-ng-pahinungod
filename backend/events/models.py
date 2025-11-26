# events/models.py

"""
Event models are imported from core.models to maintain single source of truth.
This file serves as a convenience import point for the events app.
"""

from core.models import (
    # Volunteer related models
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    ProgramInterest,

    
    # Admin model
    Admin,
    
    # Event related models
    Event,
    VolunteerEvent,
)

__all__ = [
    'Volunteer',
    'VolunteerContact',
    'VolunteerAddress',
    'VolunteerBackground',
    'EmergencyContact',
    'VolunteerAccount',
    'ProgramInterest',
    'Admin',
    'Event',
    'VolunteerEvent',
]