from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from transfer.models import Transfer
from transfer.serializers import TransferSerializer
from devices.models import Device

class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer

    def create(self, request, *args, **kwargs):
        sender_device_id = request.data.get('sender_device_id')
        receiver_device_id = request.data.get('receiver_device_id')
        
        try:
            sender = Device.objects.get(device_id=sender_device_id)
            receiver = Device.objects.get(device_id=receiver_device_id)
        except Device.DoesNotExist:
            return Response({"error": "Sender or Receiver device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        transfer = serializer.save(sender=sender, receiver=receiver)
        
        return Response(TransferSerializer(transfer).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def device_transfers(self, request):
        device_id = request.query_params.get('device_id')
        if not device_id:
            return Response({"error": "device_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        transfers = Transfer.objects.filter(sender__device_id=device_id) | Transfer.objects.filter(receiver__device_id=device_id)
        serializer = self.get_serializer(transfers.order_by('-created_at'), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        transfer = self.get_object()
        progress = request.data.get('progress')
        status_val = request.data.get('status')
        speed = request.data.get('speed')
        eta = request.data.get('eta')
        
        if progress is not None:
            transfer.progress = float(progress)
        if status_val is not None:
            transfer.status = status_val
        if speed is not None:
            transfer.speed = float(speed)
        if eta is not None:
            transfer.eta = int(eta)
            
        transfer.save()
        return Response(TransferSerializer(transfer).data)
