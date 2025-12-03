# volunteers/views.py

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.db import transaction
import json
import traceback

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


# ================================================================
#  🔎 SESSION AUTH HELPER
# ================================================================
def get_volunteer_from_session(request):
    volunteer_id = request.session.get("volunteer_id")
    if not volunteer_id:
        return None

    try:
        return Volunteer.objects.get(volunteer_id=volunteer_id)
    except Volunteer.DoesNotExist:
        return None


# ================================================================
#  🔐 VOLUNTEER LOGIN (SESSION-BASED)
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
        return JsonResponse({"error": "Account not found"}, status=404)

    if not check_password(password, account.password):
        return JsonResponse({"error": "Incorrect password"}, status=400)

    volunteer = account.volunteer

    # Django User to support session login
    user, _ = User.objects.get_or_create(username=email)
    if not user.password:
        user.password = make_password(password)
        user.save()

    user.backend = "django.contrib.auth.backends.ModelBackend"
    login(request, user)

    request.session["volunteer_id"] = volunteer.volunteer_id
    request.session.save()

    return JsonResponse({
        "message": "Login successful",
        "volunteer_id": volunteer.volunteer_id,
        "volunteer": VolunteerSerializer(volunteer).data
    })


# ================================================================
#  🚪 LOGOUT
# ================================================================
@csrf_exempt
def volunteer_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


# ================================================================
#  👤 PROFILE VIEW (GET + PATCH)
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerProfileView(APIView):

    # ------------------------------------------------------------
    # GET PROFILE
    # ------------------------------------------------------------
    def get(self, request):
        volunteer = get_volunteer_from_session(request)
        if not volunteer:
            return Response({"error": "Not logged in"}, status=403)

        account = volunteer.accounts.first()
        contact = VolunteerContact.objects.filter(volunteer=volunteer).first()
        address = VolunteerAddress.objects.filter(volunteer=volunteer).first()
        background = VolunteerBackground.objects.filter(volunteer=volunteer).first()
        emergency = EmergencyContact.objects.filter(volunteer=volunteer).first()

        # Affiliation
        affiliation_data = {}
        aff = (volunteer.affiliation_type or "").upper()

        if aff == "STUDENT":
            p = StudentProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "degree_program": p.degree_program,
                    "year_level": p.year_level,
                    "college": p.college,
                    "department": p.department
                }

        elif aff == "ALUMNI":
            p = AlumniProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "constituent_unit": p.constituent_unit,
                    "degree_program": p.degree_program,
                    "year_graduated": p.year_graduated
                }

        elif aff == "UP STAFF":
            p = StaffProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "office_department": p.office_department,
                    "designation": p.designation
                }

        elif aff == "FACULTY":
            p = FacultyProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "college": p.college,
                    "department": p.department
                }

        elif aff == "RETIREE":
            p = RetireeProfile.objects.filter(volunteer=volunteer).first()
            if p:
                affiliation_data = {
                    "designation_while_in_up": p.designation_while_in_up,
                    "office_college_department": p.office_college_department
                }

        # Final Response
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
                "name": emergency.name,
                "relationship": emergency.relationship,
                "contact_number": emergency.contact_number,
                "address": emergency.address,
            } if emergency else None,

            "affiliation_data": affiliation_data,
        }

        return Response(data)

    # ------------------------------------------------------------
    # PATCH (UPDATE PROFILE)
    # ------------------------------------------------------------
    def patch(self, request):
        volunteer = get_volunteer_from_session(request)
        if not volunteer:
            return Response({"error": "Not logged in"}, status=403)

        data = request.data
        account = volunteer.accounts.first()

        try:
            with transaction.atomic():

                # BASIC FIELDS
                for field in ["first_name", "middle_name", "last_name",
                              "nickname", "sex", "birthdate"]:
                    if field in data:
                        setattr(volunteer, field, data[field])
                volunteer.save()

                # UPDATE EMAIL
                if account and "email" in data:
                    account.email = data["email"]
                    account.save()

                # CONTACT
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

                # BACKGROUND
                background, _ = VolunteerBackground.objects.get_or_create(volunteer=volunteer)
                background.occupation = data.get("occupation", background.occupation)
                background.org_affiliation = data.get("org_affiliation", background.org_affiliation)
                background.hobbies_interests = data.get("hobbies_interests", background.hobbies_interests)
                background.save()

                # EMERGENCY CONTACT
                if data.get("emergency_contact"):
                    emer = data["emergency_contact"]
                    emergency, _ = EmergencyContact.objects.get_or_create(volunteer=volunteer)
                    emergency.name = emer.get("name", emergency.name)
                    emergency.relationship = emer.get("relationship", emergency.relationship)
                    emergency.contact_number = emer.get("contact_number", emergency.contact_number)
                    emergency.address = emer.get("address", emergency.address)
                    emergency.save()

            return Response({
                "success": True,
                "message": "Profile updated successfully"
            })

        except Exception as e:
            print("PATCH ERROR:", traceback.format_exc())
            return Response({"error": str(e)}, status=400)


