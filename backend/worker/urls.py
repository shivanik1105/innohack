from django.urls import path
from . import views

urlpatterns = [
    # Test endpoint (put at top for easy access)
    path('test-ocr/', views.test_ocr_endpoint, name='test_ocr_endpoint'),

    # User-specific endpoints
    path('users/<str:uid>/profile/', views.user_profile_view, name='user_profile_view'),
    path('users/<str:uid>/upload-certificate/', views.upload_certificate, name='upload_certificate'),
    path('users/<str:uid>/certificates/', views.get_user_certificates, name='get_user_certificates'),
    path('users/<str:uid>/save-course-certificate/', views.save_course_certificate, name='save_course_certificate'),
    path('users/<str:uid>/upload-portfolio/', views.upload_portfolio, name='upload_portfolio'),
    path('users/<str:uid>/certifications/', views.certification_view, name='certification_view'),
    path('users/<str:uid>/portfolio/', views.portfolio_view, name='portfolio_view'),
    path('users/<str:uid>/work-history/', views.work_history_view, name='work_history_view'),
    path('users/<str:uid>/notifications/', views.get_notifications, name='get_notifications'),
    path('users/<str:uid>/notifications/mark-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    path('users/<str:uid>/notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('users/<str:uid>/payment-log/', views.payment_log_view, name='payment_log_view'),

    # Legacy endpoints (keeping for backward compatibility)
    path('profile/<str:uid>/', views.user_profile_view, name='user_profile_view_legacy'),
    path('certifications/<str:uid>/', views.certification_view, name='certification_view_legacy'),
    path('portfolio/<str:uid>/', views.portfolio_view, name='portfolio_view_legacy'),
    path('work-history/<str:uid>/', views.work_history_view, name='work_history_view_legacy'),
    path('upload-certificate/<str:uid>/', views.upload_certificate, name='upload_certificate_legacy'),
    path('upload-portfolio/<str:uid>/', views.upload_portfolio, name='upload_portfolio_legacy'),
    path('notifications/<str:uid>/', views.get_notifications, name='get_notifications_legacy'),
    path('notifications/<str:uid>/mark-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read_legacy'),
    path('notifications/<str:uid>/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read_legacy'),
    path('payment-log/<str:uid>/', views.payment_log_view, name='payment_log_view_legacy'),

    # General endpoints
    path('jobs/', views.get_jobs, name='get_jobs'),
    path('jobs/recommendations/<str:uid>/', views.get_job_recommendations, name='get_job_recommendations'),
    path('jobs/suggest-wage/', views.suggest_wage, name='suggest_wage'),
    path('verify-certificate/<str:uid>/', views.verify_certificate_ocr, name='verify_certificate_ocr'),
    path('rate-worker/<str:worker_uid>/', views.submit_rating, name='submit_rating'),
    path('auth/send-otp/', views.send_otp, name='send_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('register-worker/', views.register_worker, name='register_worker'),
    path('verify-aadhaar/', views.verify_aadhaar_card, name='verify_aadhaar'),
]
