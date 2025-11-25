from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
)


# ----------------- Volunteer -----------------
class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = [
            "first_name",
            "middle_name",
            "last_name",
            "nickname",
            "sex",
            "birthdate",
            "affiliation_type",
        ]


# ----------------- Account -----------------
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


# ----------------- Contact -----------------
class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ["mobile_number", "facebook_link"]


# ----------------- Address -----------------
class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ["street_address", "province", "region"]


# ----------------- Background -----------------
class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ["occupation", "org_affiliation", "hobbies_interests"]


# ----------------- Emergency Contact -----------------
class EmergencyContactSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    relationship = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]

    def validate(self, attrs):
        volunteer = self.context.get("volunteer")
        if volunteer and volunteer.affiliation_type.lower() == "student":
            missing_fields = [
                f for f in ["name", "relationship", "contact_number", "address"]
                if not attrs.get(f)
            ]
            if missing_fields:
                raise serializers.ValidationError(
                    {f: "This field is required for students." for f in missing_fields}
                )
        return attrs
