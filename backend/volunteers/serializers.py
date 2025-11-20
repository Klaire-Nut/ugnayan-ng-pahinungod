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
        fields = ['email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ['mobile_number', 'facebook_link']


class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ['street_address', 'province', 'region']


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


class VolunteerAffiliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAffiliation
        fields = ['affiliation']



class VolunteerOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()  # the email you will use to match OTP
    otp = serializers.CharField()     # code entered by user
