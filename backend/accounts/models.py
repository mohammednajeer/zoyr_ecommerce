from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta



class User(AbstractUser):
    role = models.CharField(max_length=20,default="user")
    status = models.CharField(max_length=20,default="active")
    is_verified = models.BooleanField(default=False)


class EmailOTP(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)
    
    