from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    role = models.CharField(max_length=20,default="user")
    status = models.CharField(max_length=20,default="active")
