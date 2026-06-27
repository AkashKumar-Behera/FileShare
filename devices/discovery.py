import socket
import logging
import threading
from zeroconf import IPVersion, ServiceInfo, Zeroconf, ServiceBrowser, ServiceListener
from django.utils import timezone

logger = logging.getLogger(__name__)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class LANServiceListener(ServiceListener):
    def update_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        pass

    def remove_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        from devices.models import Device
        # Extract device_id from service name if name format is "<device_id>._fileshare._tcp.local."
        device_id = name.split('.')[0]
        try:
            device = Device.objects.get(device_id=device_id)
            device.is_online = False
            device.save()
            logger.info(f"mDNS Device offline: {device_id}")
        except Device.DoesNotExist:
            pass

    def add_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        from devices.models import Device
        from settings.models import DeviceSettings
        info = zc.get_service_info(type_, name)
        if not info:
            return

        # Parse properties (TXT records)
        properties = {}
        for k, v in info.properties.items():
            try:
                properties[k.decode('utf-8')] = v.decode('utf-8')
            except Exception:
                pass

        device_id = properties.get('device_id')
        username = properties.get('username')
        device_name = properties.get('device_name')
        avatar = properties.get('avatar', 'avatar_1')
        device_type = properties.get('device_type', 'unknown')

        # Get IP address
        addresses = info.parsed_addresses()
        ip = addresses[0] if addresses else None

        if device_id and username and device_name:
            device, created = Device.objects.get_or_create(
                device_id=device_id,
                defaults={
                    'username': username,
                    'device_name': device_name,
                    'avatar': avatar,
                    'device_type': device_type,
                    'ip_address': ip,
                    'is_online': True,
                    'last_seen': timezone.now()
                }
            )

            if not created:
                device.username = username
                device.device_name = device_name
                device.avatar = avatar
                device.device_type = device_type
                if ip:
                    device.ip_address = ip
                device.is_online = True
                device.last_seen = timezone.now()
                device.save()

            # Create default settings if needed
            DeviceSettings.objects.get_or_create(device=device)
            logger.info(f"mDNS Device discovered/updated: {device_name} ({ip})")

class DiscoveryService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if not cls._instance:
                cls._instance = super(DiscoveryService, cls).__new__(cls, *args, **kwargs)
                cls._instance.zeroconf = None
                cls._instance.browser = None
                cls._instance.service_info = None
        return cls._instance

    def start(self, self_device_id, username, device_name, device_type, avatar='avatar_1', port=8000):
        if self.zeroconf:
            logger.info("Discovery service already running.")
            return

        local_ip = get_local_ip()
        self.zeroconf = Zeroconf(ip_version=IPVersion.V4Only)

        desc = {
            'device_id': self_device_id,
            'username': username,
            'device_name': device_name,
            'device_type': device_type,
            'avatar': avatar,
        }

        self.service_info = ServiceInfo(
            "_fileshare._tcp.local.",
            f"{self_device_id}._fileshare._tcp.local.",
            addresses=[socket.inet_aton(local_ip)],
            port=port,
            properties=desc,
        )

        try:
            self.zeroconf.register_service(self.service_info)
            logger.info(f"Registered mDNS service for {device_name} at {local_ip}:{port}")
        except Exception as e:
            logger.error(f"Failed to register mDNS service: {e}")

        # Start browsing for other instances
        listener = LANServiceListener()
        self.browser = ServiceBrowser(self.zeroconf, "_fileshare._tcp.local.", listener)

    def stop(self):
        if self.zeroconf:
            if self.browser:
                self.browser.cancel()
            if self.service_info:
                try:
                    self.zeroconf.unregister_service(self.service_info)
                except Exception:
                    pass
            self.zeroconf.close()
            self.zeroconf = None
            self.browser = None
            self.service_info = None
            logger.info("mDNS Discovery service stopped.")
