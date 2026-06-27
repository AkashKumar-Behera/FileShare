from rest_framework import serializers
from settings.models import DeviceSettings

class DeviceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceSettings
        fields = ['id', 'theme', 'language', 'downloads_folder', 'auto_accept', 'bandwidth_limit', 'notifications_enabled', 'privacy_mode']
        read_only_fields = ['id']
