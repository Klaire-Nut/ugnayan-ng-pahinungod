#volunteers/serializers.py
from rest_framework import serializers
from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerEducation,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    VolunteerAffiliation
)
from django.contrib.auth.hashers import make_password


class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = '__all__'


class VolunteerAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAccount
        fields = ['email', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate_email(self, value):
        if VolunteerAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value
    
    def validate_username(self, value):  # ADD THIS
        if VolunteerAccount.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ['mobile_number', 'facebook_link']

    def validate_mobile_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Mobile number is required.")
        return value.strip()


class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ['street_address', 'province', 'region']

    def validate_street_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Street address is required.")
        return value.strip()
    
    def validate_province(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Province is required.")
        return value.strip()
    
    def validate_region(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Region is required.")
        return value.strip()


class VolunteerEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerEducation
        fields = ['degree_program', 'year_level', 'college', 'department', 'year_graduated']


class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ['occupation', 'org_affiliation', 'hobbies_interests']


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['name', 'relationship', 'contact_number', 'address']
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Emergency contact name is required.")
        return value.strip()
    
    def validate_relationship(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Emergency contact relationship is required.")
        return value.strip()
    
    def validate_contact_number(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Emergency contact number is required.")
        return value.strip()
    
    def validate_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Emergency contact address is required.")
        return value.strip()


class VolunteerAffiliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAffiliation
        fields = ['affiliation']



class VolunteerOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()  # the email you will use to match OTP
    otp = serializers.CharField()     # code entered by user

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value
