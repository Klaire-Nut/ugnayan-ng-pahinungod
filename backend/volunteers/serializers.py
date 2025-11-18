# backend/volunteers/serializers.py
from rest_framework import serializers
from .models import Volunteer, OTPVerification
from datetime import datetime, timedelta
import random
import string

class VolunteerSerializer(serializers.ModelSerializer):
    """Serializer for Volunteer model"""
    
    class Meta:
        model = Volunteer
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_verified']
    
    def validate_email(self, value):
        """Ensure email is valid"""
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value.lower()
    
    def validate_data_consent(self, value):
        """Ensure user has consented"""
        if not value:
            raise serializers.ValidationError("You must consent to data collection.")
        return value
    
    def validate(self, data):
        """Custom validation based on affiliation"""
        affiliation = data.get('affiliation')
        
        # Validate STUDENT fields
        if affiliation == 'STUDENT':
            required_fields = ['degree_program', 'year_level', 'college', 'first_up']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for students."})
            
            # Emergency contact required for students
            emergency_fields = ['emer_name', 'emer_relation', 'emer_contact', 'emer_address']
            for field in emergency_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for students."})
        
        # Validate FACULTY fields
        elif affiliation == 'FACULTY':
            if not data.get('faculty_dept'):
                raise serializers.ValidationError({'faculty_dept': 'Department is required for faculty.'})
        
        # Validate ALUMNI fields
        elif affiliation == 'ALUMNI':
            required_fields = ['constituent_unit', 'alumni_degree', 'year_grad']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for alumni."})
        
        # Validate RETIREE fields
        elif affiliation == 'RETIREE':
            required_fields = ['retire_designation', 'retire_office']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for retirees."})
        
        # Validate STAFF fields
        elif affiliation == 'UP STAFF':
            required_fields = ['staff_office', 'staff_position']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for staff."})
        
        return data


class OTPSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    
    def validate_otp_code(self, value):
        """Ensure OTP is 6 digits"""
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value


class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP"""
    email = serializers.EmailField()
    
    def create(self, validated_data):
        """Generate and save OTP"""
        email = validated_data['email']
        
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Set expiry to 10 minutes from now
        expires_at = datetime.now() + timedelta(minutes=10)
        
        # Create OTP record
        otp = OTPVerification.objects.create(
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )
        
        return otp