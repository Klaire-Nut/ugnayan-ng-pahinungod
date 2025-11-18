# backend/volunteers/admin.py
from django.contrib import admin
from .models import Volunteer, OTPVerification

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'first_name', 'last_name', 'affiliation', 
        'mobile_number', 'is_verified', 'created_at'
    ]
    
    list_filter = [
        'affiliation', 'is_verified', 'age', 'sex', 
        'volunteer_status', 'created_at'
    ]
    
    search_fields = [
        'email', 'first_name', 'last_name', 'mobile_number', 
        'facebook_link', 'nickname'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Email & Consent', {
            'fields': ('email', 'data_consent', 'is_verified')
        }),
        ('Basic Information', {
            'fields': (
                'first_name', 'middle_name', 'last_name', 'nickname',
                'age', 'sex', 'birthdate', 'indigenous_affiliation',
                'mobile_number', 'facebook_link', 'hobbies', 'organizations'
            )
        }),
        ('Permanent Address', {
            'fields': (
                'street_barangay', 'city_municipality', 'province', 'region'
            )
        }),
        ('UP Address', {
            'fields': (
                'same_as_permanent', 'up_street_barangay', 
                'up_city_municipality', 'up_province', 'up_region'
            )
        }),
        ('Affiliation', {
            'fields': ('affiliation',)
        }),
        ('Student Information', {
            'fields': (
                'degree_program', 'year_level', 'college', 'shs_type',
                'grad_bachelors', 'first_college', 'first_grad', 'first_up'
            ),
            'classes': ('collapse',)
        }),
        ('Emergency Contact', {
            'fields': (
                'emer_name', 'emer_relation', 'emer_contact', 'emer_address'
            ),
            'classes': ('collapse',)
        }),
        ('Faculty Information', {
            'fields': ('faculty_dept',),
            'classes': ('collapse',)
        }),
        ('Alumni Information', {
            'fields': (
                'constituent_unit', 'alumni_degree', 'year_grad',
                'first_grad_college', 'first_grad_up', 'occupation'
            ),
            'classes': ('collapse',)
        }),
        ('Retiree Information', {
            'fields': ('retire_designation', 'retire_office'),
            'classes': ('collapse',)
        }),
        ('Staff Information', {
            'fields': ('staff_office', 'staff_position'),
            'classes': ('collapse',)
        }),
        ('Program Preferences', {
            'fields': (
                'volunteer_programs', 'affirmative_action_subjects',
                'volunteer_status', 'tagapag_ugnay', 'other_organization',
                'organization_name', 'how_did_you_hear'
            )
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related()


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp_code', 'is_verified', 'created_at', 'expires_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['email', 'otp_code']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False  # OTPs should only be created via API