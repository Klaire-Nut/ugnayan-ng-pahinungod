# ------- ADMIN SERIALIZERS ----------
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    StudentProfile,
    AlumniProfile,
    StaffProfile,
    FacultyProfile,
    RetireeProfile,
    VolunteerEvent
)
from django.contrib.auth import get_user_model

# Admin Dashboard for Managing Volunteers for Viewing of the Volunteers Data only (Fetching data and filtering)
class AdminVolunteerListSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    volunteer_identifier = serializers.CharField(read_only=True)

    class Meta:
        model = Volunteer
        fields = [
            "volunteer_id",
            "volunteer_identifier",
            "full_name",
            "email",
            "affiliation_type",
            "date_joined",
            "status",
            "total_hours",
        ]

    def get_email(self, obj):
        # get first related account's email (if any)
        account = getattr(obj, 'accounts').first()
        return account.email if account else ""

    def get_full_name(self, obj):
        parts = [obj.first_name or "", obj.middle_name or "", obj.last_name or ""]
        # join and strip extra spaces
        return " ".join(p for p in parts if p).strip()


# Volunteer Management for Full Detail View and Editing
class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = "__all__"

class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = "__all__"

class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = "__all__"

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = "__all__"

class VolunteerAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]

    def validate_email(self, value):
        # If updating, allow the same email for the current account
        account_pk = getattr(self.instance, 'pk', None)
        if VolunteerAccount.objects.filter(email=value).exclude(pk=account_pk).exists():
            raise serializers.ValidationError("Volunteer account with this email already exists.")
        return value

# Affiliation profiles - make them optional
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = "__all__"

class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = "__all__"

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = "__all__"

class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = "__all__"

class RetireeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetireeProfile
        fields = "__all__"

# Main serializer for admin
class AdminVolunteerDetailSerializer(serializers.ModelSerializer):
    contacts = VolunteerContactSerializer(many=True, required=False)
    addresses = VolunteerAddressSerializer(many=True, required=False)
    backgrounds = VolunteerBackgroundSerializer(many=True, required=False)
    emergency_contacts = EmergencyContactSerializer(many=True, required=False)
    accounts = VolunteerAccountSerializer(many=True, required=False)
    student_profile = StudentProfileSerializer(required=False, allow_null=True)
    alumni_profile = AlumniProfileSerializer(required=False, allow_null=True)
    staff_profile = StaffProfileSerializer(required=False, allow_null=True)
    faculty_profile = FacultyProfileSerializer(required=False, allow_null=True)
    retiree_profile = RetireeProfileSerializer(required=False, allow_null=True)

    volunteer_identifier = serializers.CharField(read_only=True)
    
    class Meta:
        model = Volunteer
        fields = "__all__"

    def update(self, instance, validated_data):
        # Nested data
        contacts_data = validated_data.pop("contacts", [])
        addresses_data = validated_data.pop("addresses", [])
        backgrounds_data = validated_data.pop("backgrounds", [])
        emergency_data = validated_data.pop("emergency_contacts", [])
        accounts_data = validated_data.pop("accounts", [])

        # Update main Volunteer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested contacts
        for contact in contacts_data:
            obj = VolunteerContact.objects.get(pk=contact.get('contact_id'))
            for attr, value in contact.items():
                setattr(obj, attr, value)
            obj.save()

        # Update addresses
        for addr in addresses_data:
            obj = VolunteerAddress.objects.get(pk=addr.get('address_id'))
            for attr, value in addr.items():
                setattr(obj, attr, value)
            obj.save()

        # Update backgrounds
        for bg in backgrounds_data:
            obj = VolunteerBackground.objects.get(pk=bg.get('background_id'))
            for attr, value in bg.items():
                setattr(obj, attr, value)
            obj.save()

        # Update emergency contacts
        for em in emergency_data:
            obj = EmergencyContact.objects.get(pk=em.get('contact_id'))
            for attr, value in em.items():
                setattr(obj, attr, value)
            obj.save()

        # Update accounts
        for acc in accounts_data:
            obj = VolunteerAccount.objects.get(pk=acc.get('id') or acc.get('account_id'))
            for attr, value in acc.items():
                if attr == "password":
                    value = make_password(value)
                setattr(obj, attr, value)
            obj.save()

        # Update optional affiliation profiles
        for profile_name in ['student_profile', 'alumni_profile', 'staff_profile', 'faculty_profile', 'retiree_profile']:
            profile_data = self.initial_data.get(profile_name)
            if profile_data and hasattr(instance, profile_name):
                profile_obj = getattr(instance, profile_name)
                if profile_obj:
                    for attr, value in profile_data.items():
                        setattr(profile_obj, attr, value)
                    profile_obj.save()

        return instance

# Admin Account Credentials 
User = get_user_model()  

class AdminProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    
    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance
    
class VolunteerEventHistorySerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.event_name")
    date = serializers.SerializerMethodField()
    timeIn = serializers.SerializerMethodField()
    timeOut = serializers.SerializerMethodField()
    timeAllotted = serializers.IntegerField(source="hours_rendered")

    class Meta:
        model = VolunteerEvent
        fields = ["event_name", "date", "timeIn", "timeOut", "timeAllotted"]

    def get_date(self, obj):
        if obj.schedule:
            return obj.schedule.day.strftime("%Y-%m-%d")
        elif obj.event:
            return obj.event.date_start.strftime("%Y-%m-%d")
        return "TBD"

    def get_timeIn(self, obj):
        if obj.schedule:
            return obj.schedule.start_time.strftime("%H:%M")
        elif obj.event:
            return obj.event.date_start.strftime("%H:%M")
        return "TBD"

    def get_timeOut(self, obj):
        if obj.schedule:
            return obj.schedule.end_time.strftime("%H:%M")
        elif obj.event:
            return obj.event.date_end.strftime("%H:%M")
        return "TBD"