# In your Django app's models.py
from django.db import models

class User(models.Model):
    # Common Fields for ALL users
    uid = models.CharField(max_length=128, unique=True, primary_key=True)
    userType = models.CharField(max_length=20, choices=[('daily', 'Daily'), ('skilled', 'Skilled')],default='daily')
    name = models.CharField(max_length=100,default='')
    age = models.IntegerField(null=True, blank=True)
    pincode = models.CharField(max_length=10,default='000000')
    phoneNumber = models.CharField(max_length=20, unique=True,null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    # Fields for Daily Wage Workers
    dailyJobTypes = models.JSONField(default=list, null=True, blank=True) # e.g., ["helper", "loader"]

    # Fields for Skilled (Blue-Collar) Workers
    profilePhotoUrl = models.URLField(max_length=500, blank=True, null=True)
    skills = models.JSONField(default=list, null=True, blank=True) # e.g., ["plumber", "electrician"]
    isVerified = models.BooleanField(default=False)
    ipfsHash = models.CharField(max_length=200, blank=True, null=True) # For certificate
    averageRating = models.FloatField(default=0.0)
    jobsCompleted = models.IntegerField(default=0)

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
    status = models.CharField(max_length=20, default='open') # 'open', 'in_progress', 'completed'
    postedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs', null=True) # Assuming contractors are also users
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Rating(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_received')
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given')
    stars = models.IntegerField() # 1 to 5
    comment = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.stars} stars for {self.worker.name} on job {self.job.title}"

# Optional model for the private payment log
class PaymentLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    paymentStatus = models.CharField(max_length=20, default='Pending') # 'Paid' or 'Pending'

    class Meta:
        unique_together = ('user', 'job') # A user can only log a job once

