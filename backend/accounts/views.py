from django.shortcuts import render

# Create your views here.
import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import AnonymousUser
from core.models import VolunteerAccount 
from django.contrib.auth.hashers import check_password

# Admin Account
@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"error": "username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)  # creates session
        return JsonResponse({"message": "Login successful", "username": user.username})
    else:
        return JsonResponse({"error": "Invalid credentials"}, status=400)


@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    logout(request)
    return JsonResponse({"message": "Logged out"})


def user_view(request):
    # GET only
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)

    user = getattr(request, "user", None)
    if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
        return JsonResponse({"user": None})
    return JsonResponse({"user": {"username": user.username, "id": user.id, "email": user.email}})


# Volunteer Account
@csrf_exempt
def volunteer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required."}, status=400)
    
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")

    try:
        account = VolunteerAccount.objects.get(email=email)
        
        # Use Django's check_password function to verify hashed password
        if check_password(password, account.password):
            request.session['volunteer_id'] = account.volunteer.volunteer_id
            return JsonResponse({"message": "Login successful!"})
        else:
            return JsonResponse({"error": "Invalid credentials."}, status=400)
    except VolunteerAccount.DoesNotExist:
        return JsonResponse({"error": "Account not found."}, status=404)

@csrf_exempt
def volunteer_logout(request):
    request.session.pop('volunteer_id', None)
    return JsonResponse({"message": "Logout successful."})