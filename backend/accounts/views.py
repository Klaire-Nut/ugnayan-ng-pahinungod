from django.shortcuts import render
import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import AnonymousUser
from core.models import VolunteerAccount 
from django.contrib.auth.hashers import check_password
from core.models import Admin

# Admin Account
@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Check admin credentials
    try:
        admin = Admin.objects.get(username=username, password=password)
    except Admin.DoesNotExist:
        return JsonResponse({"error": "Invalid username or password"}, status=400)

    # Save admin ID in session
    request.session["admin_id"] = admin.admin_id

    # Return response
    return JsonResponse({
        "message": "Login successful",
        "admin": {
            "admin_id": admin.admin_id,
            "username": admin.username,
        }
    })



@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    logout(request)
    return JsonResponse({"message": "Logged out"})


def user_view(request):
    admin_id = request.session.get("admin_id")

    if not admin_id:
        return JsonResponse({"admin": None})

    try:
        admin = Admin.objects.get(admin_id=admin_id)
    except Admin.DoesNotExist:
        return JsonResponse({"admin": None})

    return JsonResponse({
        "admin": {
            "admin_id": admin.admin_id,
            "username": admin.username
        }
    })



# Volunteer Account
@csrf_exempt
def volunteer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required."}, status=400)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email and password are required."}, status=400)

    try:
        account = VolunteerAccount.objects.get(email=email)
        if check_password(password, account.password):
            request.session['volunteer_id'] = account.volunteer.volunteer_id
            return JsonResponse({"message": "Login successful!"})
        else:
            # Debugging output
            return JsonResponse({
                "error": "Password mismatch.",
                "email_received": email,
                "stored_password_hash": account.password
            }, status=400)
    except VolunteerAccount.DoesNotExist:
        # Debugging output
        return JsonResponse({
            "error": "Account not found.",
            "email_received": email
        }, status=404)


@csrf_exempt
def volunteer_logout(request):
    request.session.pop('volunteer_id', None)
    return JsonResponse({"message": "Logout successful."})