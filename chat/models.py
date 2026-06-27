from django.db import models
from devices.models import Device

class Chat(models.Model):
    is_group = models.BooleanField(default=False)
    name = models.CharField(max_length=150, null=True, blank=True)
    participants = models.ManyToManyField(Device, related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.is_group:
            return self.name or f"Group Chat {self.id}"
        return f"Direct Chat {self.id}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    emoji = models.CharField(max_length=50, null=True, blank=True)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    # File attachment support
    file = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message {self.id} from {self.sender.username}"
