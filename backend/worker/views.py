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

# In your worker/views.py file

# ... (add this with your other imports)
import requests
import json
from django.conf import settings

# --- 2FACTOR.IN OTP AUTHENTICATION ---

# IMPORTANT: Store your 2Factor API Key securely.
# The best way is to use environment variables.
TWO_FACTOR_API_KEY = 'YOUR_2FACTOR_API_KEY_HERE' # Replace with your actual key

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_2factor(request):
    """
    Sends an OTP to the user's phone number using the 2Factor.in API.
    """
    phone_number = request.data.get('phoneNumber')
    if not phone_number or len(phone_number) != 10:
        return Response({'error': 'A valid 10-digit phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Construct the URL for the 2Factor API
    url = f"https://2factor.in/API/V1/{TWO_FACTOR_API_KEY}/SMS/+91{phone_number}/AUTOGEN"
    
    try:
        response = requests.get(url)
        response_data = response.json()

        if response_data.get("Status") == "Success":
            # The session_id is what we'll use to verify the OTP later
            session_id = response_data.get("Details")
            return Response({'status': 'success', 'session_id': session_id})
        else:
            return Response({'error': 'Failed to send OTP.', 'details': response_data}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except requests.exceptions.RequestException as e:
        return Response({'error': f'API request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_2factor(request):
    """
    Verifies the OTP entered by the user using the 2Factor.in API.
    If successful, it creates or logs in the user.
    """
    session_id = request.data.get('session_id')
    otp_code = request.data.get('otp')
    phone_number = request.data.get('phoneNumber') # We need this to find the user

    if not all([session_id, otp_code, phone_number]):
        return Response({'error': 'Session ID, OTP, and phone number are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Construct the verification URL
    url = f"https://2factor.in/API/V1/{TWO_FACTOR_API_KEY}/SMS/VERIFY/{session_id}/{otp_code}"

    try:
        response = requests.get(url)
        response_data = response.json()

        if response_data.get("Status") == "Success":
            # OTP is correct. Now, find or create the user in our database.
            # We use the full phone number with country code as the unique identifier.
            full_phone_number = f"+91{phone_number}"
            
            user, created = User.objects.get_or_create(
                phoneNumber=full_phone_number,
                defaults={'uid': f'custom_{full_phone_number}'} # Create a custom UID
            )

            # TODO: Generate a JWT or another auth token here for the user
            # For now, we'll just return the user data.
            serializer = UserSerializer(user)
            return Response({
                'status': 'success',
                'message': 'User authenticated successfully.',
                'isNewUser': created,
                'user': serializer.data,
                # 'token': 'your_generated_jwt_token' # Add this later
            })
        else:
            return Response({'error': 'Invalid OTP.', 'details': response_data}, status=status.HTTP_400_BAD_REQUEST)

    except requests.exceptions.RequestException as e:
        return Response({'error': f'API request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH'])
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
