from django.contrib import admin
from .models import Transfer

@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ('transfer_id', 'sender', 'receiver', 'file_name', 'file_size', 'status', 'progress', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('file_name', 'transfer_id')
