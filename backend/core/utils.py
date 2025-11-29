#Volunteer Unique Identifier Generator
import datetime
from core.models import Volunteer

def generate_volunteer_identifier():
    today = datetime.date.today().strftime("%Y%m%d")

    count_today = Volunteer.objects.filter(
        date_joined=datetime.date.today()
    ).count()

    sequential = str(count_today + 1).zfill(4)

    return f"{today}-{sequential}"
