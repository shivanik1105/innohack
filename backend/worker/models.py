from django.db import models

class User(models.Model):
    uid = models.CharField(max_length=128, unique=True, primary_key=True)
    userType = models.CharField(max_length=20, choices=[('daily', 'Daily'), ('skilled', 'Skilled')], default='daily')
    name = models.CharField(max_length=100, default='')
    age = models.IntegerField(null=True, blank=True)
    pincode = models.CharField(max_length=10, default='000000')
    phoneNumber = models.CharField(max_length=20, unique=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    dailyJobTypes = models.JSONField(default=list, null=True, blank=True)
    profilePhotoUrl = models.URLField(max_length=500, blank=True, null=True)
    skills = models.JSONField(default=list, null=True, blank=True)
    isVerified = models.BooleanField(default=False)
    ipfsHash = models.CharField(max_length=200, blank=True, null=True)
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
    status = models.CharField(max_length=20, default='open')
    postedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs', null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

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
