#Volunteer Unique Identifier Generator
import datetime
from core.models import Volunteer
from django.db.models import Sum
from core.models import VolunteerEvent

def generate_volunteer_identifier():
    today = datetime.date.today().strftime("%Y%m%d")

    count_today = Volunteer.objects.filter(
        date_joined=datetime.date.today()
    ).count()

    sequential = str(count_today + 1).zfill(4)

    return f"{today}-{sequential}"


def auto_update_total_hours(volunteer, skip_save=False):
    calculated_total = VolunteerEvent.objects.filter(
        volunteer=volunteer,
        status="Completed"
    ).aggregate(total=Sum("hours_rendered"))["total"] or 0

    # Allow admin manual edits:
    # Only overwrite IF admin has not manually changed the value
    if volunteer.total_hours == 0 or volunteer.total_hours == calculated_total:
        volunteer.total_hours = calculated_total
        
        # Avoid triggering infinite recursion
        if not skip_save:
            volunteer.save(update_fields=["total_hours"])