from django.contrib import admin
from .models import CallSession

@admin.register(CallSession)
class CallSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'caller', 'callee', 'call_type', 'status', 'created_at')
    list_filter = ('call_type', 'status')
    search_fields = ('session_id',)
