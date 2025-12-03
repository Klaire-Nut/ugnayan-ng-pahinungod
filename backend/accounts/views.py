from django.shortcuts import render
import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.models import User

# -------------------------
# ADMIN LOGIN
# -------------------------
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
        login(request, user)
        return JsonResponse({
            "message": "Admin login successful",
            "username": user.username,
            "id": user.id
        })
    else:
        return JsonResponse({"error": "Invalid credentials"}, status=400)


# -------------------------
# ADMIN LOGOUT
# -------------------------
@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    logout(request)
    return JsonResponse({"message": "Admin logged out"})


# -------------------------
# ADMIN SESSION CHECK
# -------------------------
def user_view(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)

    user = getattr(request, "user", None)

    if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
        return JsonResponse({"user": None})

    return JsonResponse({
        "user": {
            "username": user.username,
            "id": user.id,
            "email": getattr(user, "email", "")
        }
    })
