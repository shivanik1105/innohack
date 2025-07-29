from django.db import models
from decimal import Decimal

class User(models.Model):
    uid = models.CharField(max_length=128, unique=True, primary_key=True)
    userType = models.CharField(max_length=20, choices=[('daily', 'Daily'), ('skilled', 'Skilled')], default='daily')
    name = models.CharField(max_length=100, default='')
    age = models.IntegerField(null=True, blank=True)
    pinCode = models.CharField(max_length=10, default='000000')
    phoneNumber = models.CharField(max_length=20, unique=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    JobTypes = models.JSONField(default=list, null=True, blank=True)
    profilePhotoUrl = models.URLField(max_length=500, blank=True, null=True)
    skills = models.JSONField(default=list, null=True, blank=True)
    isVerified = models.BooleanField(default=False)
    ipfsHash = models.CharField(max_length=200, blank=True, null=True)
    averageRating = models.FloatField(default=0.0)
    jobsCompleted = models.IntegerField(default=0)

    # Required user fields
    gender = models.CharField(
        max_length=20,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('prefer-not-to-say', 'Prefer not to say')],
        default='prefer-not-to-say'
    )
    email = models.EmailField(max_length=254, blank=True, null=True)
    dateOfBirth = models.DateField(null=True, blank=True)
    aadhaarNumber = models.CharField(max_length=12, blank=True, null=True)

    # Location fields
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)

    # Enhanced blue-collar fields
    verificationLevel = models.CharField(
        max_length=20,
        choices=[('basic', 'Basic'), ('verified', 'Verified'), ('premium', 'Premium')],
        default='basic'
    )
    totalEarnings = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    experienceYears = models.IntegerField(default=0)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        if self.name:
            return f"{self.name} ({self.userType})"
        return f"{self.uid} ({self.userType})"

class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    payPerDay = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=200)
    pincode = models.CharField(max_length=10)
    contractorContact = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='open')
    postedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs', null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    # Additional fields for enhanced job matching
    jobType = models.CharField(max_length=50, blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    wage = models.IntegerField(default=0)  # Daily wage
    postedAt = models.DateTimeField(auto_now_add=True)

    # Location coordinates for distance-based matching
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Additional job metadata
    duration_days = models.IntegerField(default=1)
    urgency = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    employer_rating = models.FloatField(default=4.0)

    def __str__(self):
        return self.title

class Rating(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_received')
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given')
    stars = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

class PaymentLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    paymentStatus = models.CharField(max_length=20, default='Pending')

    class Meta:
        unique_together = ('user', 'job')

class Certification(models.Model):
    CERT_TYPES = [
        ('government', 'Government Issued'),
        ('ngo', 'NGO Training'),
        ('private', 'Private Institution'),
        ('reference', 'Job Reference')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=CERT_TYPES)
    imageUrl = models.URLField(max_length=500)
    isVerified = models.BooleanField(default=False)
    verificationData = models.JSONField(default=dict, blank=True)  # OCR extracted data
    uploadedAt = models.DateTimeField(auto_now_add=True)
    verifiedAt = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.user.name}"

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=200)
    description = models.TextField()
    imageUrl = models.URLField(max_length=500)
    location = models.CharField(max_length=200)
    completedAt = models.DateField()
    skills = models.JSONField(default=list)  # Skills demonstrated in this work
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.name}"

class WorkHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_history')
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    startDate = models.DateField()
    endDate = models.DateField()
    rating = models.ForeignKey(Rating, on_delete=models.SET_NULL, null=True, blank=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.name} - {self.job.title}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('job_match', 'Job Match'),
        ('rating', 'Rating'),
        ('payment', 'Payment'),
        ('verification', 'Verification'),
        ('general', 'General')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general')
    isRead = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    actionUrl = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.title} - {self.user.name}"
