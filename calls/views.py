import time
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from calls.models import CallSession
from calls.serializers import CallSessionSerializer
from devices.models import Device
from django.utils import timezone

# In-memory session tracking for active single-to-many screen sharing
ACTIVE_SCREEN_SHARE = {
    "active": False,
    "presenter_name": None,
    "presenter_device_id": None,
    "session_id": None,
    "started_at": None,
    "audio_enabled": True,
}

# WebRTC signaling queue buffer & live frame cache
WEBRTC_SIGNAL_BUFFER = {}
LIVE_SCREEN_FRAME = None

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

    @action(detail=False, methods=['get', 'post'])
    def active_screen_share(self, request):
        global ACTIVE_SCREEN_SHARE, WEBRTC_SIGNAL_BUFFER, LIVE_SCREEN_FRAME
        if request.method == 'GET':
            return Response(ACTIVE_SCREEN_SHARE)

        act = request.data.get('action')
        dev_id = request.data.get('device_id')
        dev_name = request.data.get('device_name', 'PC User')
        audio_opt = request.data.get('audio_enabled', True)

        if act == 'start':
            # Strict Single Presenter Check
            if ACTIVE_SCREEN_SHARE["active"] and ACTIVE_SCREEN_SHARE["presenter_device_id"] != dev_id:
                return Response({
                    "error": f"Screen share is already active by {ACTIVE_SCREEN_SHARE['presenter_name']}. Only one user can share at a time."
                }, status=status.HTTP_409_CONFLICT)

            sess_id = f"screen-{int(time.time())}"
            ACTIVE_SCREEN_SHARE = {
                "active": True,
                "presenter_name": dev_name,
                "presenter_device_id": dev_id,
                "session_id": sess_id,
                "started_at": timezone.now().isoformat(),
                "audio_enabled": audio_opt
            }
            WEBRTC_SIGNAL_BUFFER = {}
            LIVE_SCREEN_FRAME = None
            return Response(ACTIVE_SCREEN_SHARE, status=status.HTTP_200_OK)

        elif act == 'stop':
            if ACTIVE_SCREEN_SHARE["presenter_device_id"] == dev_id or not dev_id:
                ACTIVE_SCREEN_SHARE = {
                    "active": False,
                    "presenter_name": None,
                    "presenter_device_id": None,
                    "session_id": None,
                    "started_at": None,
                    "audio_enabled": True
                }
                WEBRTC_SIGNAL_BUFFER = {}
                LIVE_SCREEN_FRAME = None
            return Response(ACTIVE_SCREEN_SHARE, status=status.HTTP_200_OK)

        elif act == 'toggle_audio':
            if ACTIVE_SCREEN_SHARE["presenter_device_id"] == dev_id:
                ACTIVE_SCREEN_SHARE["audio_enabled"] = bool(audio_opt)
            return Response(ACTIVE_SCREEN_SHARE, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'post'])
    def signal(self, request):
        global WEBRTC_SIGNAL_BUFFER, ACTIVE_SCREEN_SHARE
        if request.method == 'GET':
            dev_id = request.query_params.get('device_id')
            if not dev_id:
                return Response([])
            signals = WEBRTC_SIGNAL_BUFFER.pop(dev_id, [])
            return Response(signals)

        # POST signaling message (offer, answer, ice-candidate, join)
        to_dev = request.data.get('to_device')
        from_dev = request.data.get('from_device')
        sig_data = request.data.get('signal')

        if to_dev == 'presenter' and ACTIVE_SCREEN_SHARE.get('presenter_device_id'):
            to_dev = ACTIVE_SCREEN_SHARE['presenter_device_id']

        if not to_dev or not sig_data:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        if to_dev not in WEBRTC_SIGNAL_BUFFER:
            WEBRTC_SIGNAL_BUFFER[to_dev] = []
        WEBRTC_SIGNAL_BUFFER[to_dev].append({
            "from_device": from_dev,
            "signal": sig_data,
            "timestamp": time.time()
        })
        return Response({"status": "queued"})

    @action(detail=False, methods=['get', 'post'])
    def live_frame(self, request):
        global LIVE_SCREEN_FRAME
        if request.method == 'GET':
            return Response({"frame": LIVE_SCREEN_FRAME})
        
        frame_data = request.data.get('frame')
        dev_id = request.data.get('device_id')
        if ACTIVE_SCREEN_SHARE["active"] and ACTIVE_SCREEN_SHARE["presenter_device_id"] == dev_id:
            LIVE_SCREEN_FRAME = frame_data
            return Response({"status": "updated"})
        return Response({"status": "ignored"})


