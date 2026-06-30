import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.http import FileResponse, Http404
from transfer.models import Transfer
from transfer.serializers import TransferSerializer
from devices.models import Device

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from django.db.models import Q

from django.utils import timezone

def cleanup_expired_transfers():
    try:
        expiry_threshold = timezone.now() - timezone.timedelta(hours=1)
        expired = Transfer.objects.filter(created_at__lt=expiry_threshold)
        for t in expired:
            file_path = os.path.join(settings.MEDIA_ROOT, 'transfers', f"{t.id}_{t.file_name}")
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
            t.delete()
    except Exception:
        pass

@method_decorator(csrf_exempt, name='dispatch')
class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer

    def list(self, request, *args, **kwargs):
        cleanup_expired_transfers()
        return super().list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        transfer = self.get_object()
        file_path = os.path.join(settings.MEDIA_ROOT, 'transfers', f"{transfer.id}_{transfer.file_name}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        cleanup_expired_transfers()
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
        cleanup_expired_transfers()
        device_id = request.query_params.get('device_id')
        if not device_id:
            return Response({"error": "device_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            device = Device.objects.get(device_id=device_id)
            user = device.user
            username = device.username
        except Device.DoesNotExist:
            user = None
            username = None

        filters = Q(sender__device_id=device_id) | Q(receiver__device_id=device_id)

        if user:
            filters |= Q(sender__user=user) | Q(receiver__user=user)
        if username:
            filters |= Q(sender__username=username) | Q(receiver__username=username)

        transfers = Transfer.objects.filter(filters).distinct()
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

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], authentication_classes=[])
    def download_file(self, request, pk=None):
        try:
            transfer = self.get_object()
            file_path = os.path.join(settings.MEDIA_ROOT, 'transfers', f"{transfer.id}_{transfer.file_name}")
            if not os.path.exists(file_path):
                file_path = os.path.join(settings.MEDIA_ROOT, 'chat_attachments', transfer.file_name)
                if not os.path.exists(file_path):
                    raise Http404("File not found on server disk")
            return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=transfer.file_name)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], authentication_classes=[])
    def public_files(self, request):
        cleanup_expired_transfers()
        transfers = Transfer.objects.filter(status='completed').order_by('-created_at')
        serializer = self.get_serializer(transfers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], authentication_classes=[])
    def public_download_file(self, request, pk=None):
        try:
            transfer = self.get_object()
            file_path = os.path.join(settings.MEDIA_ROOT, 'transfers', f"{transfer.id}_{transfer.file_name}")
            if not os.path.exists(file_path):
                file_path = os.path.join(settings.MEDIA_ROOT, 'chat_attachments', transfer.file_name)
                if not os.path.exists(file_path):
                    raise Http404("File not found on server disk")
            return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=transfer.file_name)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

