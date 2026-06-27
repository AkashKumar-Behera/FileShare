from rest_framework import serializers
from calls.models import CallSession
from devices.serializers import DeviceSerializer

class CallSessionSerializer(serializers.ModelSerializer):
    caller_device = DeviceSerializer(source='caller', read_only=True)
    callee_device = DeviceSerializer(source='callee', read_only=True)
    
    caller_device_id = serializers.CharField(write_only=True)
    callee_device_id = serializers.CharField(write_only=True)

    class Meta:
        model = CallSession
        fields = [
            'id', 'session_id', 'caller_device', 'callee_device', 
            'caller_device_id', 'callee_device_id', 'call_type', 'status', 
            'created_at', 'ended_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data.pop('caller_device_id', None)
        validated_data.pop('callee_device_id', None)
        return super().create(validated_data)
