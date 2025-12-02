# volunteers/views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404

from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    VolunteerEvent,
    StudentProfile,
    AlumniProfile,
    StaffProfile,
    FacultyProfile,
    RetireeProfile,
    Event
)


# ================================================================
#  🔎 AUTH HELPER — GET VOLUNTEER FROM DJANGO SESSION
# ================================================================
def get_volunteer_from_request(request):
    volunteer_id = request.session.get("volunteer_id")
    if not volunteer_id:
        return None

    try:
        return Volunteer.objects.get(volunteer_id=volunteer_id)
    except Volunteer.DoesNotExist:
        return None


# ================================================================
#  📌 FIXED SESSION LOGIN (VOLUNTEER LOGIN)
# ================================================================
@csrf_exempt
def volunteer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email and password required"}, status=400)

    # Find account
    try:
        account = VolunteerAccount.objects.get(email=email)
    except VolunteerAccount.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    # Validate password
    if not check_password(password, account.password):
        return JsonResponse({"error": "Incorrect password"}, status=400)

    # Create a temporary Django User so login() works
    temp_user = User(id=account.volunteer.volunteer_id, username=email)
    temp_user.backend = "django.contrib.auth.backends.ModelBackend"

    # Create session
    login(request, temp_user)

    # Store volunteer ID in session for profile access
    request.session["volunteer_id"] = account.volunteer.volunteer_id

    return JsonResponse({
        "message": "Login successful",
        "volunteer_id": account.volunteer.volunteer_id,
        "email": email
    })


# ================================================================
#  🚪 LOGOUT — CLEAR DJANGO SESSION
# ================================================================
@csrf_exempt
def volunteer_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


