from django.db import models
from devices.models import Device

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('incoming_call', 'Incoming Call'),
        ('incoming_file', 'Incoming File'),
        ('transfer_completed', 'Transfer Completed'),
        ('device_connected', 'Device Connected'),
        ('system', 'System'),
    ]

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.device.username}: {self.title}"
