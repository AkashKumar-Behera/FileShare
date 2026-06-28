from rest_framework import serializers
from chat.models import Chat, Message
from devices.serializers import DeviceSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar', read_only=True)
    sender_device_id = serializers.CharField(source='sender.device_id', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender_device_id', 'sender_name', 'sender_avatar', 'text', 'emoji', 'reply_to', 'is_read', 'file', 'file_name', 'file_size', 'file_type', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    participants = DeviceSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'is_group', 'name', 'participants', 'last_message', 'unread_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            device_id = request.query_params.get('device_id')
            if device_id:
                return obj.messages.filter(is_read=False).exclude(sender__device_id=device_id).count()
        return obj.messages.filter(is_read=False).count()
