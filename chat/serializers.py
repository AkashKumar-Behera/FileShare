from rest_framework import serializers
from chat.models import Chat, Message
from devices.models import Device
from devices.serializers import DeviceSerializer
from django.contrib.auth.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()
    sender_device_id = serializers.SerializerMethodField()
    sender_user_id = serializers.IntegerField(source='sender.id', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender_device_id', 'sender_user_id', 'sender_name', 'sender_avatar', 'text', 'emoji', 'reply_to', 'is_read', 'file', 'file_name', 'file_size', 'file_type', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.first_name if obj.sender.first_name else obj.sender.username

    def get_sender_avatar(self, obj):
        device = Device.objects.filter(user=obj.sender).first()
        if not device and obj.sender.first_name:
            device = Device.objects.filter(username=obj.sender.first_name).first()
        return device.avatar if device else 'avatar_1'

    def get_sender_device_id(self, obj):
        device = Device.objects.filter(user=obj.sender).first()
        if not device and obj.sender.first_name:
            device = Device.objects.filter(username=obj.sender.first_name).first()
        return device.device_id if device else f"user_{obj.sender.id}"

class ChatSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'is_group', 'name', 'participants', 'last_message', 'unread_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_participants(self, obj):
        devices = []
        for user in obj.participants.all():
            device = Device.objects.filter(user=user).first()
            if not device:
                device = Device.objects.filter(username=user.first_name).first()
            if device:
                devices.append(DeviceSerializer(device).data)
            else:
                devices.append({
                    'device_id': f"user_{user.id}",
                    'username': user.first_name or user.username,
                    'device_name': 'Offline Device',
                    'avatar': 'avatar_1',
                    'is_online': False
                })
        return devices

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            # Try to get requesting user
            user = request.user
            if not user or user.is_anonymous:
                device_id = request.query_params.get('device_id')
                if device_id:
                    device = Device.objects.filter(device_id=device_id).first()
                    if device:
                        user = User.objects.filter(username=device.username).first()
            
            if user and not user.is_anonymous:
                return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return obj.messages.filter(is_read=False).count()

