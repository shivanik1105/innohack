import os
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import User, Job, Rating, PaymentLog
from .serializers import UserSerializer, JobSerializer, RatingSerializer, PaymentLogSerializer
from firebase_admin import auth

# --- AI/ML SERVICE IMPORTS ---
from services.ocr_id_verification.src.ocr.processor import OcrService
from services.ocr_id_verification.src.verification.verifier import IdVerifier
from services.bluecollar_recommender.recommender import recommender as recommend_jobs
from services.wage_recommendation_app.src.model.recommender import WageRecommender

from .sms_util import send_otp_via_fast2sms, generate_otp, cache_otp,verify_otp_in_cache
from .models import User
from .serializers import UserSerializer
# In your worker/views.py file

# ... (add this with your other imports)
import requests
import json
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to user's phone"""
    phone_number = request.data.get('phoneNumber')
    
    # Validate phone number
    if not phone_number or len(phone_number) != 10 or not phone_number.isdigit():
        return Response(
            {'error': 'Invalid phone number. 10 digits required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    otp = generate_otp()
    cache_otp(phone_number, otp)
    
    # In development, print OTP to console instead of sending SMS
    if settings.DEBUG:
        print(f"OTP for {phone_number}: {otp}")
        return Response({'status': 'success', 'message': 'OTP generated (dev mode)'})
    
    # In production, send actual SMS
    result = send_otp_via_fast2sms(phone_number, otp)
    
    if result['status'] == 'success':
        return Response(result)
    return Response(
        {'error': result['message']},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )



@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """API endpoint to verify OTP"""
    phone_number = request.data.get('phoneNumber')
    otp = request.data.get('otp')
    
    # Input validation
    if not all([phone_number, otp]):
        return Response(
            {'error': 'Phone number and OTP are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Business logic verification
    if not verify_otp_in_cache(phone_number, otp):
        return Response(
            {'error': 'Invalid OTP or OTP expired'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authentication successful - get or create user
    full_phone_number = f"+91{phone_number}"
    user, created = User.objects.get_or_create(
        phoneNumber=full_phone_number,
        defaults={
            'username': f'user_{phone_number}',
            'is_active': True
        }
    )
    
    serializer = UserSerializer(user)
    return Response({
        'status': 'success',
        'user': serializer.data,
        'is_new_user': created
    })@api_view(['GET', 'PATCH'])
def user_profile_view(request, uid):
    if request.method == 'GET':
        try:
            user = User.objects.get(uid=uid)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'PATCH':
        user, created = User.objects.update_or_create(uid=uid, defaults=request.data)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(['GET'])
def get_jobs(request):
    pincode = request.query_params.get('pincode')
    if not pincode:
        return Response({'error': 'Pincode is required.'}, status=status.HTTP_400_BAD_REQUEST)
    jobs = Job.objects.filter(pincode=pincode, status='open')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_job_recommendations(request, uid):
    try:
        worker = User.objects.get(uid=uid)
        all_open_jobs = Job.objects.filter(status='open')
        if worker.userType == 'skilled':
            try:
                companies_df = pd.read_csv('services/bluecollar_recommender/data/companies.csv')
                recommended_jobs = recommend_jobs(worker, all_open_jobs, companies=companies_df)
            except FileNotFoundError:
                return Response({'error': 'Recommendation data files not found.'}, status=500)
        else: # daily
            if worker.dailyJobTypes:
                recommended_jobs = all_open_jobs.filter(title__icontains=worker.dailyJobTypes[0])
            else:
                recommended_jobs = all_open_jobs.filter(pincode=worker.pincode).order_by('-createdAt')[:10]
        serializer = JobSerializer(recommended_jobs, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def suggest_wage(request):
    try:
        job_title = request.query_params.get('title')
        location = request.query_params.get('pincode')
        experience = request.query_params.get('experience', 'fresher')
        if not job_title or not location:
            return Response({'error': 'Job title and pincode are required.'}, status=400)
        recommender = WageRecommender()
        suggested_wage = recommender.predict_wage(job_title, location, experience)
        return Response({'suggested_wage': suggested_wage})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def verify_certificate_ocr(request, uid):
    if 'certificate_image' not in request.FILES:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(uid=uid, userType='skilled')
        image_file = request.FILES['certificate_image']
        temp_image_path = f"temp_{image_file.name}"
        with open(temp_image_path, 'wb+') as dest:
            for chunk in image_file.chunks(): dest.write(chunk)
        ocr_service = OcrService()
        id_data = ocr_service.process_id_from_path(temp_image_path)
        verifier = IdVerifier()
        is_valid, reasons = verifier.verify_id_data(id_data)
        os.remove(temp_image_path)
        if is_valid and user.name.lower() in id_data.get('name', '').lower():
            user.isVerified = True
            user.save()
            return Response({"status": "success", "message": "ID verified.", "data": id_data})
        else:
            if not user.name.lower() in id_data.get('name', '').lower():
                reasons.append("Name on certificate does not match profile name.")
            return Response({"status": "failure", "reasons": reasons}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'Skilled worker not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        if 'temp_image_path' in locals() and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def submit_rating(request, worker_uid):
    data = request.data
    try:
        worker = User.objects.get(uid=worker_uid, userType='skilled')
        rating = Rating.objects.create(
            worker=worker, job_id=data['jobId'], employer_id=data['employerId'],
            stars=data['stars'], comment=data.get('comment', '')
        )
        all_ratings = worker.ratings_received.all()
        worker.averageRating = sum([r.stars for r in all_ratings]) / len(all_ratings)
        worker.jobsCompleted = len(all_ratings)
        worker.save()
        return Response({'status': 'success', 'message': 'Rating submitted.'})
    except User.DoesNotExist:
        return Response({'error': 'Skilled worker not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST', 'GET'])
def payment_log_view(request, uid):
    if request.method == 'GET':
        logs = PaymentLog.objects.filter(user_id=uid)
        serializer = PaymentLogSerializer(logs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data
        try:
            log_entry, created = PaymentLog.objects.update_or_create(
                user_id=uid, 
                job_id=data['jobId'],
                defaults={'paymentStatus': data['paymentStatus']}
            )
            serializer = PaymentLogSerializer(log_entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
