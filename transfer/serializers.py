from rest_framework import serializers
from transfer.models import Transfer
from devices.serializers import DeviceSerializer

class TransferSerializer(serializers.ModelSerializer):
    sender_device = DeviceSerializer(source='sender', read_only=True)
    receiver_device = DeviceSerializer(source='receiver', read_only=True)
    
    sender_device_id = serializers.CharField(write_only=True)
    receiver_device_id = serializers.CharField(write_only=True)

    class Meta:
        model = Transfer
        fields = [
            'id', 'transfer_id', 'sender_device', 'receiver_device', 
            'sender_device_id', 'receiver_device_id', 'file_name', 'file_size', 
            'file_type', 'status', 'progress', 'speed', 'eta', 'sha256', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data.pop('sender_device_id', None)
        validated_data.pop('receiver_device_id', None)
        return super().create(validated_data)
