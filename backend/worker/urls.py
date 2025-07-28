from django.urls import path
from . import views

urlpatterns = [
    path('auth/send-otp/', views.send_otp_2factor, name='send_otp_2factor'),
    path('auth/verify-otp/', views.verify_otp_2factor, name='verify_otp_2factor'),
    path('profile/<str:uid>/', views.user_profile_view, name='user_profile_view'),
    path('jobs/', views.get_jobs, name='get_jobs'),
    path('jobs/recommendations/<str:uid>/', views.get_job_recommendations, name='get_job_recommendations'),
    path('jobs/suggest-wage/', views.suggest_wage, name='suggest_wage'),
    path('verify-certificate/<str:uid>/', views.verify_certificate_ocr, name='verify_certificate_ocr'),
    path('rate-worker/<str:worker_uid>/', views.submit_rating, name='submit_rating'),
    path('payment-log/<str:uid>/', views.payment_log_view, name='payment_log_view'),
]
