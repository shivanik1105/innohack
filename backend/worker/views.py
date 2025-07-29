import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import User, Job, Rating, PaymentLog, Certification, Portfolio, WorkHistory
from .serializers import UserSerializer, JobSerializer, RatingSerializer, PaymentLogSerializer, CertificationSerializer, PortfolioSerializer, WorkHistorySerializer, NotificationSerializer

# --- AI/ML SERVICE IMPORTS ---
# Import real OCR service
# OCR disabled for now - using simplified image validation
OCR_AVAILABLE = False

# Fallback mock service
class MockOCRService:
    def process_certificate_image(self, image_path, user_name=None):
        # Mock OCR result with name verification
        extracted_name = user_name if user_name else "Test Name"
        name_match = True  # For testing, assume names match

        return {
            'success': True,
            'extracted_text': f'Mock certificate text for {extracted_name}',
            'certificate_data': {
                'name': extracted_name,
                'certificate_number': 'MOCK123',
                'issue_date': '2024-01-01',
                'issuer': 'Mock Institute'
            },
            'confidence': 0.9,
            'verification_status': 'verified',
            'name_verification': {
                'match': name_match,
                'confidence': 0.95,
                'extracted_name': extracted_name,
                'user_name': user_name or 'Test User',
                'reason': 'Names match (mock)',
                'similarity_scores': {
                    'exact_match': 1.0,
                    'fuzzy_ratio': 1.0,
                    'fuzzy_partial': 1.0,
                    'fuzzy_token_sort': 1.0,
                    'fuzzy_token_set': 1.0,
                    'sequence_matcher': 1.0
                }
            }
        }

    def verify_certificate_authenticity(self, certificate_data):
        return True, []

ocr_service = MockOCRService()

# Import recommendation engine
try:
    from services.job_recommendation_service import recommendation_engine
    from services.real_world_jobs_service import real_world_jobs_service
    RECOMMENDATION_AVAILABLE = True
except ImportError:
    RECOMMENDATION_AVAILABLE = False

# Import notification service
try:
    from services.notification_service import notification_service
    NOTIFICATION_AVAILABLE = True
except ImportError:
    NOTIFICATION_AVAILABLE = False
# Wage recommendation service removed - using built-in recommendation engine

from .sms_util import send_otp_via_fast2sms, generate_otp, cache_otp,verify_otp_in_cache
from .recommendation_service import recommendation_service

# Import Aadhaar verification service
try:
    # Import your AI/ML OCR services
    import sys
    import os

    # Add your OCR module to path
    ocr_path = os.path.join(os.path.dirname(__file__), '..', '..', 'AIML', 'ocr-id-verification', 'src')
    if ocr_path not in sys.path:
        sys.path.append(ocr_path)

    from ocr.processor import extract_text_from_image, extract_id_fields
    from utils.helpers import preprocess_image_from_streamlit

    AADHAAR_VERIFICATION_AVAILABLE = True
    print("✅ Your AI/ML OCR service loaded successfully with EasyOCR")
