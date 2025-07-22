from django.shortcuts import render
from django.http import JsonResponse
from worker.firebase import auth  
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
import firebase_admin
from firebase_admin import auth

@api_view(['POST'])
def verify_otp(request):
    id_token = request.data.get('token')  # Get token from frontend
    try:
        decoded = auth.verify_id_token(id_token)
        phone = decoded['phone_number']

        user, created = User.objects.get_or_create(phone=phone)
        return Response({"message": "User authenticated", "phone": phone})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def verify_token(request):
    token = request.headers.get("Authorization", "").split("Bearer ")[-1]
    try:
        decoded_token = auth.verify_id_token(token)
        return JsonResponse({"success": True, "uid": decoded_token["uid"]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=401)

@api_view(['POST'])
def save_basic_info(request):
    phone = request.data['phone']
    user = User.objects.get(phone=phone)
    user.name = request.data['name']
    user.age = request.data['age']
    user.pin_code = request.data['pin_code']
    user.save()
    return Response({"message": "Info saved"})

@api_view(['POST'])
def update_job_types(request):
    user = User.objects.get(phone=request.data['phone'])
    user.job_types = request.data['job_types']
    user.save()
    return Response({"message": "Job types updated"})

@api_view(['POST'])
def update_skills(request):
    user = User.objects.get(phone=request.data['phone'])
    user.skills = request.data['skills']
    user.save()
    return Response({"message": "Skills updated"})

@api_view(['POST'])
def upload_certification(request):
    user = User.objects.get(phone=request.data['phone'])
    cert = request.data['cert']  # Example: {"label": "NGO", "url": "https://..."}
    user.certifications.append(cert)
    user.save()
    return Response({"message": "Certification uploaded"})

@api_view(['POST'])
def upload_portfolio(request):
    user = User.objects.get(phone=request.data['phone'])
    item = request.data['item']  # {"title": "Pipe Fix", "url": "https://..."}
    user.portfolio.append(item)
    user.save()
    return Response({"message": "Portfolio item added"})

@api_view(['POST'])
def add_work_history(request):
    user = User.objects.get(phone=request.data['phone'])
    job = request.data['job']  # {"title": "Plumbing", "contractor": "ABC", "date": "2024-01-01"}
    user.work_history.append(job)
    user.save()
    return Response({"message": "Work added to history"})

