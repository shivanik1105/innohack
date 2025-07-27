from django.urls import path
from . import views

urlpatterns = [
    path('verify-otp/', views.verify_otp),
    path('save-basic-info/', views.save_basic_info),
    path('update-job-types/', views.update_job_types),
#     path('update-availability/', views.update_availability),
#     path('update-skills/', views.update_skills),
#     path('upload-photo/', views.upload_photo),
#     path('upload-certificates/', views.upload_certificates),
]
