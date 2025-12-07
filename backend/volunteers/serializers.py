import importlib
import importlib.util
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.utils import generate_volunteer_identifier
from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile,
    Event, VolunteerEvent, Admin
)

# ---------------------------------------------------------------------
#  PROFILE SERIALIZERS (Affiliation-dependent)
# ---------------------------------------------------------------------

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "degree_program",
            "year_level",
            "college",
            "department",
        ]


class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = [
            "constituent_unit",
            "degree_program",
            "year_graduated",
        ]


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = [
            "office_department",
            "designation",
        ]


class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = [
            "college",
            "department",
        ]


class RetireeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetireeProfile
        fields = [
            "designation_while_in_up",
            "office_college_department",
        ]


# ---------------------------------------------------------------------
#  VOLUNTEER SERIALIZER (includes dynamic profile data)
# ---------------------------------------------------------------------

class VolunteerSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    alumni_profile = AlumniProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    faculty_profile = FacultyProfileSerializer(read_only=True)
    retiree_profile = RetireeProfileSerializer(read_only=True)

    class Meta:
        model = Volunteer
        fields = [
            "volunteer_id",
            "first_name",
            "middle_name",
            "last_name",
            "nickname",
            "sex",
            "birthdate",
            "affiliation_type",
            "status",
            "total_hours",

            # profile attachments
            "student_profile",
            "alumni_profile",
            "staff_profile",
            "faculty_profile",
            "retiree_profile",
        ]


# ---------------------------------------------------------------------
#  VOLUNTEER ACCOUNT SERIALIZER
# ---------------------------------------------------------------------

class VolunteerAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]

    def validate_email(self, value):
        if VolunteerAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError("A volunteer with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return VolunteerAccount.objects.create(**validated_data)


# ---------------------------------------------------------------------
#  BASIC SUB-PROFILE SERIALIZERS
# ---------------------------------------------------------------------

class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ["mobile_number", "facebook_link"]


class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ["street_address", "province", "region"]


class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ["occupation", "org_affiliation", "hobbies_interests"]


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]

    def validate(self, attrs):
        volunteer = self.context.get("volunteer")

        if volunteer and volunteer.affiliation_type == "student":
            required = ["name", "relationship", "contact_number", "address"]
            missing = [f for f in required if not attrs.get(f)]

            if missing:
                raise serializers.ValidationError(
                    {field: "This field is required for students." for field in missing}
                )

        return attrs


# ---------------------------------------------------------------------
#  ADMIN SERIALIZER
# ---------------------------------------------------------------------

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ["admin_id", "username"]
        read_only_fields = ["admin_id"]


# ---------------------------------------------------------------------
#  EVENT SERIALIZERS
# ---------------------------------------------------------------------

class EventListSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
            "available_slots",
            "is_full",
        ]

    def get_available_slots(self, obj):
        joined_count = VolunteerEvent.objects.filter(
            event=obj, status__in=["Joined", "Completed"]
        ).count()
        return obj.max_participants - joined_count

    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0


class EventDetailSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    total_volunteers = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
            "available_slots",
            "is_full",
            "total_volunteers",
        ]

    def get_total_volunteers(self, obj):
        return VolunteerEvent.objects.filter(
            event=obj, status__in=["Joined", "Completed"]
        ).count()

    def get_available_slots(self, obj):
        return obj.max_participants - self.get_total_volunteers(obj)

    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
        ]
        read_only_fields = ["event_id"]

    def validate(self, data):
        if (
            data.get("date_start")
            and data.get("date_end")
            and data["date_end"] <= data["date_start"]
        ):
            raise serializers.ValidationError("End date must be after start date")

        if data.get("max_participants", 0) <= 0:
            raise serializers.ValidationError(
                "Maximum participants must be greater than 0"
            )

        return data


# ---------------------------------------------------------------------
#  VOLUNTEER-EVENT SERIALIZERS
# ---------------------------------------------------------------------

class VolunteerEventBaseSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.SerializerMethodField()
    event_name = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = [
            "id",
            "volunteer",
            "volunteer_name",
            "event",
            "event_name",
            "availability_time",
            "availability_orientation",
            "status",
            "hours_rendered",
            "signup_date",
        ]

    def get_volunteer_name(self, obj):
        return f"{obj.volunteer.first_name} {obj.volunteer.last_name}"

    def get_event_name(self, obj):
        return obj.event.event_name


class VolunteerEventJoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerEvent
        fields = ["event", "availability_time", "availability_orientation"]

    def validate(self, data):
        volunteer = self.context["volunteer"]
        event = data["event"]

        # Prevent double join
        if VolunteerEvent.objects.filter(volunteer=volunteer, event=event).exists():
            raise serializers.ValidationError("You have already joined this event")

        # Check if full
        total = VolunteerEvent.objects.filter(
            event=event, status__in=["Joined", "Completed"]
        ).count()

        if total >= event.max_participants:
            raise serializers.ValidationError("This event is already full")
        
        

        return data

    def create(self, validated_data):
        validated_data["volunteer"] = self.context["volunteer"]
        validated_data["status"] = "Joined"
        return super().create(validated_data)


class EventVolunteersSerializer(serializers.ModelSerializer):
    volunteer_info = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = [
            "volunteer",
            "volunteer_info",
            "hours_rendered",
            "status",
            "availability_time",
            "availability_orientation",
            "signup_date",
        ]

    def get_volunteer_info(self, obj):
        v = obj.volunteer
        return {
            "volunteer_id": v.volunteer_id,
            "name": f"{v.first_name} {v.last_name}",
            "email": v.accounts.first().email if v.accounts.exists() else None,
            "mobile": v.contacts.first().mobile_number if v.contacts.exists() else None,
        }


class VolunteerRegistrationSerializer(serializers.Serializer):
    # --- Main volunteer fields ---
    first_name = serializers.CharField()
    middle_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.CharField()
    birthdate = serializers.DateField()
    affiliation_type = serializers.CharField()

    # --- Nested serializers ---
    account = VolunteerAccountSerializer()
    contact = VolunteerContactSerializer()
    address = VolunteerAddressSerializer()
    background = VolunteerBackgroundSerializer()
    emergency_contact = EmergencyContactSerializer()   # FIXED NAME

    # --- Affiliation profiles ---
    student_profile = StudentProfileSerializer(required=False)
    alumni_profile = AlumniProfileSerializer(required=False)
    staff_profile = StaffProfileSerializer(required=False)
    faculty_profile = FacultyProfileSerializer(required=False)
    retiree_profile = RetireeProfileSerializer(required=False)

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password

        # Pop nested data
        account_data = validated_data.pop("account")
        contact_data = validated_data.pop("contact")
        address_data = validated_data.pop("address")
        background_data = validated_data.pop("background")
        emergency_data = validated_data.pop("emergency_contact")  # FIXED KEY

        student_data = validated_data.pop("student_profile", None)
        alumni_data = validated_data.pop("alumni_profile", None)
        staff_data = validated_data.pop("staff_profile", None)
        faculty_data = validated_data.pop("faculty_profile", None)
        retiree_data = validated_data.pop("retiree_profile", None)

        # Generate unique volunteer identifier
        validated_data["volunteer_identifier"] = generate_volunteer_identifier()
        
        # Create main volunteer
        volunteer = Volunteer.objects.create(**validated_data)

        # Create related tables
        account_data["password"] = make_password(account_data["password"])
        VolunteerAccount.objects.create(volunteer=volunteer, **account_data)

        VolunteerContact.objects.create(volunteer=volunteer, **contact_data)
        VolunteerAddress.objects.create(volunteer=volunteer, **address_data)
        VolunteerBackground.objects.create(volunteer=volunteer, **background_data)
        EmergencyContact.objects.create(volunteer=volunteer, **emergency_data)

        # Save affiliation profile
        aff_type = validated_data["affiliation_type"].lower()

        if aff_type == "student" and student_data:
            StudentProfile.objects.create(volunteer=volunteer, **student_data)

        elif aff_type == "alumni" and alumni_data:
            AlumniProfile.objects.create(volunteer=volunteer, **alumni_data)

        elif aff_type == "staff" and staff_data:
            StaffProfile.objects.create(volunteer=volunteer, **staff_data)

        elif aff_type == "faculty" and faculty_data:
            FacultyProfile.objects.create(volunteer=volunteer, **faculty_data)

        elif aff_type == "retiree" and retiree_data:
            RetireeProfile.objects.create(volunteer=volunteer, **retiree_data)

        return volunteer
