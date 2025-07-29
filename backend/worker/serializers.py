from rest_framework import serializers
from .models import User, Job, Rating, PaymentLog, Certification, Portfolio, WorkHistory, Notification

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'title', 'type', 'imageUrl', 'isVerified', 'verificationData', 'uploadedAt', 'verifiedAt']

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ['id', 'title', 'description', 'imageUrl', 'location', 'completedAt', 'skills', 'createdAt']

class WorkHistorySerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    rating_stars = serializers.IntegerField(source='rating.stars', read_only=True)

    class Meta:
        model = WorkHistory
        fields = ['id', 'job_title', 'startDate', 'endDate', 'rating_stars', 'earnings', 'notes']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'isRead', 'createdAt', 'job', 'actionUrl']

class UserSerializer(serializers.ModelSerializer):
    # Map backend field names to frontend field names
    id = serializers.CharField(source='uid', read_only=True)
    jobTypes = serializers.JSONField(source='JobTypes', required=False)
    workerType = serializers.CharField(source='userType', required=False)
    photo = serializers.URLField(source='profilePhotoUrl', required=False)
    rating = serializers.FloatField(source='averageRating', read_only=True)
    totalJobs = serializers.IntegerField(source='jobsCompleted', read_only=True)
    verificationStatus = serializers.SerializerMethodField()

    # New blue-collar fields
    certifications = CertificationSerializer(many=True, read_only=True)
    portfolio_items = PortfolioSerializer(many=True, read_only=True)
    work_history = WorkHistorySerializer(many=True, read_only=True)
    notifications = NotificationSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'phoneNumber', 'name', 'age', 'pinCode', 'jobTypes',
            'workerType', 'photo', 'rating', 'totalJobs', 'verificationStatus',
            'isVerified', 'createdAt', 'verificationLevel', 'totalEarnings',
            'experienceYears', 'bio', 'certifications', 'portfolio_items', 'work_history',
            'gender', 'email', 'dateOfBirth', 'aadhaarNumber', 'latitude', 'longitude',
            'address', 'notifications'
        ]

    def get_verificationStatus(self, obj):
        if obj.verificationLevel == 'premium':
            return 'premium'
        elif obj.isVerified or obj.verificationLevel == 'verified':
            return 'verified'
        return 'pending'

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class PaymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentLog
        fields = '__all__'
