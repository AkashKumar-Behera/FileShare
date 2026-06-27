from django.db import models
from devices.models import Device

class Transfer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('transferring', 'Transferring'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Failed'),
    ]

    transfer_id = models.CharField(max_length=255, unique=True, db_index=True)
    sender = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='sent_transfers')
    receiver = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='received_transfers')
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.FloatField(default=0.0)
    speed = models.FloatField(default=0.0)
    eta = models.IntegerField(null=True, blank=True)
    sha256 = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transfer {self.transfer_id} - {self.file_name}"

class TransferChunk(models.Model):
    transfer = models.ForeignKey(Transfer, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('transfer', 'chunk_index')
