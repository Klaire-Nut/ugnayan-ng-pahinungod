# backend/volunteers/admin.py
from django.contrib import admin
from .models import Volunteer

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    # Display fields in the list view
    #list_display = [
     #   'email', 'first_name', 'last_name', 'affiliation', 
      #  'is_verified', 'created_at'
    #]
    
    # Filters in the sidebar
    #list_filter = [
    #    'affiliation', 'is_verified', 'sex', 'created_at'
    #]
    
    # Fields searchable in the admin search box
    search_fields = [
        'email', 'first_name', 'last_name', 'facebook_link', 'nickname'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    # Field groups for editing a volunteer
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
            'fields': ('street_barangay', 'city_municipality', 'province', 'region')
        }),
        ('UP Address', {
            'fields': ('same_as_permanent', 'up_street_barangay', 
                       'up_city_municipality', 'up_province', 'up_region')
        }),
        ('Affiliation', {'fields': ('affiliation',)}),
        ('Student Information', {
            'fields': (
                'degree_program', 'year_level', 'college', 'shs_type',
                'grad_bachelors', 'first_college', 'first_grad', 'first_up'
            ),
            'classes': ('collapse',)
        }),
        ('Emergency Contact', {
            'fields': ('emer_name', 'emer_relation', 'emer_contact', 'emer_address'),
            'classes': ('collapse',)
        }),
        ('Faculty Information', {'fields': ('faculty_dept',), 'classes': ('collapse',)}),
        ('Alumni Information', {
            'fields': ('constituent_unit', 'alumni_degree', 'year_grad',
                       'first_grad_college', 'first_grad_up', 'occupation'),
            'classes': ('collapse',)
        }),
        ('Retiree Information', {'fields': ('retire_designation', 'retire_office'), 'classes': ('collapse',)}),
        ('Staff Information', {'fields': ('staff_office', 'staff_position'), 'classes': ('collapse',)}),
        ('Program Preferences', {
            'fields': ('volunteer_programs', 'affirmative_action_subjects',
                       'volunteer_status', 'tagapag_ugnay', 'other_organization',
                       'organization_name', 'how_did_you_hear')
        }),
        ('Metadata', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs

