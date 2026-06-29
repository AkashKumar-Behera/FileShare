from django.db import models
from django.contrib.auth.models import User

class Device(models.Model):
    DEVICE_TYPES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('unknown', 'Unknown'),
    ]

    device_id = models.CharField(max_length=255, unique=True, db_index=True)
    username = models.CharField(max_length=150)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='devices')
    device_name = models.CharField(max_length=150)
    avatar = models.TextField(null=True, blank=True, default='avatar_1')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES, default='unknown')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.device_name} ({self.username})"

