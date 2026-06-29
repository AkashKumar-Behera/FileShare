from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from devices.models import Device
from devices.serializers import DeviceSerializer
from settings.models import DeviceSettings
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
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

        # Link user if they are logged in
        if request.user.is_authenticated:
            device.user = request.user
            device.save()
        else:
            from django.contrib.auth.models import User
            user = User.objects.filter(username=username).first()
            if user:
                device.user = user
                device.save()

        # Copy avatar from other devices of the same user if current is default
        if device.user and (device.avatar == 'avatar_1' or not device.avatar):
            other_dev = Device.objects.filter(user=device.user).exclude(avatar='').exclude(avatar='avatar_1').first()
            if other_dev:
                device.avatar = other_dev.avatar
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
        
        # Keep registered devices active and check heartbeat (6s register interval, so 30s threshold is safe)
        threshold = timezone.now() - timezone.timedelta(seconds=30)
        Device.objects.filter(is_online=True, last_seen__lt=threshold).update(is_online=False)

        # Clean up stale devices not seen in the last 3 days
        stale_threshold = timezone.now() - timezone.timedelta(days=3)
        Device.objects.filter(last_seen__lt=stale_threshold).delete()
        
        queryset = Device.objects.filter(is_online=True)
        if exclude_id:
            queryset = queryset.exclude(device_id=exclude_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        device_id = request.data.get('device_id')
        file = request.FILES.get('avatar_file')
        
        if not device_id or not file:
            return Response({"error": "device_id and avatar_file are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            device = Device.objects.get(device_id=device_id)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Save file to media/avatars/
        import os
        from django.conf import settings
        from django.core.files.storage import default_storage
        
        avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        if not os.path.exists(avatar_dir):
            os.makedirs(avatar_dir)
            
        ext = os.path.splitext(file.name)[1]
        filename = f"{device.username}_{device_id[:6]}{ext}"
        filepath = os.path.join('avatars', filename)
        full_filepath = os.path.join(settings.MEDIA_ROOT, filepath)
        
        if os.path.exists(full_filepath):
            os.remove(full_filepath)
            
        path = default_storage.save(filepath, file)
        avatar_url = f"{settings.MEDIA_URL}{path}"
        
        # Update device avatar
        device.avatar = avatar_url
        device.save()
        
        return Response({"avatar_url": avatar_url}, status=status.HTTP_200_OK)