# ================================================================
#  📜 EVENT HISTORY (FULL UPDATED VERSION)
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerHistoryView(APIView):

    def get(self, request):
        volunteer = get_volunteer_from_session(request)
        if not volunteer:
            return Response({"error": "Not logged in"}, status=403)

        queryset = VolunteerEvent.objects.filter(
            volunteer=volunteer
        ).select_related("event").order_by("event__date_start")

        history = []
        for ve in queryset:
            history.append({
                "event_id": ve.event.event_id,
                "event_name": ve.event.event_name,
                "date": ve.event.date_start,
                "time_in": ve.event.date_start,
                "time_out": ve.event.date_end,
                "hours_rendered": ve.hours_rendered,
                "status": ve.status,
            })
        return Response({
            "history": history
        })


# ================================================================
#  🔐 CHANGE PASSWORD
# ================================================================
@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):

    def post(self, request):
        volunteer = get_volunteer_from_session(request)
        if not volunteer:
            return Response({"error": "Not logged in"}, status=403)

        account = volunteer.accounts.first()
        if not account:
            return Response({"error": "Account not found"}, status=404)

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
#  📝 REGISTER NEW VOLUNTEER
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
                account_data = request.data.get('account', {})
                volunteer_data = request.data.get('volunteer', {})
                contact_data = request.data.get('contact', {})
                address_data = request.data.get('address', {})
                background_data = request.data.get('background', {})
                emergency_data = request.data.get('emergency_contact', {})
                affiliation_data = request.data.get('affiliation_data', {})

                email = account_data.get('email', '').strip()
                password = account_data.get('password', '')

                # Validation
                if not email:
                    errors['email'] = 'Email is required'
                if not password:
                    errors['password'] = 'Password is required'
                else:
                    try:
                        validate_password(password)
                    except DjangoValidationError as e:
                        errors['password'] = list(e.messages)

                if email and VolunteerAccount.objects.filter(email=email).exists():
                    errors['email'] = 'This email is already registered'

                if not volunteer_data.get('first_name'):
                    errors['first_name'] = 'First name is required'
                if not volunteer_data.get('last_name'):
                    errors['last_name'] = 'Last name is required'
                if not volunteer_data.get('affiliation_type'):
                    errors['affiliation_type'] = 'Affiliation type is required'

                if errors:
                    return Response({"errors": errors}, status=400)

                # Create volunteer
                volunteer = Volunteer.objects.create(
                    first_name=volunteer_data.get('first_name', '').strip(),
                    middle_name=volunteer_data.get('middle_name', '').strip(),
                    last_name=volunteer_data.get('last_name', '').strip(),
                    nickname=volunteer_data.get('nickname', '').strip(),
                    sex=volunteer_data.get('sex', ''),
                    birthdate=volunteer_data.get('birthdate'),
                    affiliation_type=volunteer_data.get('affiliation_type', '').upper()
                )

                VolunteerAccount.objects.create(
                    volunteer=volunteer,
                    email=email,
                    password=make_password(password)
                )

                if contact_data:
                    VolunteerContact.objects.create(
                        volunteer=volunteer,
                        mobile_number=contact_data.get('mobile_number', ''),
                        facebook_link=contact_data.get('facebook_link', '')
                    )

                if address_data:
                    VolunteerAddress.objects.create(
                        volunteer=volunteer,
                        street_address=address_data.get('street_address', ''),
                        province=address_data.get('province', ''),
                        region=address_data.get('region', '')
                    )

                if background_data:
                    VolunteerBackground.objects.create(
                        volunteer=volunteer,
                        occupation=background_data.get('occupation', ''),
                        org_affiliation=background_data.get('org_affiliation', ''),
                        hobbies_interests=background_data.get('hobbies_interests', '')
                    )

                if emergency_data:
                    EmergencyContact.objects.create(
                        volunteer=volunteer,
                        name=emergency_data.get('name', ''),
                        relationship=emergency_data.get('relationship', ''),
                        contact_number=emergency_data.get('contact_number', ''),
                        address=emergency_data.get('address', '')
                    )

                # Affiliation-specific
                aff = volunteer.affiliation_type

                if aff == 'STUDENT':
                    StudentProfile.objects.create(
                        volunteer=volunteer,
                        degree_program=affiliation_data.get('degree_program', ''),
                        year_level=affiliation_data.get('year_level', ''),
                        college=affiliation_data.get('college', ''),
                        department=affiliation_data.get('department', '')
                    )
                elif aff == 'ALUMNI':
                    AlumniProfile.objects.create(
                        volunteer=volunteer,
                        constituent_unit=affiliation_data.get('constituent_unit', ''),
                        degree_program=affiliation_data.get('degree_program', ''),
                        year_graduated=affiliation_data.get('year_graduated', '')
                    )
                elif aff == 'UP STAFF':
                    StaffProfile.objects.create(
                        volunteer=volunteer,
                        office_department=affiliation_data.get('office_department', ''),
                        designation=affiliation_data.get('designation', '')
                    )
                elif aff == 'FACULTY':
                    FacultyProfile.objects.create(
                        volunteer=volunteer,
                        college=affiliation_data.get('college', ''),
                        department=affiliation_data.get('department', '')
                    )
                elif aff == 'RETIREE':
                    RetireeProfile.objects.create(
                        volunteer=volunteer,
                        designation_while_in_up=affiliation_data.get('designation_while_in_up', ''),
                        office_college_department=affiliation_data.get('office_college_department', '')
                    )

                return Response({
                    "message": "Registration successful! You may now log in.",
                    "volunteer_id": volunteer.volunteer_id
                }, status=201)

        except Exception as e:
            print("REGISTER ERROR:", traceback.format_exc())
            return Response({"error": str(e)}, status=500)
