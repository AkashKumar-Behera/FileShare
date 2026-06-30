from rest_framework import serializers
from devices.models import Device

class DeviceSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, default='')
    class Meta:
        model = Device
        fields = ['id', 'device_id', 'username', 'device_name', 'avatar', 'ip_address', 'device_type', 'is_online', 'last_seen', 'user_email']
        read_only_fields = ['id', 'last_seen']
