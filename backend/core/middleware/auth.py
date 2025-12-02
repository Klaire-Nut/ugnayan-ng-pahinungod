from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.utils.deprecation import MiddlewareMixin
from core.models import VolunteerAccount

class VolunteerAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth = JWTAuthentication()
        try:
            user_auth = auth.authenticate(request)
            if user_auth:
                user, token = user_auth

                volunteer_id = token.get("volunteer_id")
                if volunteer_id:
                    request.volunteer = (
                        VolunteerAccount.objects
                        .select_related("volunteer")
                        .get(volunteer_id=volunteer_id)
                        .volunteer
                    )

        except (InvalidToken, AuthenticationFailed):
            request.volunteer = None
