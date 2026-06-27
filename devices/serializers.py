from rest_framework import serializers
from devices.models import Device

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ['id', 'device_id', 'username', 'device_name', 'avatar', 'ip_address', 'device_type', 'is_online', 'last_seen']
        read_only_fields = ['id', 'last_seen']
