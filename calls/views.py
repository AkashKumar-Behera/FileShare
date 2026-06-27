from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from calls.models import CallSession
from calls.serializers import CallSessionSerializer
from devices.models import Device
from django.utils import timezone

class CallSessionViewSet(viewsets.ModelViewSet):
    queryset = CallSession.objects.all()
    serializer_class = CallSessionSerializer

    def create(self, request, *args, **kwargs):
        caller_device_id = request.data.get('caller_device_id')
        callee_device_id = request.data.get('callee_device_id')
        
        try:
            caller = Device.objects.get(device_id=caller_device_id)
            callee = Device.objects.get(device_id=callee_device_id)
        except Device.DoesNotExist:
            return Response({"error": "Caller or Callee device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        call_session = serializer.save(caller=caller, callee=callee)
        
        return Response(CallSessionSerializer(call_session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        call_session = self.get_object()
        status_val = request.data.get('status')
        
        if status_val is not None:
            call_session.status = status_val
            if status_val in ['disconnected', 'rejected', 'missed']:
                call_session.ended_at = timezone.now()
            call_session.save()
            
        return Response(CallSessionSerializer(call_session).data)
