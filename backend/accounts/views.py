from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.contrib.auth import authenticate, logout
from django.contrib.auth import get_user_model

User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")

    # Authenticate using email
    user = authenticate(request, email=email, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid email or password"}, status=400)

    if not user.is_admin:
        return JsonResponse({"error": "Not authorized"}, status=403)

    # Issue JWT tokens
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    return JsonResponse({
        "message": "Login successful",
        "access": access,
        "refresh": str(refresh),
        "admin": {
            "id": user.id,
            "email": user.email,
        },
        "role": "admin"
    })


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
    # No custom session needed — Django handles it
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({"admin": None})

    user = request.user

    return JsonResponse({
        "admin": {
            "id": user.id,
            "email": user.email,
        }
    })
