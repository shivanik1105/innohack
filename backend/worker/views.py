# In your Django app's views.py
import os
import pandas as pd # Import pandas to read CSV data
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Import your models and serializers
from .models import User, Job, Rating, PaymentLog
from .serializers import UserSerializer, JobSerializer, RatingSerializer, PaymentLogSerializer

# Import Firebase Admin for token verification
from firebase_admin import auth

# --- AI/ML SERVICE IMPORTS (Updated as per your request) ---
# Note: Corrected folder name from 'ocr-id-verification' to 'ocr_id_verification' for Python compatibility
from services.ocr_id_verification.src.ocr.processor import OcrService 
from services.ocr_id_verification.src.verification.verifier import IdVerifier
from services.wage_recommendation.recommender import WageRecommender
from services.bluecollar_recommender.recommender.recommender import recommend as recommend_jobs # Renamed to avoid conflict

#===============================================
# 1. AUTHENTICATION & USER REGISTRATION
#===============================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_or_login_user(request):
    """
    Verifies Firebase ID token. If user exists, logs them in. If not, creates a new user.
    """
    id_token = request.data.get('token')
    if not id_token:
        return Response({'error': 'ID token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        phone_number = decoded_token.get('phone_number')

        user, created = User.objects.get_or_create(
            uid=uid,
            defaults={'phoneNumber': phone_number}
        )

        serializer = UserSerializer(user)
        response_data = {
            'message': 'User authenticated successfully.',
            'isNewUser': created,
            'user': serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Invalid token or authentication error: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)

#===============================================
# 2. USER PROFILE MANAGEMENT
#===============================================
@api_view(['GET', 'PATCH'])
def user_profile_view(request, uid):
    """
    GET: Fetches a user's profile.
    PATCH: Creates or updates a user's profile.
    """
    if request.method == 'GET':
        try:
            user = User.objects.get(uid=uid)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'PATCH':
        user, created = User.objects.update_or_create(
            uid=uid,
            defaults=request.data
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status_code)

#===============================================
# 3. JOB & WAGE DISCOVERY (with AI/ML)
#===============================================
@api_view(['GET'])
def get_jobs(request):
    """Fetches jobs, filterable by pincode."""
    pincode = request.query_params.get('pincode')
    if not pincode:
        return Response({'error': 'Pincode is required.'}, status=status.HTTP_400_BAD_REQUEST)

    jobs = Job.objects.filter(pincode=pincode, status='open')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_job_recommendations(request, uid):
    """
    Generates AI-powered job recommendations for a worker,
    using the correct model based on their user type.
    """
    try:
        worker = User.objects.get(uid=uid)
        all_open_jobs = Job.objects.filter(status='open')

        if worker.userType == 'skilled':
            # --- FIXED AI/ML INTEGRATION ---
            # 1. Load the necessary data for the recommender model
            #    (Ensure these paths are correct relative to your manage.py file)
            try:
                companies_df = pd.read_csv('services/bluecollar_recommender/data/companies.csv')
                # NOTE: Your recommender function may need more data, like pre-computed vectors.
                # You would load or compute those here as well. For now, we pass what the error indicated.
            except FileNotFoundError:
                return Response({'error': 'Recommendation data files not found on server.'}, status=500)

            # 2. Call the recommendation function with all required arguments
            #    This now correctly passes the companies_df.
            #    You may need to add more arguments here if your function requires them (e.g., company_vecs)
            recommended_jobs = recommend_jobs(worker, all_open_jobs, companies=companies_df)
        
        elif worker.userType == 'daily':
            if worker.dailyJobTypes:
                recommended_jobs = all_open_jobs.filter(title__icontains=worker.dailyJobTypes[0])
            else:
                recommended_jobs = all_open_jobs.filter(pincode=worker.pincode).order_by('-createdAt')[:10]
        else:
            recommended_jobs = all_open_jobs.order_by('-createdAt')[:5]

        serializer = JobSerializer(recommended_jobs, many=True)
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'An error occurred during recommendation: {str(e)}'}, status=500)


@api_view(['GET'])
def suggest_wage(request):
    """Suggests a daily wage based on job details."""
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

#===============================================
# 4. BLUE-COLLAR WORKER FEATURES (with AI/ML)
#===============================================
@api_view(['POST'])
def verify_certificate_ocr(request, uid):
    """Receives an uploaded certificate, runs OCR, and verifies the user."""
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
            return Response({"status": "success", "message": "ID verified successfully.", "data": id_data})
        else:
            if not user.name.lower() in id_data.get('name', '').lower():
                reasons.append("Name on certificate does not match profile name.")
            return Response({"status": "failure", "message": "Verification failed.", "reasons": reasons}, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'Skilled worker not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        if 'temp_image_path' in locals() and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def submit_rating(request, worker_uid):
    """Allows an employer to rate a skilled worker for a job."""
    data = request.data
    try:
        worker = User.objects.get(uid=worker_uid, userType='skilled')
        
        rating = Rating.objects.create(
            worker=worker, job_id=data['jobId'], employer_id=data['employerId'],
            stars=data['stars'], comment=data.get('comment', '')
        )
        
        # The 'ratings_received' attribute is created dynamically by Django's ORM
        # from the 'related_name' in the Rating model's ForeignKey.
        # Linters like Pylance may not detect this, but the code is correct and will run.
        all_ratings = worker.ratings_received.all()
        worker.averageRating = sum([r.stars for r in all_ratings]) / len(all_ratings)
        worker.jobsCompleted = len(all_ratings)
        worker.save()
        
        return Response({'status': 'success', 'message': 'Rating submitted.'})
    except User.DoesNotExist:
        return Response({'error': 'Skilled worker not found.'}, status=status.HTTP_404_NOT_FOUND)

#===============================================
# 5. OPTIONAL PAYMENT LOG
#===============================================
@api_view(['POST', 'GET'])
def payment_log_view(request, uid):
    """Manages a worker's private payment log."""
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
