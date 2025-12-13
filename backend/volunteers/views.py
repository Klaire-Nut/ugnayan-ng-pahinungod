# backend/volunteers/views.py
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication

from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout, get_user_model

from django.http import JsonResponse
from django.db import transaction
import json
import traceback

User = get_user_model()

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
    Event,
    VolunteerScheduleSelection,
    EventSchedule,
    ProgramInterest,
)

from volunteers.serializers import VolunteerSerializer
from core.utils import generate_volunteer_identifier

from rest_framework.authtoken.models import Token
from events.serializers import EventListSerializer

# Helper: safely get volunteer account from the current user
def _get_volunteer_account_for_user(user):
    email = getattr(user, "email", None)
    if not email:
        return None
    try:
        return VolunteerAccount.objects.select_related("volunteer").get(email=email)
    except VolunteerAccount.DoesNotExist:
        return None

# ================================================================
#   VOLUNTEER LOGIN (TOKEN-BASED)
# ================================================================
@csrf_exempt
def volunteer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email and password required"}, status=400)

    try:
        account = VolunteerAccount.objects.select_related("volunteer").get(email=email)
    except VolunteerAccount.DoesNotExist:
        return JsonResponse({"error": "Invalid email or password"}, status=400)

    print("🔥 USING VOLUNTEERS LOGIN")
    print("PASSWORD HASH:", account.password)

    if not check_password(password, account.password):
        return JsonResponse({"error": "Invalid email or password"}, status=400)

    volunteer = account.volunteer
    
    user, created = User.objects.get_or_create(email=email)

    if created:
        user.set_password(password)
        
    user.is_volunteer = True
    user.save()

    # login to create session compatibility (not required for token auth but harmless)
    user.backend = "django.contrib.auth.backends.ModelBackend"
    login(request, user)

    # create/get token
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)

    return JsonResponse({
        "success": True,
        "message": "Login successful",
        "token": token.key,
        "volunteer": VolunteerSerializer(volunteer).data,
    })


# ================================================================
#  LOGOUT
# ================================================================
@csrf_exempt
def volunteer_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