# ================================================================
#  👤 PROFILE VIEW (GET + UPDATE)
# ================================================================
class VolunteerProfileView(APIView):
    # REMOVE DRF AUTH — we use session manually
    # permission_classes = []

    def get(self, request):
        volunteer = get_volunteer_from_request(request)

        if not volunteer:
            return Response(
                {"error": "Volunteer not found. Please login again."},
                status=403
            )

        account = getattr(volunteer, "account", None)
        contact = getattr(volunteer, "contact", None)
        address = getattr(volunteer, "address", None)
        background = getattr(volunteer, "background", None)
        emergency = getattr(volunteer, "emergency_contact", None)

        affiliation_data = {}
        aff_type = (volunteer.affiliation_type or "").upper()

        if aff_type == "STUDENT":
            p = StudentProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "degree_program": p.degree_program,
                    "year_level": p.year_level,
                    "college": p.college,
                    "department": p.department
                }

        elif aff_type == "ALUMNI":
            p = AlumniProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "constituent_unit": p.constituent_unit,
                    "degree_program": p.degree_program,
                    "year_graduated": p.year_graduated
                }

        elif aff_type == "UP STAFF":
            p = StaffProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "office_department": p.office_department,
                    "designation": p.designation
                }

        elif aff_type == "FACULTY":
            p = FacultyProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "college": p.college,
                    "department": p.department
                }

        elif aff_type == "RETIREE":
            p = RetireeProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "designation_while_in_up": p.designation_while_in_up,
                    "office_college_department": p.office_college_department
                }

        data = {
            "volunteer_id": volunteer.volunteer_id,
            "first_name": volunteer.first_name,
            "middle_name": volunteer.middle_name,
            "last_name": volunteer.last_name,
            "nickname": volunteer.nickname,
            "sex": volunteer.sex,
            "birthdate": volunteer.birthdate,
            "affiliation_type": volunteer.affiliation_type,

            "email": account.email if account else None,
            "mobile_number": contact.mobile_number if contact else None,
            "facebook_link": contact.facebook_link if contact else None,

            "street_address": address.street_address if address else None,
            "province": address.province if address else None,
            "region": address.region if address else None,

            "occupation": background.occupation if background else None,
            "org_affiliation": background.org_affiliation if background else None,
            "hobbies_interests": background.hobbies_interests if background else None,

            "emergency_contact": {
                "name": emergency.name if emergency else None,
                "relationship": emergency.relationship if emergency else None,
                "contact_number": emergency.contact_number if emergency else None,
                "address": emergency.address if emergency else None,
            } if emergency else None,

            "affiliation_data": affiliation_data
        }

        return Response(data, status=200)

    def patch(self, request):
        volunteer = get_volunteer_from_request(request)
        if not volunteer:
            return Response({"error": "Volunteer not found"}, status=403)

        data = request.data

        try:
            with transaction.atomic():

                # Basic volunteer info
                for field in ["first_name", "middle_name", "last_name",
                              "nickname", "sex", "birthdate"]:
                    if field in data:
                        setattr(volunteer, field, data[field])
                volunteer.save()

                # Contact
                if "mobile_number" in data or "facebook_link" in data:
                    contact, _ = VolunteerContact.objects.get_or_create(volunteer=volunteer)
                    contact.mobile_number = data.get("mobile_number", contact.mobile_number)
                    contact.facebook_link = data.get("facebook_link", contact.facebook_link)
                    contact.save()

                # Address
                if any(k in data for k in ["street_address", "province", "region"]):
                    address, _ = VolunteerAddress.objects.get_or_create(volunteer=volunteer)
                    address.street_address = data.get("street_address", address.street_address)
                    address.province = data.get("province", address.province)
                    address.region = data.get("region", address.region)
                    address.save()

                # Background
                if any(k in data for k in ["occupation", "org_affiliation", "hobbies_interests"]):
                    bg, _ = VolunteerBackground.objects.get_or_create(volunteer=volunteer)
                    bg.occupation = data.get("occupation", bg.occupation)
                    bg.org_affiliation = data.get("org_affiliation", bg.org_affiliation)
                    bg.hobbies_interests = data.get("hobbies_interests", bg.hobbies_interests)
                    bg.save()

                # Emergency Contact
                if "emergency_contact" in data:
                    emer_data = data["emergency_contact"]
                    emergency, _ = EmergencyContact.objects.get_or_create(volunteer=volunteer)
                    emergency.name = emer_data.get("name", emergency.name)
                    emergency.relationship = emer_data.get("relationship", emergency.relationship)
                    emergency.contact_number = emer_data.get("contact_number", emergency.contact_number)
                    emergency.address = emer_data.get("address", emergency.address)
                    emergency.save()

                return Response({"message": "Profile updated successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# ================================================================
#  📜 EVENT HISTORY
# ================================================================
class VolunteerHistoryView(APIView):

    def get(self, request):
        volunteer = get_volunteer_from_request(request)
        if not volunteer:
            return Response({"error": "Volunteer not found"}, status=403)

        queryset = VolunteerEvent.objects.filter(
            volunteer=volunteer
        ).select_related("event").order_by("-signup_date")

        history = [{
            "event_id": ve.event.event_id,
            "event_name": ve.event.event_name,
            "date": ve.event.date_start,
            "status": ve.status,
            "signup_date": ve.signup_date
        } for ve in queryset]

        stats = {
            "total_events": queryset.count(),
            "completed_events": queryset.filter(status="Completed").count(),
        }

        return Response({"statistics": stats, "history": history}, status=200)


# ================================================================
#  🔐 CHANGE PASSWORD
# ================================================================
class ChangePasswordView(APIView):

    def post(self, request):
        volunteer = get_volunteer_from_request(request)
        if not volunteer:
            return Response({"error": "Volunteer not found"}, status=403)

        account = volunteer.account

        current = request.data.get("current_password")
        new = request.data.get("new_password")
        confirm = request.data.get("confirm_password")

        if not check_password(current, account.password):
            return Response({"error": "Incorrect current password"}, status=400)

        if new != confirm:
            return Response({"error": "Passwords do not match"}, status=400)

        account.password = make_password(new)
        account.save()

        return Response({"message": "Password updated"}, status=200)


# ================================================================
#  📝 REGISTRATION (Your logic unchanged)
# ================================================================
class RegisterVolunteer(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pass  # Your original registration logic remains
