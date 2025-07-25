# In your Django app's views.py
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Import your models and serializers
from .models import User, Job, Rating, PaymentLog
from .serializers import UserSerializer, JobSerializer, RatingSerializer, PaymentLogSerializer

# Import Firebase Admin for token verification
# Ensure you have initialized Firebase Admin in your project (e.g., in settings.py or a startup file)
from firebase_admin import auth

from services.ocr_id_verification.src.ocr.processor import OcrService 
from services.ocr_id_verification.src.verification.verifier import IdVerifier

#===============================================
# 1. AUTHENTICATION & USER REGISTRATION
#===============================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_or_login_user(request):
    """
    Verifies Firebase ID token from the frontend.
    If user exists, logs them in. If not, creates a new user record.
    This is the main entry point after phone OTP verification on the client-side.
    """
    id_token = request.data.get('token')
    if not id_token:
        return Response({'error': 'ID token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify the token against the Firebase Admin SDK
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        phone_number = decoded_token.get('phone_number')

        # Get or create the user in your database using the unique Firebase UID
        user, created = User.objects.get_or_create(
            uid=uid,
            defaults={'phoneNumber': phone_number}
        )

        # Prepare data to send back to the frontend
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
# 2. USER PROFILE MANAGEMENT (Unified for both worker types)
#===============================================
@api_view(['GET', 'PATCH'])
# @permission_classes([IsAuthenticated]) # TODO: Secure this endpoint later
def user_profile_view(request, uid):
    """
    A single endpoint to get or update a user's profile.
    - GET: Fetches the user's profile data.
    - PATCH: Partially updates the user's profile with any provided fields 
             (e.g., name, age, skills, dailyJobTypes, etc.).
    """
    try:
        user = User.objects.get(uid=uid)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # This allows updating any field in one go
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#===============================================
# 3. JOB DISCOVERY & RECOMMENDATIONS
#===============================================
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_jobs(request):
    """Fetches jobs for workers, filterable by pincode."""
    pincode = request.query_params.get('pincode')
    if not pincode:
        return Response({'error': 'Pincode is required.'}, status=status.HTTP_400_BAD_REQUEST)

    jobs = Job.objects.filter(pincode=pincode, status='open')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_job_recommendations(request, uid):
    """
    Generates and returns AI-powered job recommendations for a worker.
    """
    try:
        worker = User.objects.get(uid=uid)
        all_open_jobs = Job.objects.filter(status='open')

        # --- AI/ML INTEGRATION POINT ---
        # recommender = JobRecommender()
        # recommended_jobs = recommender.recommend(worker, all_open_jobs)
        
        # For now, we mock a simple recommendation based on job type or skill
        if worker.userType == 'daily' and worker.dailyJobTypes:
            recommended_jobs = all_open_jobs.filter(title__icontains=worker.dailyJobTypes[0])
        elif worker.userType == 'skilled' and worker.skills:
            recommended_jobs = all_open_jobs.filter(description__icontains=worker.skills[0])
        else:
             # Fallback to just showing the 5 most recent jobs if no types/skills
            recommended_jobs = all_open_jobs.order_by('-createdAt')[:5]

        serializer = JobSerializer(recommended_jobs, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


#===============================================
# 4. BLUE-COLLAR WORKER FEATURES
#===============================================
@api_view(['POST'])
def verify_certificate_ocr(request, uid):
    """
    Receives an uploaded certificate, runs the real OCR service, and verifies the user.
    """
    if 'certificate_image' not in request.FILES:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(uid=uid, userType='skilled')
        image_file = request.FILES['certificate_image']
        
        # --- REAL AI/ML INTEGRATION ---
        # 1. Save the uploaded image file temporarily
        temp_image_path = f"temp_{image_file.name}"
        with open(temp_image_path, 'wb+') as dest:
            for chunk in image_file.chunks():
                dest.write(chunk)
        
        # 2. Process the image using your OCR service
        ocr_service = OcrService()
        id_data = ocr_service.process_id_from_path(temp_image_path) # Assumes this method exists
        
        # 3. Verify the extracted data
        verifier = IdVerifier()
        is_valid, reasons = verifier.verify_id_data(id_data) # Assumes this method exists
        
        # 4. Clean up the temporary file
        os.remove(temp_image_path)

        # 5. Check if verification was successful AND the name matches
        if is_valid and user.name.lower() in id_data.get('name', '').lower():
            user.isVerified = True
            user.save()
            return Response({"status": "success", "message": "ID verified successfully.", "data": id_data})
        else:
            # Add the name mismatch to the reasons if it failed
            if not user.name.lower() in id_data.get('name', '').lower():
                reasons.append("Name on certificate does not match profile name.")
            return Response({"status": "failure", "message": "Verification failed.", "reasons": reasons}, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'Skilled worker not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Make sure to clean up the temp file even if an error occurs
        if 'temp_image_path' in locals() and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def submit_rating(request, worker_uid):
    """Allows an employer to rate a skilled worker for a job."""
    data = request.data
    try:
        worker = User.objects.get(uid=worker_uid, userType='skilled')
        
        # Create the rating record
        rating = Rating.objects.create(
            worker=worker, job_id=data['jobId'], employer_id=data['employerId'],
            stars=data['stars'], comment=data.get('comment', '')
        )
        
        # Update worker's average rating and jobs completed in real-time
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
# @permission_classes([IsAuthenticated])
def payment_log_view(request, uid):
    """
    Manages a worker's private payment log.
    - GET: Fetches all payment log entries for the user.
    - POST: Creates or updates a payment log entry for a specific job.
    """
    if request.method == 'GET':
        logs = PaymentLog.objects.filter(user_id=uid)
        serializer = PaymentLogSerializer(logs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        try:
            # Use update_or_create for simplicity
            log_entry, created = PaymentLog.objects.update_or_create(
                user_id=uid, 
                job_id=data['jobId'],
                defaults={'paymentStatus': data['paymentStatus']}
            )
            serializer = PaymentLogSerializer(log_entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
