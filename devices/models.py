from django.db import models

class Device(models.Model):
    DEVICE_TYPES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('unknown', 'Unknown'),
    ]

    device_id = models.CharField(max_length=255, unique=True, db_index=True)
    username = models.CharField(max_length=150)
    device_name = models.CharField(max_length=150)
    avatar = models.CharField(max_length=100, default='avatar_1')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES, default='unknown')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.device_name} ({self.username})"
