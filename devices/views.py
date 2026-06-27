from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from devices.models import Device
from devices.serializers import DeviceSerializer
from settings.models import DeviceSettings
from django.utils import timezone

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        device_id = request.data.get('device_id')
        username = request.data.get('username')
        device_name = request.data.get('device_name')
        avatar = request.data.get('avatar', 'avatar_1')
        device_type = request.data.get('device_type', 'unknown')
        
        if not device_id or not username or not device_name:
            return Response({"error": "Missing device_id, username or device_name"}, status=status.HTTP_400_BAD_REQUEST)
            
        client_ip = request.META.get('REMOTE_ADDR')

        device, created = Device.objects.get_or_create(
            device_id=device_id,
            defaults={
                'username': username,
                'device_name': device_name,
                'avatar': avatar,
                'device_type': device_type,
                'ip_address': client_ip,
                'is_online': True,
                'last_seen': timezone.now()
            }
        )

        if not created:
            device.username = username
            device.device_name = device_name
            device.avatar = avatar
            device.device_type = device_type
            device.ip_address = client_ip
            device.is_online = True
            device.last_seen = timezone.now()
            device.save()

        # Create settings if they don't exist
        DeviceSettings.objects.get_or_create(device=device)

        # Start LAN discovery service
        from devices.discovery import DiscoveryService
        try:
            discovery = DiscoveryService()
            discovery.start(
                self_device_id=device.device_id,
                username=device.username,
                device_name=device.device_name,
                device_type=device.device_type,
                avatar=device.avatar,
                port=8000
            )
        except Exception as e:
            # Don't fail registration if mDNS fails (e.g. missing socket bindings)
            pass

        serializer = self.get_serializer(device)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def online_devices(self, request):
        exclude_id = request.query_params.get('exclude_id')
        
        # Consider a device offline if it hasn't updated its presence in the last 20 seconds
        threshold = timezone.now() - timezone.timedelta(seconds=20)
        Device.objects.filter(is_online=True, last_seen__lt=threshold).update(is_online=False)
        
        queryset = Device.objects.filter(is_online=True)
        if exclude_id:
            queryset = queryset.exclude(device_id=exclude_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
