# backend/volunteers/serializers.py

from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from core.utils import generate_volunteer_identifier
from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile,
    Event, VolunteerEvent, VolunteerMeta,
)

# -----------------------------
# Basic Nested Serializers
# -----------------------------
class VolunteerAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]

    def validate_email(self, value):
        # Prevent duplicates
        if self.instance is None and VolunteerAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError("A volunteer with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return VolunteerAccount.objects.create(**validated_data)


class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ["mobile_number", "facebook_link"]


class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ["street_address", "province", "region"]


class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    # IMPORTANT: core.VolunteerBackground has NO 'occupation'
    class Meta:
        model = VolunteerBackground
        fields = ["org_affiliation", "hobbies_interests"]


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]

# -----------------------------
# Affiliation Profile Serializers
# -----------------------------
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["degree_program", "year_level", "college"]


class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = ["constituent_unit", "degree_program", "year_graduated"]


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["office_department", "designation"]


class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = ["college", "department"]


class RetireeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetireeProfile
        fields = ["designation_while_in_up", "office_college_department"]


class VolunteerMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerMeta
        fields = [
            "volunteer_status",
            "tagapag_ugnay",
            "other_organization",
            "organization_name",
            "affirmative_action_subjects",
            "how_did_you_hear",
        ]

# -----------------------------
# Volunteer Registration
# -----------------------------
class VolunteerRegistrationSerializer(serializers.Serializer):
    # Main fields
    first_name = serializers.CharField()
    middle_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.CharField()
    birthdate = serializers.DateField()
    affiliation_type = serializers.CharField()

    # Related models
    account = VolunteerAccountSerializer()
    contact = VolunteerContactSerializer()
    address = VolunteerAddressSerializer()
    background = VolunteerBackgroundSerializer()
    emergency_contact = EmergencyContactSerializer()

    # Optional affiliation profile (only one will be created)
    student_profile = StudentProfileSerializer(required=False)
    alumni_profile = AlumniProfileSerializer(required=False)
    staff_profile = StaffProfileSerializer(required=False)
    faculty_profile = FacultyProfileSerializer(required=False)
    retiree_profile = RetireeProfileSerializer(required=False)

    program_interests = serializers.ListField(child=serializers.CharField(), required=False)
    meta = VolunteerMetaSerializer(required=False)

    def create(self, validated_data):
        account_data = validated_data.pop("account")
        contact_data = validated_data.pop("contact")
        address_data = validated_data.pop("address")
        background_data = validated_data.pop("background")
        emergency_data = validated_data.pop("emergency_contact")

        student_data = validated_data.pop("student_profile", None)
        alumni_data = validated_data.pop("alumni_profile", None)
        staff_data = validated_data.pop("staff_profile", None)
        faculty_data = validated_data.pop("faculty_profile", None)
        retiree_data = validated_data.pop("retiree_profile", None)

        program_interests = validated_data.pop("program_interests", [])
        meta_data = validated_data.pop("meta", None)

        validated_data["volunteer_identifier"] = generate_volunteer_identifier()

        with transaction.atomic():
            # Create main volunteer
            volunteer = Volunteer.objects.create(**validated_data)

            # Related tables
            VolunteerAccount.objects.create(
                volunteer=volunteer,
                email=account_data["email"],
                password=make_password(account_data["password"])
            )

            VolunteerContact.objects.create(volunteer=volunteer, **contact_data)
            VolunteerAddress.objects.create(volunteer=volunteer, **address_data)

            # Sanitize background input
            VolunteerBackground.objects.create(
                volunteer=volunteer,
                org_affiliation=background_data.get("org_affiliation"),
                hobbies_interests=background_data.get("hobbies_interests"),
            )

            EmergencyContact.objects.create(volunteer=volunteer, **emergency_data)

            # Affiliation type → create ONE profile
            type_lower = validated_data["affiliation_type"].lower()

            if type_lower == "student" and student_data:
                StudentProfile.objects.create(volunteer=volunteer, **student_data)
            elif type_lower == "alumni" and alumni_data:
                AlumniProfile.objects.create(volunteer=volunteer, **alumni_data)
            elif type_lower == "staff" and staff_data:
                StaffProfile.objects.create(volunteer=volunteer, **staff_data)
            elif type_lower == "faculty" and faculty_data:
                FacultyProfile.objects.create(volunteer=volunteer, **faculty_data)
            elif type_lower == "retiree" and retiree_data:
                RetireeProfile.objects.create(volunteer=volunteer, **retiree_data)

            # Program interests
            for p in program_interests:
                ProgramInterest.objects.create(volunteer=volunteer, program_name=p)

            # Meta
            if meta_data:
                VolunteerMeta.objects.create(volunteer=volunteer, **meta_data)

        return volunteer

# -----------------------------
# Volunteer Main Serializer (GET)
# -----------------------------
class VolunteerSerializer(serializers.ModelSerializer):
    accounts = VolunteerAccountSerializer(many=True, read_only=True)
    contacts = VolunteerContactSerializer(many=True, read_only=True)
    addresses = VolunteerAddressSerializer(many=True, read_only=True)
    backgrounds = VolunteerBackgroundSerializer(many=True, read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    program_interests = serializers.SerializerMethodField()
    meta = VolunteerMetaSerializer(read_only=True)

    student_profile = StudentProfileSerializer(read_only=True)
    alumni_profile = AlumniProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    faculty_profile = FacultyProfileSerializer(read_only=True)
    retiree_profile = RetireeProfileSerializer(read_only=True)

    affiliation_data = serializers.SerializerMethodField()

    class Meta:
        model = Volunteer
        fields = [
            "volunteer_id",
            "volunteer_identifier",
            "first_name",
            "middle_name",
            "last_name",
            "nickname",
            "sex",
            "birthdate",
            "affiliation_type",
            "accounts",
            "contacts",
            "addresses",
            "backgrounds",
            "emergency_contacts",
            "program_interests",
            "meta",
            "student_profile",
            "alumni_profile",
            "staff_profile",
            "faculty_profile",
            "retiree_profile",
            "affiliation_data",
        ]

    def get_program_interests(self, obj):
        return [p.program_name for p in obj.program_interests.all()]

    def get_affiliation_data(self, obj):
        output = []

        # STUDENT
        if hasattr(obj, "student_profile"):
            sp = obj.student_profile
            output.append({
                "type": "STUDENT",
                "degree_program": sp.degree_program,
                "year_level": sp.year_level,
                "college": sp.college,
            })

        # ALUMNI
        if hasattr(obj, "alumni_profile"):
            ap = obj.alumni_profile
            output.append({
                "type": "ALUMNI",
                "constituent_unit": ap.constituent_unit,
                "degree_program": ap.degree_program,
                "year_graduated": ap.year_graduated,
            })

        # STAFF
        if hasattr(obj, "staff_profile"):
            st = obj.staff_profile
            output.append({
                "type": "UP STAFF",
                "office_department": st.office_department,
                "designation": st.designation,
            })

        # FACULTY
        if hasattr(obj, "faculty_profile"):
            fp = obj.faculty_profile
            output.append({
                "type": "FACULTY",
                "college": fp.college,
                "department": fp.department,
            })

        # RETIREE
        if hasattr(obj, "retiree_profile"):
            rp = obj.retiree_profile
            output.append({
                "type": "RETIREE",
                "designation_while_in_up": rp.designation_while_in_up,
                "office_college_department": rp.office_college_department,
            })

        return output
