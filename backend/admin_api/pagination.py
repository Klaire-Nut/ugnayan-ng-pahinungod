# backend/volunteers/pagination.py
from rest_framework.pagination import PageNumberPagination

class VolunteerListPagination(PageNumberPagination):
    page_size = 15                # fixed 15 rows per page
    page_size_query_param = None  # disable client override for now
    max_page_size = 100
