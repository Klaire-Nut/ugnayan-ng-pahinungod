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

class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = [
            "first_name", "middle_name", "last_name",
            "nickname", "sex", "birthdate", "affiliation_type"
        ]

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
        # Hash password
        validated_data["password"] = make_password(validated_data["password"])
        return VolunteerAccount.objects.create(**validated_data)

class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ['mobile_number', 'facebook_link']

class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ['street_address', 'province', 'region']

class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ['occupation', 'org_affiliation', 'hobbies_interests']

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['name', 'relationship', 'contact_number', 'address']
