from django.urls import path
from . import views

urlpatterns = [
    path('verify-otp/', views.verify_otp),
    path('verify-token/', views.verify_token),
    path('save-basic-info/', views.save_basic_info),
    path('update-skills/', views.update_skills),
    path('upload-certification/', views.upload_certification),
    path('upload-portfolio/', views.upload_portfolio),
    path('add-work-history/', views.add_work_history),
]
