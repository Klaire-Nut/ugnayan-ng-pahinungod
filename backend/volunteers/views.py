# volunteers/views.py

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.contrib.auth import get_user_model

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
    RetireeProfile
)

from volunteers.serializers import VolunteerSerializer
from core.utils import generate_volunteer_identifier

from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication


# ================================================================
#  🔐 VOLUNTEER LOGIN (TOKEN-BASED)
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

    if not check_password(password, account.password):
        return JsonResponse({"error": "Invalid email or password"}, status=400)

    volunteer = account.volunteer

    # Ensure Django user exists (for token)
    user, _ = User.objects.get_or_create(username=email)
    if not user.password:
        user.password = make_password(password)
        user.save()

    # Login user for session compatibility
    user.backend = "django.contrib.auth.backends.ModelBackend"
    login(request, user)

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    return JsonResponse({
        "success": True,
        "message": "Login successful",
        "token": token.key,
        "volunteer": VolunteerSerializer(volunteer).data,
    })


# ================================================================
#  🚪 LOGOUT
# ================================================================
@csrf_exempt
def volunteer_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


# ================================================================
#  👤 VOLUNTEER PROFILE VIEW (TOKEN)
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            account = VolunteerAccount.objects.get(email=request.user.username)
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Invalid token"}, status=403)

        volunteer = account.volunteer

        contact = VolunteerContact.objects.filter(volunteer=volunteer).first()
        address = VolunteerAddress.objects.filter(volunteer=volunteer).first()
        background = VolunteerBackground.objects.filter(volunteer=volunteer).first()
        emergency = EmergencyContact.objects.filter(volunteer=volunteer).first()

        return Response({
            "volunteer": VolunteerSerializer(volunteer).data,
            "contact": {
                "mobile_number": contact.mobile_number if contact else None,
                "facebook_link": contact.facebook_link if contact else None,
            },
            "address": {
                "street_address": address.street_address if address else None,
                "province": address.province if address else None,
                "region": address.region if address else None,
            },
            "background": {
                "occupation": background.occupation if background else None,
                "org_affiliation": background.org_affiliation if background else None,
                "hobbies_interests": background.hobbies_interrests if background else None,
            },
            "emergency_contact": {
                "name": emergency.name if emergency else None,
                "relationship": emergency.relationship if emergency else None,
                "contact_number": emergency.contact_number if emergency else None,
                "address": emergency.address if emergency else None,
            }
        })

    def patch(self, request):
        try:
            account = VolunteerAccount.objects.get(email=request.user.username)
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Invalid token"}, status=403)

        volunteer = account.volunteer
        data = request.data

        try:
            with transaction.atomic():
                # BASIC INFO
                for field in ["first_name", "middle_name", "last_name",
                              "nickname", "sex", "birthdate"]:
                    if field in data:
                        setattr(volunteer, field, data[field])
                volunteer.save()

                # CONTACT INFO
                contact, _ = VolunteerContact.objects.get_or_create(volunteer=volunteer)
                contact.mobile_number = data.get("mobile_number", contact.mobile_number)
                contact.facebook_link = data.get("facebook_link", contact.facebook_link)
                contact.save()

                # ADDRESS
                address, _ = VolunteerAddress.objects.get_or_create(volunteer=volunteer)
                address.street_address = data.get("street_address", address.street_address)
                address.province = data.get("province", address.province)
                address.region = data.get("region", address.region)
                address.save()

            return Response({"success": True})

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# ================================================================
#  📜 EVENT HISTORY
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerHistoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            account = VolunteerAccount.objects.get(email=request.user.username)
            volunteer = account.volunteer
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Invalid token"}, status=403)

        queryset = VolunteerEvent.objects.filter(
            volunteer=volunteer
        ).select_related("event").order_by("event__date_start")

        history = [
            {
                "event_id": ve.event.event_id,
                "event_name": ve.event.event_name,
                "date": ve.event.date_start,
                "time_in": ve.event.date_start,
                "time_out": ve.event.date_end,
                "hours_rendered": ve.hours_rendered,
                "status": ve.status,
            }
            for ve in queryset
        ]

        return Response({"history": history})


# ================================================================
#  🔐 CHANGE PASSWORD
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            account = VolunteerAccount.objects.get(email=request.user.username)
        except VolunteerAccount.DoesNotExist:
            return Response({"error": "Invalid token"}, status=403)

        current = request.data.get("current_password")
        new = request.data.get("new_password")
        confirm = request.data.get("confirm_password")

        if not current or not new or not confirm:
            return Response({"error": "All fields are required"}, status=400)

        if not check_password(current, account.password):
            return Response({"error": "Incorrect current password"}, status=400)

        if new != confirm:
            return Response({"error": "Passwords do not match"}, status=400)

        account.password = make_password(new)
        account.save()

        return Response({"message": "Password updated successfully"})


# ================================================================
#  📝 REGISTER VOLUNTEER
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
                    affiliation_type=volunteer_data.get("affiliation_type", "").upper(),
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
                        occupation=background_data.get("occupation", ""),
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
                aff = volunteer.affiliation_type

                if aff == "STUDENT":
                    StudentProfile.objects.create(
                        volunteer=volunteer,
                        degree_program=affiliation_data.get("degree_program", ""),
                        year_level=affiliation_data.get("year_level", ""),
                        college=affiliation_data.get("college", ""),
                        department=affiliation_data.get("department", ""),
                    )
                elif aff == "ALUMNI":
                    AlumniProfile.objects.create(
                        volunteer=volunteer,
                        constituent_unit=affiliation_data.get("constituent_unit", ""),
                        degree_program=affiliation_data.get("degree_program", ""),
                        year_graduated=affiliation_data.get("year_graduated", ""),
                    )
                elif aff == "UP STAFF":
                    StaffProfile.objects.create(
                        volunteer=volunteer,
                        office_department=affiliation_data.get("office_department", ""),
                        designation=affiliation_data.get("designation", ""),
                    )
                elif aff == "FACULTY":
                    FacultyProfile.objects.create(
                        volunteer=volunteer,
                        college=affiliation_data.get("college", ""),
                        department=affiliation_data.get("department", ""),
                    )
                elif aff == "RETIREE":
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
