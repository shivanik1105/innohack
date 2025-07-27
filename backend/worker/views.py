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