# ================================================================
# VOLUNTEER PROFILE VIEW (TOKEN) - SAFE VERSION
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Option 2: get VolunteerAccount using request.user.email
        try:
            account = VolunteerAccount.objects.get(email=request.user.email)
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Volunteer profile not found."}, status=404)

        volunteer = account.volunteer

        # Safe related objects
        contact = volunteer.contacts.first() if hasattr(volunteer, "contacts") else None
        address = volunteer.addresses.first() if hasattr(volunteer, "addresses") else None
        background = volunteer.backgrounds.first() if hasattr(volunteer, "backgrounds") else None
        emergency = volunteer.emergency_contacts.first() if hasattr(volunteer, "emergency_contacts") else None

        # Affiliation
        aff = (volunteer.affiliation_type or "").lower()
        affiliation_data = []

        if aff == "student":
            p = getattr(volunteer, "student_profile", None)
            if p:
                affiliation_data.append({
                    "type": "STUDENT",
                    "degree_program": getattr(p, "degree_program", None),
                    "year_level": getattr(p, "year_level", None),
                    "college": getattr(p, "college", None),
                    "department": getattr(p, "department", None),
                })
        elif aff == "alumni":
            p = getattr(volunteer, "alumni_profile", None)
            if p:
                affiliation_data.append({
                    "type": "ALUMNI",
                    "constituent_unit": getattr(p, "constituent_unit", None),
                    "degree_program": getattr(p, "degree_program", None),
                    "year_graduated": getattr(p, "year_graduated", None),
                })
        elif aff == "staff":
            p = getattr(volunteer, "staff_profile", None)
            if p:
                affiliation_data.append({
                    "type": "UP STAFF",
                    "office_department": getattr(p, "office_department", None),
                    "designation": getattr(p, "designation", None),
                })
        elif aff == "faculty":
            p = getattr(volunteer, "faculty_profile", None)
            if p:
                affiliation_data.append({
                    "type": "FACULTY",
                    "college": getattr(p, "college", None),
                    "department": getattr(p, "department", None),
                })
        elif aff == "retiree":
            p = getattr(volunteer, "retiree_profile", None)
            if p:
                affiliation_data.append({
                    "type": "RETIREE",
                    "designation_while_in_up": getattr(p, "designation_while_in_up", None),
                    "office_college_department": getattr(p, "office_college_department", None),
                })

        # Program interests
        program_interests_qs = ProgramInterest.objects.filter(volunteer=volunteer)
        program_interests = [pi.program_name for pi in program_interests_qs]

        return Response({
            "volunteer": {
                "volunteer_id": getattr(volunteer, "volunteer_id", None),
                "volunteer_identifier": getattr(volunteer, "volunteer_identifier", None),
                "first_name": getattr(volunteer, "first_name", None),
                "middle_name": getattr(volunteer, "middle_name", None),
                "last_name": getattr(volunteer, "last_name", None),
                "nickname": getattr(volunteer, "nickname", None),
                "sex": getattr(volunteer, "sex", None),
                "birthdate": getattr(volunteer, "birthdate", None),
                "affiliation_type": getattr(volunteer, "affiliation_type", None),
                "email": getattr(account, "email", None),
            },
            "contact": {
                "mobile_number": getattr(contact, "mobile_number", None),
                "facebook_link": getattr(contact, "facebook_link", None),
            },
            "address": {
                "street_address": getattr(address, "street_address", None),
                "province": getattr(address, "province", None),
                "region": getattr(address, "region", None),
            },
            "background": {
                "occupation": getattr(background, "occupation", None),
                "org_affiliation": getattr(background, "org_affiliation", None),
                "hobbies_interests": getattr(background, "hobbies_interests", None),
            },
            "emergency_contact": {
                "name": getattr(emergency, "name", None),
                "relationship": getattr(emergency, "relationship", None),
                "contact_number": getattr(emergency, "contact_number", None),
                "address": getattr(emergency, "address", None),
            },
            "affiliation_data": affiliation_data,
            "program_interests": program_interests,
        })

    def patch(self, request):
        try:
            account = VolunteerAccount.objects.get(email=request.user.email)
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Volunteer profile not found."}, status=404)

        volunteer = account.volunteer
        data = request.data

        try:
            with transaction.atomic():
                # Basic info
                for field in ["first_name", "middle_name", "last_name", "nickname", "sex", "birthdate"]:
                    if field in data:
                        setattr(volunteer, field, data[field])
                volunteer.save()

                # Contact info
                contact, _ = VolunteerContact.objects.get_or_create(volunteer=volunteer)
                contact.mobile_number = data.get("mobile_number", getattr(contact, "mobile_number", None))
                contact.facebook_link = data.get("facebook_link", getattr(contact, "facebook_link", None))
                contact.save()

                # Address info
                address, _ = VolunteerAddress.objects.get_or_create(volunteer=volunteer)
                address.street_address = data.get("street_address", getattr(address, "street_address", None))
                address.province = data.get("province", getattr(address, "province", None))
                address.region = data.get("region", getattr(address, "region", None))
                address.save()

            return Response({"success": True})

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# ================================================================
#  EVENT HISTORY
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerHistoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = _get_volunteer_account_for_user(request.user)
        if not account:
            return Response({"error": "Invalid token or account not found"}, status=403)

        volunteer = account.volunteer

        selections = VolunteerScheduleSelection.objects.select_related(
            "schedule", "volunteer_event__event"
        ).filter(volunteer_event__volunteer=volunteer).order_by("schedule__date")

        history = []
        for sel in selections:
            evt = sel.volunteer_event.event
            sch = sel.schedule
            # compute day index (optional)
            event_schedules = list(EventSchedule.objects.filter(event=evt).order_by("date"))
            try:
                day_index = next(i for i, s in enumerate(event_schedules) if s.id == sch.id)
                day_label = f"Day {day_index + 1}"
            except StopIteration:
                day_label = None

            history.append({
                "event_id": evt.event_id,
                "event_name": evt.event_name,
                "date": sch.date,
                "schedule_day": day_label,
                "start_time": sch.start_time,
                "end_time": sch.end_time,
                "hours_rendered": sel.hours_rendered,
                "status": sel.volunteer_event.status,
            })

        return Response({"history": history})

# ================================================================
#  CHANGE PASSWORD
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        account = _get_volunteer_account_for_user(request.user)
        if not account:
            return Response({"error": "Invalid token or account not found"}, status=403)

        current = request.data.get("current_password")
        new = request.data.get("new_password")
        confirm = request.data.get("confirm_password")

        if not current or not new or not confirm:
            return Response({"error": "All fields are required"}, status=400)

        if not check_password(current, account.password):
            return Response({"error": "Incorrect current password"}, status=400)

        if new != confirm:
            return Response({"error": "Passwords do not match"}, status=400)

        # Update VolunteerAccount password
        account.password = make_password(new)
        account.save()

        # Update Django User password PROPERLY
        user = request.user
        user.set_password(new)
        user.save()

        # Force token refresh (VERY IMPORTANT)
        Token.objects.filter(user=user).delete()
        Token.objects.create(user=user)

        return Response({"message": "Password updated successfully"})


