from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile
)
from django.db import IntegrityError

# ============================================================
# BASIC SUB-SERIALIZERS
# ============================================================

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ["mobile_number", "facebook_link"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ["street_address", "province", "region"]


class BackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ["occupation", "org_affiliation", "hobbies_interests"]


class EmergencySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]


# ============================================================
# AFFILIATION PROFILE SERIALIZERS
# ============================================================

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["degree_program", "year_level", "college", "department"]


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


# ============================================================
# ACCOUNT SERIALIZER
# ============================================================

class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]


# ============================================================
# MAIN REGISTRATION SERIALIZER (the fixed clean version)
# ============================================================

class RegisterVolunteerSerializer(serializers.Serializer):

    # ---------- ACCOUNT ----------
    account = AccountSerializer()

    # ---------- MAIN VOLUNTEER ----------
    first_name = serializers.CharField()
    middle_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.CharField()
    birthdate = serializers.DateField()
    affiliation_type = serializers.CharField()

    # ---------- SUB-TABLES ----------
    contact = ContactSerializer()
    address = AddressSerializer()
    background = BackgroundSerializer()
    emergency_contact = EmergencySerializer(required=False)

    # ---------- AFFILIATION PROFILES ----------
    student_profile = StudentProfileSerializer(required=False)
    alumni_profile = AlumniProfileSerializer(required=False)
    staff_profile = StaffProfileSerializer(required=False)
    faculty_profile = FacultyProfileSerializer(required=False)
    retiree_profile = RetireeProfileSerializer(required=False)

    # PROGRAM INTERESTS
    program_interests = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    # ============================================================
    # CREATE METHOD — EVERYTHING SAVED HERE
    # ============================================================

    def create(self, validated_data):

        # Extract nested sections
        account_data = validated_data.pop("account")
        contact_data = validated_data.pop("contact")
        address_data = validated_data.pop("address")
        background_data = validated_data.pop("background")

        emergency_data = validated_data.pop("emergency_contact", None)
        student_data = validated_data.pop("student_profile", None)
        alumni_data = validated_data.pop("alumni_profile", None)
        staff_data = validated_data.pop("staff_profile", None)
        faculty_data = validated_data.pop("faculty_profile", None)
        retiree_data = validated_data.pop("retiree_profile", None)

        program_interests = validated_data.pop("program_interests", [])

        # Normalize affiliation
        affiliation = validated_data.get("affiliation_type", "").lower().replace(" ", "")

        # ---------- CREATE VOLUNTEER ----------
        volunteer = Volunteer.objects.create(
            **validated_data,
            affiliation_type=affiliation
        )

        # ---------- CONTACT ----------
        VolunteerContact.objects.create(volunteer=volunteer, **contact_data)

        # ---------- ADDRESS ----------
        VolunteerAddress.objects.create(volunteer=volunteer, **address_data)

        # ---------- BACKGROUND ----------
        VolunteerBackground.objects.create(volunteer=volunteer, **background_data)

        # ---------- EMERGENCY ----------
        if emergency_data:
            EmergencyContact.objects.create(volunteer=volunteer, **emergency_data)

        # ---------- ACCOUNT ----------
        VolunteerAccount.objects.create(
            volunteer=volunteer,
            email=account_data["email"],
            password=make_password(account_data["password"]),
        )

        # ---------- PROGRAM INTERESTS ----------
        for program in program_interests:
            ProgramInterest.objects.create(volunteer=volunteer, program_name=program)

        # ---------- CREATE CORRECT AFFILIATION PROFILE ----------
        if affiliation == "student" and student_data:
            StudentProfile.objects.create(volunteer=volunteer, **student_data)

        elif affiliation == "alumni" and alumni_data:
            AlumniProfile.objects.create(volunteer=volunteer, **alumni_data)

        elif affiliation == "staff" and staff_data:
            StaffProfile.objects.create(volunteer=volunteer, **staff_data)

        elif affiliation == "faculty" and faculty_data:
            FacultyProfile.objects.create(volunteer=volunteer, **faculty_data)

        elif affiliation == "retiree" and retiree_data:
            RetireeProfile.objects.create(volunteer=volunteer, **retiree_data)

        return volunteer