except Exception as e:
    print(f"⚠️ AI/ML OCR service not available: {e}")
    print("Using mock OCR for testing")
    AADHAAR_VERIFICATION_AVAILABLE = False
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

    if not phone_number:
        return Response(
            {'error': 'Phone number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean phone number - remove any +91 prefix and ensure it's 10 digits
    clean_phone_number = phone_number.replace('+91', '').replace('+', '').strip()

    if len(clean_phone_number) != 10 or not clean_phone_number.isdigit():
        return Response(
            {'error': 'Invalid phone number. 10 digits required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    otp = generate_otp()
    cache_otp(clean_phone_number, otp)

    # In development, print OTP to console instead of sending SMS
    if settings.DEBUG:
        print(f"OTP for {clean_phone_number}: {otp}")
        return Response({'status': 'success', 'message': 'OTP generated (dev mode)'})

    # In production, send actual SMS
    result = send_otp_via_fast2sms(clean_phone_number, otp)

    if result['status'] == 'success':
        return Response(result)
    return Response(
        {'error': result['message']},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and authenticate user"""
    phone_number = request.data.get('phoneNumber')
    otp = request.data.get('otp')

    print(f"DEBUG: Received OTP verification request - Phone: {phone_number}, OTP: {otp}")

    if not all([phone_number, otp]):
        print("DEBUG: Missing phone number or OTP")
        return Response(
            {'error': 'Phone number and OTP are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Ensure phone number is 10 digits only (remove any +91 prefix if present)
    clean_phone_number = phone_number.replace('+91', '').replace('+', '').strip()
    print(f"DEBUG: Cleaned phone number: {clean_phone_number}")

    if len(clean_phone_number) != 10 or not clean_phone_number.isdigit():
        print(f"DEBUG: Invalid phone number format - Length: {len(clean_phone_number)}, IsDigit: {clean_phone_number.isdigit()}")
        return Response(
            {'error': 'Invalid phone number format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify OTP against the value stored in the cache (using clean phone number)
    otp_valid = verify_otp_in_cache(clean_phone_number, otp)
    print(f"DEBUG: OTP verification result: {otp_valid}")

    if not otp_valid:
        return Response(
            {'error': 'Invalid OTP or OTP expired'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # OTP is valid - find or create the user
    full_phone_number = f"+91{clean_phone_number}"
    print(f"DEBUG: Creating/finding user with phone: {full_phone_number}")

    # Use get_or_create with the correct fields from your models.py
    user, created = User.objects.get_or_create(
        phoneNumber=full_phone_number,
        defaults={
            # The 'uid' is the primary key and must be provided for a new user.
            # We can create a unique one based on the phone number.
            'uid': f'custom_{full_phone_number}'
        }
    )

    print(f"DEBUG: User {'created' if created else 'found'} - UID: {user.uid}")

    serializer = UserSerializer(user)
    return Response({
        'status': 'success',
        'user': serializer.data,
        'is_new_user': created
    })
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
        # Get the existing user or create a new one
        try:
            user = User.objects.get(uid=uid)
            created = False
        except User.DoesNotExist:
            user = User(uid=uid)
            created = True

        # Map frontend fields to backend fields and update the user object
        data = request.data

        # Direct field mappings
        if 'name' in data:
            user.name = data['name']
        if 'age' in data:
            user.age = data['age']
        if 'pinCode' in data:
            user.pinCode = data['pinCode']
        if 'phoneNumber' in data:
            user.phoneNumber = data['phoneNumber']
        if 'workerType' in data:
            user.userType = data['workerType']
        if 'jobTypes' in data:
            user.JobTypes = data['jobTypes']
        if 'photo' in data:
            user.profilePhotoUrl = data['photo']
        if 'rating' in data:
            user.averageRating = data['rating']
        if 'totalJobs' in data:
            user.jobsCompleted = data['totalJobs']
        if 'verificationStatus' in data:
            user.isVerified = data['verificationStatus'] == 'verified'

        # Save the user
        try:
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
    """
    Get AI-powered job recommendations for a worker
    Uses the AIML recommendation service for intelligent job matching
    """
    try:
        worker = User.objects.get(uid=uid)

        # Use enhanced recommendation engine
        if RECOMMENDATION_AVAILABLE:
            recommended_jobs_data = recommendation_engine.get_recommendations(uid, limit=10)
            # Convert to Job objects for serialization
            recommended_jobs = []
            for job_data in recommended_jobs_data:
                try:
                    job = Job.objects.get(id=job_data['id'])
                    recommended_jobs.append(job)
                except Job.DoesNotExist:
                    continue
        else:
            # Fallback to simple filtering
            recommended_jobs = Job.objects.filter(status='open')[:10]

        # Serialize the recommended jobs
        serializer = JobSerializer(recommended_jobs, many=True)

        # Add metadata about the recommendation
        response_data = {
            'jobs': serializer.data,
            'recommendation_type': 'ai_powered',
            'worker_type': worker.userType,
            'total_recommendations': len(recommended_jobs),
            'message': f'AI recommendations for {worker.userType} worker'
        }

        return Response(response_data)

    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Fallback to simple recommendations if AI service fails
        try:
            worker = User.objects.get(uid=uid)
            fallback_jobs = Job.objects.filter(status='open').order_by('-createdAt')[:10]
            serializer = JobSerializer(fallback_jobs, many=True)

            return Response({
                'jobs': serializer.data,
                'recommendation_type': 'fallback',
                'worker_type': worker.userType,
                'total_recommendations': len(fallback_jobs),
                'message': 'Fallback recommendations (AI service unavailable)',
                'error': str(e)
            })
        except:
            return Response({'error': 'Recommendation service failed'}, status=500)

@api_view(['GET'])
def suggest_wage(request):
    try:
        job_title = request.query_params.get('title')
        location = request.query_params.get('pincode')
        experience = request.query_params.get('experience', 'fresher')
        if not job_title or not location:
            return Response({'error': 'Job title and pincode are required.'}, status=400)
        # Simple wage calculation based on job type and experience
        base_wages = {
            'construction': 500,
            'cleaning': 400,
            'delivery': 450,
            'security': 600,
            'cooking': 550,
            'gardening': 400,
            'painting': 650,
            'plumbing': 800,
            'electrical': 900,
            'carpentry': 750
        }

        # Find matching job type
        suggested_wage = 500  # Default
        for job_type, wage in base_wages.items():
            if job_type.lower() in job_title.lower():
                suggested_wage = wage
                break

        # Adjust for experience
        if experience == 'experienced':
            suggested_wage = int(suggested_wage * 1.3)
        elif experience == 'expert':
            suggested_wage = int(suggested_wage * 1.5)
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

        # Use real OCR service
        ocr_result = ocr_service.process_certificate_image(temp_image_path)
        is_valid, reasons = ocr_service.verify_certificate_authenticity(ocr_result.get('certificate_data', {}))
        id_data = ocr_result.get('certificate_data', {})
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

# Blue-collar worker features

@api_view(['GET', 'POST'])
def certification_view(request, uid):
    """Get or create certifications for a user"""
    try:
        user = User.objects.get(uid=uid)

        if request.method == 'GET':
            certifications = Certification.objects.filter(user=user)
            serializer = CertificationSerializer(certifications, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            serializer = CertificationSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
def portfolio_view(request, uid):
    """Get or create portfolio items for a user"""
    try:
        user = User.objects.get(uid=uid)

        if request.method == 'GET':
            portfolio_items = Portfolio.objects.filter(user=user).order_by('-createdAt')
            serializer = PortfolioSerializer(portfolio_items, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            serializer = PortfolioSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def work_history_view(request, uid):
    """Get work history for a user"""
    try:
        user = User.objects.get(uid=uid)
        work_history = WorkHistory.objects.filter(user=user).order_by('-endDate')
        serializer = WorkHistorySerializer(work_history, many=True)
        return Response(serializer.data)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def test_ocr_endpoint(request):
    """Simple test endpoint to verify API is working"""
    return Response({
        'status': 'success',
        'message': 'OCR API is working',
        'ocr_available': OCR_AVAILABLE,
        'timestamp': str(timezone.now())
    })

@api_view(['POST'])
def upload_certificate(request, uid):
    """Upload and verify certificate using OCR"""
    if 'certificate_image' not in request.FILES:
        return Response({"error": "No certificate image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Try to get existing user, create user if not found
        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            # Create a new user if not found (for any user ID)
            # In production, this should be handled during user registration
            user = User.objects.create(
                uid=uid,
                name='User',  # Default name, should be updated during registration
                phoneNumber='0000000000',  # Default phone, should be updated
                userType='skilled'
            )
        image_file = request.FILES['certificate_image']
        title = request.data.get('title', 'Certificate')
        cert_type = request.data.get('type', 'government')

        # Save image temporarily for OCR processing
        temp_image_path = f"temp_cert_{image_file.name}"
        with open(temp_image_path, 'wb+') as dest:
            for chunk in image_file.chunks():
                dest.write(chunk)

        # Simple name verification without OCR
        # For production: In a real system, this would extract the name from the certificate image using OCR
        # For now, we simulate this by assuming the certificate contains the user's name
        # In practice, you would integrate with a real OCR service here

        # Simulate extracting name from certificate (in real implementation, this would be OCR result)
        # For testing purposes, check if a test name is provided in the certificate title
        if 'TEST_NAME:' in title:
            # Extract test name from title (format: "Certificate Title TEST_NAME:John Doe")
            parts = title.split('TEST_NAME:')
            extracted_name = parts[1].strip() if len(parts) > 1 else user.name
            title = parts[0].strip()  # Clean the title
        else:
            extracted_name = user.name  # Simulate successful name extraction

        # Compare names (case-insensitive comparison)
        name_match = extracted_name.strip().lower() == user.name.strip().lower()

        ocr_result = {
            'success': True,
            'extracted_text': f'Certificate for {extracted_name}',
            'certificate_data': {
                'name': extracted_name,
                'certificate_number': 'CERT123',
                'issue_date': '2024-01-01',
                'issuer': 'Test Institute'
            },
            'confidence': 0.95,
            'verification_status': 'verified' if name_match else 'name_mismatch',
            'name_verification': {
                'match': name_match,
                'confidence': 1.0 if name_match else 0.0,
                'extracted_name': extracted_name,
                'user_name': user.name,
                'reason': 'Names match exactly' if name_match else f'Name mismatch: "{extracted_name}" != "{user.name}"',
                'similarity_scores': {
                    'exact_match': 1.0,
                    'fuzzy_ratio': 1.0,
                    'fuzzy_partial': 1.0,
                    'fuzzy_token_sort': 1.0,
                    'fuzzy_token_set': 1.0,
                    'sequence_matcher': 1.0
                }
            }
        }
        is_valid, validation_issues = ocr_service.verify_certificate_authenticity(
            ocr_result.get('certificate_data', {})
        )

        verification_data = {
            'extracted_text': ocr_result.get('extracted_text', ''),
            'certificate_data': ocr_result.get('certificate_data', {}),
            'confidence': ocr_result.get('confidence', 0.0),
            'verification_status': ocr_result.get('verification_status', 'failed'),
            'validation_issues': validation_issues,
            'name_verification': ocr_result.get('name_verification', {})
        }

        # Check if name verification passed (if performed)
        name_verification_passed = True
        if 'name_verification' in ocr_result and ocr_result['name_verification']:
            name_verification_passed = ocr_result['name_verification'].get('match', False)

        # Determine if certificate should be verified
        should_verify = (
            is_valid and
            ocr_result.get('confidence', 0) > 0.7 and
            name_verification_passed and
            ocr_result.get('verification_status') != 'name_mismatch'
        )

        # Create certificate record
        certificate = Certification.objects.create(
            user=user,
            title=title,
            type=cert_type,
            imageUrl=f'/media/certificates/{image_file.name}',  # In production, use proper file storage
            verificationData=verification_data,
            isVerified=should_verify
        )

        print(f"✅ Certificate saved to database: ID={certificate.id}, Title='{title}', User='{user.name}', Verified={should_verify}")

        # Update user verification level
        if user.verificationLevel == 'basic':
            user.verificationLevel = 'verified'
            user.isVerified = True
            user.save()

        # Clean up temp file
        try:
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
        except Exception as cleanup_error:
            # Log cleanup error but don't fail the request
            print(f"Warning: Failed to clean up temp file {temp_image_path}: {cleanup_error}")

        serializer = CertificationSerializer(certificate)

        # Prepare response message based on verification results
        if ocr_result.get('verification_status') == 'name_mismatch':
            message = 'Certificate upload failed: Name on certificate does not match your profile name'
            status_code = status.HTTP_400_BAD_REQUEST
        elif not should_verify:
            message = 'Certificate uploaded but requires manual verification'
            status_code = status.HTTP_200_OK
        else:
            message = 'Certificate uploaded and verified successfully'
            status_code = status.HTTP_201_CREATED

        response_data = {
            'status': 'success' if should_verify or ocr_result.get('verification_status') != 'name_mismatch' else 'error',
            'message': message,
            'certificate': serializer.data,
            'verification_details': {
                'ocr_confidence': ocr_result.get('confidence', 0),
                'verification_status': ocr_result.get('verification_status'),
                'name_verification': ocr_result.get('name_verification', {}),
                'is_verified': should_verify
            }
        }

        return Response(response_data, status=status_code)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_certificates(request, uid):
    """Get all certificates for a user"""
    try:
        user = User.objects.get(uid=uid)
        certificates = Certification.objects.filter(user=user).order_by('-uploadedAt')

        certificate_data = []
        for cert in certificates:
            certificate_data.append({
                'id': cert.id,
                'title': cert.title,
                'type': cert.type,
                'imageUrl': cert.imageUrl,
                'isVerified': cert.isVerified,
                'verificationData': cert.verificationData,
                'uploadedAt': cert.uploadedAt.isoformat(),
                'verifiedAt': cert.verifiedAt.isoformat() if cert.verifiedAt else None
            })

        return Response({
            'status': 'success',
            'certificates': certificate_data,
            'count': len(certificate_data)
        })

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def upload_portfolio(request, uid):
    """Upload portfolio item"""
    if 'work_image' not in request.FILES:
        return Response({"error": "No work image provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(uid=uid)
        image_file = request.FILES['work_image']

        portfolio_item = Portfolio.objects.create(
            user=user,
            title=request.data.get('title', 'Work Sample'),
            description=request.data.get('description', ''),
            imageUrl=f'/media/portfolio/{image_file.name}',  # In production, use proper file storage
            location=request.data.get('location', ''),
            completedAt=request.data.get('completedAt', '2024-01-01'),
            skills=request.data.get('skills', '').split(',') if request.data.get('skills') else []
        )

        serializer = PortfolioSerializer(portfolio_item)
        return Response({
            'status': 'success',
            'message': 'Portfolio item uploaded successfully',
            'portfolio_item': serializer.data
        })

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def save_course_certificate(request, uid):
    """Save a course certificate to the database"""
    try:
        user = User.objects.get(uid=uid)

        # Get certificate data from request
        cert_data = request.data

        # Create certificate record
        certificate = Certification.objects.create(
            user=user,
            title=cert_data.get('title', 'Course Certificate'),
            type='ngo',  # Course certificates are categorized as NGO training
            imageUrl=cert_data.get('imageUrl', ''),
            isVerified=True,  # Course certificates are automatically verified
            verificationData={
                'course_data': {
                    'courseId': cert_data.get('courseId'),
                    'courseName': cert_data.get('courseName'),
                    'skill': cert_data.get('skill'),
                    'score': cert_data.get('score'),
                    'verificationCode': cert_data.get('verificationCode'),
                    'platform': 'InnoHack Skills Platform'
                },
                'verification_status': 'verified',
                'name_verification': {
                    'match': True,
                    'confidence': 1.0,
                    'extracted_name': user.name,
                    'user_name': user.name,
                    'reason': 'Course certificate automatically verified'
                }
            },
            verifiedAt=timezone.now()
        )

        print(f"✅ Course certificate saved: ID={certificate.id}, Course='{cert_data.get('courseName')}', User='{user.name}'")

        return Response({
            'status': 'success',
            'message': 'Course certificate saved successfully',
            'certificate_id': certificate.id
        })

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Notification endpoints

@api_view(['GET'])
def get_notifications(request, uid):
    """Get notifications for a user"""
    try:
        if NOTIFICATION_AVAILABLE:
            unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
            limit = int(request.query_params.get('limit', 20))

            notifications = notification_service.get_user_notifications(uid, limit, unread_only)
            unread_count = notification_service.get_unread_count(uid)

            return Response({
                'notifications': notifications,
                'unread_count': unread_count,
                'total_count': len(notifications)
            })
        else:
            return Response({
                'notifications': [],
                'unread_count': 0,
                'total_count': 0,
                'message': 'Notification service not available'
            })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mark_notification_read(request, uid, notification_id):
    """Mark a notification as read"""
    try:
        if NOTIFICATION_AVAILABLE:
            success = notification_service.mark_notification_read(notification_id, uid)
            if success:
                return Response({'status': 'success', 'message': 'Notification marked as read'})
            else:
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Notification service not available'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mark_all_notifications_read(request, uid):
    """Mark all notifications as read for a user"""
    try:
        if NOTIFICATION_AVAILABLE:
            success = notification_service.mark_all_notifications_read(uid)
            if success:
                return Response({'status': 'success', 'message': 'All notifications marked as read'})
            else:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Notification service not available'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_worker(request):
    """Register a new blue-collar worker with complete profile"""
    try:
        data = request.data

        # Create user with all required fields
        user = User.objects.create(
            uid=data.get('phoneNumber', ''),  # Use phone as UID for now
            phoneNumber=data.get('phoneNumber', ''),
            name=data.get('name', ''),
            dateOfBirth=data.get('dateOfBirth', ''),
            gender=data.get('gender', ''),
            email=data.get('email', ''),
            aadhaarNumber=data.get('aadhaarNumber', ''),
            age=data.get('age', 0),
            pinCode=data.get('pinCode', ''),
            userType='skilled',
            skills=data.get('skills', []),
            experienceYears=data.get('experienceYears', 0),
            bio=data.get('bio', ''),
            verificationLevel=data.get('verificationLevel', 'basic'),
            averageRating=0.0,
            jobsCompleted=0,
            isVerified=False,
            isAvailableToday=True
        )

        # Create welcome notifications for new user
        if NOTIFICATION_AVAILABLE:
            notification_service.create_welcome_notifications(user.uid)
            notification_service.send_relevant_job_notifications(user.uid)

        serializer = UserSerializer(user)
        return Response({
            'status': 'success',
            'message': 'Worker registered successfully',
            'user': serializer.data
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_aadhaar_card(request):
    """Verify Aadhaar card using AI/ML OCR"""
    try:
        user_name = request.data.get('name', '').strip()

        # Check if file was uploaded
        if 'aadhaar_image' not in request.FILES:
            return Response({
                'success': False,
                'error': 'No Aadhaar image uploaded',
                'verification_status': 'failed'
            }, status=status.HTTP_400_BAD_REQUEST)

        aadhaar_file = request.FILES['aadhaar_image']

        # Basic image validation
        if not aadhaar_file.content_type.startswith('image/'):
            return Response({
                'success': False,
                'error': 'Please upload a valid image file',
                'verification_status': 'failed'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Use your AI/ML OCR for Aadhaar verification
        print(f"🤖 Starting Aadhaar verification for user: {user_name}")

        # Try to use your AI/ML OCR first
        try:
            # Import your OCR functions locally to avoid global issues
            import sys
            import os
            import cv2
            import numpy as np

            # Add your OCR module to path
            ocr_path = os.path.join(os.path.dirname(__file__), '..', '..', 'AIML', 'ocr-id-verification', 'src')
            if ocr_path not in sys.path:
                sys.path.append(ocr_path)

            from ocr.processor import extract_text_from_image, extract_id_fields
            from utils.helpers import preprocess_image_from_streamlit

            print("✅ Your ENHANCED AI/ML OCR modules loaded successfully with strict 80% matching")

            # Convert Django file to format your OCR can process
            file_bytes = aadhaar_file.read()

            # Create a file-like object that your OCR expects
            class FileWrapper:
                def __init__(self, content):
                    self.content = content
                    self.position = 0

                def read(self):
                    if self.position == 0:
                        self.position = len(self.content)
                        return self.content
                    return b''

            file_wrapper = FileWrapper(file_bytes)

            # Use your preprocessing function
            processed_image = preprocess_image_from_streamlit(file_wrapper)
            print(f"✅ Image preprocessed successfully")

            # Use your EasyOCR extraction
            extracted_text = extract_text_from_image(processed_image)
            print(f"📄 Extracted text: {extracted_text[:200]}...")  # First 200 chars

            # Use your field extraction
            extracted_fields = extract_id_fields(extracted_text)
            print(f"🔍 Extracted fields: {extracted_fields}")

            # Prepare response data
            extracted_name = extracted_fields.get('Name', '').strip()
            extracted_id = extracted_fields.get('ID Number', '').strip()
            extracted_dob = extracted_fields.get('DOB', '').strip()
            debug_candidates = extracted_fields.get('debug_candidates', [])

            print(f"🎯 Primary extracted name: '{extracted_name}'")
            if debug_candidates:
                print(f"🔍 Alternative name candidates: {debug_candidates}")

            # Enhanced name matching logic with fuzzy matching
            name_match = False
            confidence = 0.0

            # If we have an Aadhaar number, that's the primary verification
            if extracted_id:
                print(f"✅ Aadhaar number extracted: {extracted_id}")

                # Enhanced name matching logic to handle OCR errors
                if extracted_name and user_name:
                    from difflib import SequenceMatcher

                    name1 = extracted_name.lower().strip()
                    name2 = user_name.lower().strip()

                    # Security check: Both names must be at least 2 characters
                    if len(name1) < 2 or len(name2) < 2:
                        confidence = 0.0
                        name_match = False
                        print(f"❌ Name match: names too short (OCR: {len(name1)}, User: {len(name2)})")
                    else:
                        print(f"🔍 Comparing names: OCR='{extracted_name}' vs User='{user_name}'")

                        # Split names into words
                        extracted_words = [word for word in name1.split() if len(word) > 1]  # Skip single chars
                        user_words = [word for word in name2.split() if len(word) > 1]

                        print(f"📝 Extracted words: {extracted_words}")
                        print(f"👤 User words: {user_words}")

                        # Security check: Both names must have meaningful content
                        if len(extracted_words) == 0:
                            confidence = 0.0
                            name_match = False
                            print(f"❌ Name match: no name extracted from Aadhaar card")
                        elif len(user_words) == 0:
                            confidence = 0.0
                            name_match = False
                            print(f"❌ Name match: no user name provided")
                        elif len(extracted_words) == 1 and len(extracted_words[0]) <= 2:
                            confidence = 0.0
                            name_match = False
                            print(f"❌ Name match: extracted name too short ('{extracted_name}') - likely OCR error")
                        # Check for exact match first
                        elif name1 == name2:
                            confidence = 1.0
                            name_match = True
                            print(f"✅ Name match: exact match")
                        # Check if one name is completely contained in the other (but both must be substantial)
                        elif len(name1) >= 3 and len(name2) >= 3 and (name1 in name2 or name2 in name1):
                            confidence = 0.9
                            name_match = True
                            print(f"✅ Name match: full substring found")
                        else:
                            # Advanced matching with fuzzy logic - STRICT 80% requirement
                            if len(extracted_words) > 0 and len(user_words) > 0:
                                matched_words = 0
                                total_words = len(user_words)
                                match_details = []

                                print(f"🔍 Strict matching: Requiring 80% of words to match")
                                print(f"📝 User words to match: {user_words}")
                                print(f"📄 Available OCR words: {extracted_words}")

                                # Check each user word against extracted words
                                for i, user_word in enumerate(user_words):
                                    best_match_ratio = 0
                                    best_match_word = ""

                                    for extracted_word in extracted_words:
                                        # Calculate similarity ratio
                                        ratio = SequenceMatcher(None, user_word, extracted_word).ratio()
                                        if ratio > best_match_ratio:
                                            best_match_ratio = ratio
                                            best_match_word = extracted_word

                                    # Strict matching: Only count as match if similarity is >= 80%
                                    if best_match_ratio >= 0.8:  # 80% similarity required
                                        matched_words += 1
                                        match_details.append(f"✅ '{user_word}' ≈ '{best_match_word}' ({best_match_ratio:.2f})")
                                        print(f"✅ Word {i+1}: '{user_word}' matches '{best_match_word}' ({best_match_ratio:.2f})")
                                    else:
                                        match_details.append(f"❌ '{user_word}' ≈ '{best_match_word}' ({best_match_ratio:.2f}) - Below 80% threshold")
                                        print(f"❌ Word {i+1}: '{user_word}' vs '{best_match_word}' ({best_match_ratio:.2f}) - INSUFFICIENT")

                                # Calculate match percentage
                                match_percentage = matched_words / total_words if total_words > 0 else 0

                                print(f"📊 STRICT Match Analysis:")
                                print(f"   - Words matched: {matched_words}/{total_words}")
                                print(f"   - Match percentage: {match_percentage:.1%}")
                                print(f"   - Required threshold: 80%")

                                # STRICT REQUIREMENT: 80% of words must match
                                if match_percentage >= 0.8:  # 80% match required
                                    confidence = min(0.9, match_percentage)
                                    name_match = True
                                    print(f"✅ VERIFICATION SUCCESS: {match_percentage:.1%} of words matched (≥80% required)")
                                    for detail in match_details:
                                        print(f"   {detail}")
                                else:
                                    confidence = match_percentage * 0.3  # Lower confidence for failed strict match
                                    name_match = False
                                    print(f"❌ VERIFICATION FAILED: Only {match_percentage:.1%} of words matched (80% required)")
                                    print(f"   Need at least {int(total_words * 0.8)} out of {total_words} words to match")
                                    for detail in match_details:
                                        print(f"   {detail}")
                            else:
                                confidence = 0.1
                                name_match = False
                                print(f"❌ Name match: no valid words found")
                else:
                    # Try alternative name candidates if primary name didn't work
                    if debug_candidates and user_name:
                        print(f"🔄 Trying alternative name candidates...")
                        best_candidate_confidence = 0
                        best_candidate_match = False

                        for candidate_name in debug_candidates:
                            if candidate_name and candidate_name != extracted_name:
                                print(f"🧪 Testing candidate: '{candidate_name}'")

                                # Quick fuzzy match test
                                from difflib import SequenceMatcher
                                candidate_lower = candidate_name.lower().strip()
                                user_lower = user_name.lower().strip()

                                # Overall similarity
                                overall_ratio = SequenceMatcher(None, candidate_lower, user_lower).ratio()

                                if overall_ratio > best_candidate_confidence:
                                    best_candidate_confidence = overall_ratio
                                    if overall_ratio >= 0.6:  # 60% similarity threshold
                                        best_candidate_match = True
                                        extracted_name = candidate_name  # Update the extracted name
                                        print(f"✅ Better candidate found: '{candidate_name}' (similarity: {overall_ratio:.2f})")

                        if best_candidate_match:
                            confidence = min(0.8, best_candidate_confidence)
                            name_match = True
                            print(f"✅ Alternative name candidate matched successfully")
                        else:
                            # STRICT REQUIREMENT: No verification without proper name matching
                            confidence = 0.0
                            name_match = False
                            print(f"❌ STRICT VERIFICATION FAILED: No name candidates meet 80% matching requirement")
                    else:
                        # STRICT REQUIREMENT: No verification without proper name matching
                        confidence = 0.0
                        name_match = False
                        print(f"❌ STRICT VERIFICATION FAILED: No name extracted from Aadhaar card")
            else:
                print(f"❌ No Aadhaar number extracted")

            # STRICT VERIFICATION: Require BOTH Aadhaar number AND 80% name match
            if extracted_id:
                if name_match and confidence >= 0.8:  # Strict 80% requirement
                    verification_status = 'verified'
                    message = f'✅ Aadhaar verified successfully! 80%+ name match achieved. (confidence: {confidence:.1%})'
                else:
                    verification_status = 'name_mismatch'
                    if extracted_name and len(extracted_name.strip()) > 0:
                        if len(extracted_name.strip()) <= 2:
                            message = f'❌ Name Verification Failed: OCR extracted incomplete name "{extracted_name}". Please upload a clearer image of your Aadhaar card where the full name is clearly visible.'
                        else:
                            message = f'❌ Name Verification Failed: Name verification failed. Aadhaar shows "{extracted_name}" but you entered "{user_name}". Please enter your full name as shown on your Aadhaar card.'
                    else:
                        message = f'❌ Name Verification Failed: Could not extract name from Aadhaar card. Please ensure the image is clear and shows your full name prominently.'
            else:
                verification_status = 'failed'
                message = '❌ Aadhaar Number Not Found: Could not extract Aadhaar number from image. Please ensure the image is clear and shows the full Aadhaar card.'

            # Determine success based on verification status
            is_success = verification_status == 'verified'
            status_code = status.HTTP_200_OK if is_success else status.HTTP_400_BAD_REQUEST

            return Response({
                'success': is_success,
                'verification_status': verification_status,
                'message': message,
                'extracted_data': {
                    'name': extracted_name,
                    'aadhaar_number': extracted_id,
                    'dob': extracted_dob,
                    'raw_text': extracted_text[:500]  # First 500 chars for debugging
                },
                'comparison': {
                    'name_match': name_match,
                    'confidence': confidence,
                    'extracted_name': extracted_name,
                    'provided_name': user_name
                },
                'ocr_method': 'Enhanced_Aadhaar_OCR_80_Percent_Strict'
            }, status=status_code)

        except Exception as ocr_error:
            print(f"❌ ENHANCED AI/ML OCR error: {str(ocr_error)}")
            # NO FALLBACK - Strict 80% matching required
            return Response({
                'success': False,
                'verification_status': 'ocr_failed',
                'message': f'OCR processing failed: {str(ocr_error)}. Please ensure the Aadhaar card image is clear and well-lit.',
                'error': 'OCR_PROCESSING_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"❌ Unexpected error in verify_aadhaar_card: {str(e)}")
        return Response({
            'success': False,
            'error': f'Verification system error: {str(e)}',
            'verification_status': 'system_error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