# ================================================================
# REGISTER VOLUNTEER
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class RegisterVolunteer(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        errors = {}

        try:
            with transaction.atomic():
                # Extract data blocks
                account_data = request.data.get("account", {})
                volunteer_data = request.data.get("volunteer", {})
                contact_data = request.data.get("contact", {})
                address_data = request.data.get("address", {})
                background_data = request.data.get("background", {})
                emergency_data = request.data.get("emergency_contact", {})
                affiliation_data = request.data.get("affiliation_data", {})
                program_interests = request.data.get("program_interests", [])

                email = account_data.get("email", "").strip()
                password = account_data.get("password", "")

                # BASIC VALIDATION
                if not email:
                    errors["email"] = "Email is required"
                if not password:
                    errors["password"] = "Password is required"
                else:
                    try:
                        validate_password(password)
                    except DjangoValidationError as e:
                        errors["password"] = list(e.messages)

                if email and VolunteerAccount.objects.filter(email=email).exists():
                    errors["email"] = "This email is already registered"

                if not volunteer_data.get("first_name"):
                    errors["first_name"] = "First name is required"
                if not volunteer_data.get("last_name"):
                    errors["last_name"] = "Last name is required"
                if not volunteer_data.get("affiliation_type"):
                    errors["affiliation_type"] = "Affiliation type is required"

                if errors:
                    return Response({"errors": errors}, status=400)

                # Create volunteer
                volunteer = Volunteer.objects.create(
                    first_name=volunteer_data.get("first_name", "").strip(),
                    middle_name=volunteer_data.get("middle_name", "").strip(),
                    last_name=volunteer_data.get("last_name", "").strip(),
                    nickname=volunteer_data.get("nickname", "").strip(),
                    sex=volunteer_data.get("sex", ""),
                    birthdate=volunteer_data.get("birthdate"),
                    # <-- use lower() here (not upper)
                    affiliation_type=(volunteer_data.get("affiliation_type", "") or "").lower(),
                    volunteer_identifier=generate_volunteer_identifier(),
                )

                # Create account
                VolunteerAccount.objects.create(
                    volunteer=volunteer,
                    email=email,
                    password=make_password(password)
                )

                # Contact
                if contact_data:
                    VolunteerContact.objects.create(
                        volunteer=volunteer,
                        mobile_number=contact_data.get("mobile_number", ""),
                        facebook_link=contact_data.get("facebook_link", "")
                    )

                # Address
                if address_data:
                    VolunteerAddress.objects.create(
                        volunteer=volunteer,
                        street_address=address_data.get("street_address", ""),
                        province=address_data.get("province", ""),
                        region=address_data.get("region", "")
                    )

                # Background
                if background_data:
                    VolunteerBackground.objects.create(
                        volunteer=volunteer,
                        org_affiliation=background_data.get("org_affiliation", ""),
                        hobbies_interests=background_data.get("hobbies_interests", "")
                    )

                # Emergency
                if emergency_data:
                    EmergencyContact.objects.create(
                        volunteer=volunteer,
                        name=emergency_data.get("name", ""),
                        relationship=emergency_data.get("relationship", ""),
                        contact_number=emergency_data.get("contact_number", ""),
                        address=emergency_data.get("address", "")
                    )

                # Affiliation-specific
                aff = (volunteer.affiliation_type or "").lower()

                if aff == "student":
                    StudentProfile.objects.create(
                        volunteer=volunteer,
                        degree_program=affiliation_data.get("degree_program", ""),
                        year_level=affiliation_data.get("year_level", ""),
                        college=affiliation_data.get("college", ""),
                    )
                elif aff == "alumni":
                    AlumniProfile.objects.create(
                        volunteer=volunteer,
                        constituent_unit=affiliation_data.get("constituent_unit", ""),
                        degree_program=affiliation_data.get("degree_program", ""),
                        year_graduated=affiliation_data.get("year_graduated", ""),
                    )
                elif aff == "staff":
                    StaffProfile.objects.create(
                        volunteer=volunteer,
                        office_department=affiliation_data.get("office_department", ""),
                        designation=affiliation_data.get("designation", ""),
                    )
                elif aff == "faculty":
                    FacultyProfile.objects.create(
                        volunteer=volunteer,
                        college=affiliation_data.get("college", ""),
                        department=affiliation_data.get("department", ""),
                    )
                elif aff == "retiree":
                    RetireeProfile.objects.create(
                        volunteer=volunteer,
                        designation_while_in_up=affiliation_data.get("designation_while_in_up", ""),
                        office_college_department=affiliation_data.get("office_college_department", ""),
                    )

                return Response({
                    "message": "Registration successful! You may now log in.",
                    "volunteer_id": volunteer.volunteer_id
                }, status=201)

        except Exception as e:
            print("REGISTER ERROR:", traceback.format_exc())
            return Response({"error": str(e)}, status=500)


# Small convenience endpoint used by frontend (list of current events)
class VolunteerEventListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # we don't need to attach volunteer to request user object here; frontend only needs events
        events = Event.objects.filter(is_cancelled=False).order_by("date_start")
        serializer = EventListSerializer(events, many=True, context={"request": request})
        return Response(serializer.data)

