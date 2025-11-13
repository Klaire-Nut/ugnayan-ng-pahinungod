from rest_framework import serializers
from .models import Volunteer

class VolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volunteer
        fields = [
            'first_name', 'middle_name', 'last_name', 'nickname', 'sex', 
            'birthdate', 'email', 'password', 'mobile_number', 'facebook_link',
            'street_address', 'province', 'region', 'affiliation', 'degree_program',
            'year_level', 'college', 'department', 'year_graduated', 'occupation',
            'org_affiliation', 'hobbies_interests', 'profile_picture'
        ]
        extra_kwargs = {
            'password': {'write_only': True}  # password is only for input, not returned
        }
