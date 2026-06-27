from django.db import models
from devices.models import Device

class CallSession(models.Model):
    CALL_TYPES = [
        ('voice', 'Voice'),
        ('video', 'Video'),
        ('screen', 'Screen Share'),
    ]

    STATUS_CHOICES = [
        ('ringing', 'Ringing'),
        ('connected', 'Connected'),
        ('disconnected', 'Disconnected'),
        ('rejected', 'Rejected'),
        ('missed', 'Missed'),
    ]

    session_id = models.CharField(max_length=255, unique=True, db_index=True)
    caller = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='initiated_calls')
    callee = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='received_calls')
    call_type = models.CharField(max_length=20, choices=CALL_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ringing')
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Call {self.session_id} ({self.call_type}) - {self.status}"
