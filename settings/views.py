from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from settings.models import DeviceSettings
from settings.serializers import DeviceSettingsSerializer
from devices.models import Device

class DeviceSettingsViewSet(viewsets.ModelViewSet):
    queryset = DeviceSettings.objects.all()
    serializer_class = DeviceSettingsSerializer

    @action(detail=False, methods=['get', 'patch'])
    def device_settings(self, request):
        device_id = request.query_params.get('device_id')
        if not device_id:
            return Response({"error": "device_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            device = Device.objects.get(device_id=device_id)
            settings_obj, created = DeviceSettings.objects.get_or_create(device=device)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if request.method == 'PATCH':
            serializer = self.get_serializer(settings_obj, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        serializer = self.get_serializer(settings_obj)
        return Response(serializer.data)
