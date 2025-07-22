from djongo import models

class User(models.Model):
    phone = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    pin_code = models.CharField(max_length=10, null=True, blank=True)
    job_types = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    available_today = models.BooleanField(default=False)
    profile_photo = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    certifications = models.JSONField(default=list)
    portfolio = models.JSONField(default=list)
    work_history = models.JSONField(default=list)
    rating = models.FloatField(default=0.0)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.phone
