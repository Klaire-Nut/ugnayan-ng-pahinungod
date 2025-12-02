# volunteers/middleware.py
from core.models import Volunteer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class VolunteerMiddleware:
    """
    Middleware to attach volunteer to request based on JWT token
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Try to get volunteer from JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Decode token
                access_token = AccessToken(token)
                volunteer_id = access_token.get('volunteer_id')
                
                if volunteer_id:
                    try:
                        volunteer = Volunteer.objects.select_related('account').get(
                            volunteer_id=volunteer_id
                        )
                        # Attach volunteer to request
                        request.volunteer = volunteer
                        request.user = volunteer  # Also set as user for IsAuthenticated
                    except Volunteer.DoesNotExist:
                        pass
            except (InvalidToken, TokenError):
                pass
        
        # Try to get from session (fallback)
        elif hasattr(request, 'session'):
            volunteer_id = request.session.get('volunteer_id')
            if volunteer_id:
                try:
                    volunteer = Volunteer.objects.get(volunteer_id=volunteer_id)
                    request.volunteer = volunteer
                    request.user = volunteer
                except Volunteer.DoesNotExist:
                    pass
        
        response = self.get_response(request)
        return response