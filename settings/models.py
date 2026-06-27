from django.db import models
from devices.models import Device

class DeviceSettings(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE, related_name='settings')
    theme = models.CharField(max_length=20, default='system')
    language = models.CharField(max_length=10, default='en')
    downloads_folder = models.CharField(max_length=255, default='Downloads')
    auto_accept = models.BooleanField(default=False)
    bandwidth_limit = models.IntegerField(null=True, blank=True)
    notifications_enabled = models.BooleanField(default=True)
    privacy_mode = models.CharField(max_length=20, default='public')

    def __str__(self):
        return f"Settings for {self.device.device_name}"
