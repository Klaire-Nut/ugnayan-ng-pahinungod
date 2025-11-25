from rest_framework import serializers
from django.contrib.auth.hashers import make_password
#from core.models import Affiliation
from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    #VolunteerEducation,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    #VolunteerAffiliation
)

class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = [
            "first_name", "middle_name", "last_name",
            "nickname", "sex", "birthdate"
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
        # volunteer is injected from view using save(volunteer=volunteer)
        return VolunteerAccount.objects.create(**validated_data)

class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ['mobile_number', 'facebook_link']

class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ['street_address', 'province', 'region']

#class VolunteerEducationSerializer(serializers.ModelSerializer):
 #   degree_program = serializers.CharField(required=False, allow_blank=True)
  #  year_level = serializers.CharField(required=False, allow_blank=True)
   # college = serializers.CharField(required=False, allow_blank=True)
    #department = serializers.CharField(required=False, allow_blank=True)
    #year_graduated = serializers.CharField(required=False, allow_blank=True)

    #class Meta:
     #   model = VolunteerEducation
      #  fields = ['degree_program', 'year_level', 'college', #'department', 'year_graduated']

class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ['occupation', 'org_affiliation', 'hobbies_interests']

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['name', 'relationship', 'contact_number', 'address']

#class VolunteerAffiliationSerializer(serializers.ModelSerializer):
 #   affiliation = serializers.CharField()

  #  class Meta:
   #     model = VolunteerAffiliation
    #    fields = ['affiliation']

    #def create(self, validated_data):
     #   volunteer = self.context['volunteer']
      #  name = validated_data['affiliation']
        # get or create affiliation
       # affiliation_obj, _ = Affiliation.objects.get_or_create(affiliation_name=name)
        #return VolunteerAffiliation.objects.create(volunteer=volunteer, affiliation=affiliation_obj)

