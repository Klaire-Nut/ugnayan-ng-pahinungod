from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.models import VolunteerAccount
import json

@csrf_exempt
def volunteer_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        try:
            volunteer = VolunteerAccount.objects.get(email=email, password=password)
            return JsonResponse({"message": "Login successful"}, status=200)
        except VolunteerAccount.DoesNotExist:
            return JsonResponse({"error": "Invalid email or password"}, status=400)
