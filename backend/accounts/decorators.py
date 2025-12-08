# Protects Volunteer Endpoints
from django.http import JsonResponse

def volunteer_required(view_func):
    def wrapper(request, *args, **kwargs):
        if "volunteer_id" not in request.session:
            return JsonResponse({"error": "Authentication required."}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper
