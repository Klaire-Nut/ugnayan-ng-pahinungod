# volunteers/middleware.py
from core.models import Volunteer

class VolunteerMiddleware:
    """
    Middleware to attach volunteer object from session
    without overriding Django's request.user.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        volunteer_id = request.session.get("volunteer_id")
        if volunteer_id:
            try:
                volunteer = Volunteer.objects.get(volunteer_id=volunteer_id)
                request.volunteer = volunteer   # ✔ store volunteer here
                # ❌ request.user = volunteer   (REMOVE THIS)
            except Volunteer.DoesNotExist:
                request.volunteer = None
        else:
            request.volunteer = None

        return self.get_response(request)
