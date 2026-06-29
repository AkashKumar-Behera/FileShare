from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('device_name', 'username', 'device_type', 'ip_address', 'is_online', 'last_seen')
    list_filter = ('is_online', 'device_type')
    search_fields = ('device_name', 'username', 'ip_address', 'device_id')
