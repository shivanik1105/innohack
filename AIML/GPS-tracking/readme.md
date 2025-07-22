step 1, add main.py inside the templates of django

step 2, create django view

'''from django.shortcuts import render

def gps_tracking(request):
    return render(request, 'gps_tracking.html')'''

Add url pattern inside urls.py
'''from django.urls import path
from . import views

urlpatterns = [
    path('gps/', views.gps_tracking, name='gps_tracking'),
]'''