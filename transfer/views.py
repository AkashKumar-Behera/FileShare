import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.http import FileResponse, Http404
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

    @action(detail=False, methods=['post'])
    def upload_chunk(self, request):
        transfer_id = request.data.get('transfer_id')
        chunk_index = int(request.data.get('chunk_index', 0))
        total_chunks = int(request.data.get('total_chunks', 1))
        chunk_file = request.FILES.get('chunk')

        if not transfer_id or not chunk_file:
            return Response({"error": "transfer_id and chunk file required"}, status=status.HTTP_400_BAD_REQUEST)

        temp_dir = os.path.join(settings.MEDIA_ROOT, 'chunks', str(transfer_id))
        os.makedirs(temp_dir, exist_ok=True)

        chunk_path = os.path.join(temp_dir, f"part_{chunk_index}")
        with open(chunk_path, 'wb+') as destination:
            for c in chunk_file.chunks():
                destination.write(c)

        # Check if all chunks received to merge into final file
        existing_chunks = len([f for f in os.listdir(temp_dir) if f.startswith("part_")])
        if existing_chunks >= total_chunks:
            try:
                transfer = Transfer.objects.get(id=transfer_id)
                final_dir = os.path.join(settings.MEDIA_ROOT, 'transfers')
                os.makedirs(final_dir, exist_ok=True)
                final_filename = f"{transfer.id}_{transfer.file_name}"
                final_path = os.path.join(final_dir, final_filename)

                with open(final_path, 'wb') as outfile:
                    for i in range(total_chunks):
                        part_file = os.path.join(temp_dir, f"part_{i}")
                        if os.path.exists(part_file):
                            with open(part_file, 'rb') as infile:
                                outfile.write(infile.read())
                            os.remove(part_file)
                
                try:
                    os.rmdir(temp_dir)
                except Exception:
                    pass

                transfer.status = 'completed'
                transfer.progress = 1.0
                transfer.save()
                return Response({"status": "completed", "file_url": f"/media/transfers/{final_filename}"})
            except Exception as e:
                return Response({"error": f"Merge failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "chunk_received", "received": existing_chunks, "total": total_chunks})

    @action(detail=True, methods=['get'])
    def download_file(self, request, pk=None):
        try:
            transfer = self.get_object()
            final_filename = f"{transfer.id}_{transfer.file_name}"
            file_path = os.path.join(settings.MEDIA_ROOT, 'transfers', final_filename)
            if not os.path.exists(file_path):
                raise Http404("File not found on server disk")
            return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=transfer.file_name)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

