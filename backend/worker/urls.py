# In your app's urls.py (e.g., worker/urls.py)
from django.urls import path
from . import views

# This urls.py file matches the function names in your complete views.py
urlpatterns = [
    # --- Authentication ---
    path('api/auth/register-login/', views.register_or_login_user, name='register_or_login_user'),

    # --- User Profile ---
    path('api/profile/<str:uid>/', views.user_profile_view, name='user_profile_view'),
    
    # --- Job Discovery ---
    path('api/jobs/', views.get_jobs, name='get_jobs'),
    path('api/jobs/recommendations/<str:uid>/', views.get_job_recommendations, name='get_job_recommendations'),

    # --- Blue-Collar Features ---
    path('api/verify-certificate/<str:uid>/', views.verify_certificate_ocr, name='verify_certificate_ocr'),
    path('api/rate-worker/<str:worker_uid>/', views.submit_rating, name='submit_rating'),

    # --- Optional Payment Log ---
    path('api/payment-log/<str:uid>/', views.payment_log_view, name='payment_log_view'),
]
