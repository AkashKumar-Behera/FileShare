from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from chat.models import Chat, Message
from chat.serializers import ChatSerializer, MessageSerializer
from devices.models import Device
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# In-memory typing status registry: key = f"{chat_id}_{device_id}" -> dict
_typing_states = {}

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    @action(detail=False, methods=['get'])
    def device_chats(self, request):
        device_id = request.query_params.get('device_id')
        if not device_id:
            return Response({"error": "device_id parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            device = Device.objects.get(device_id=device_id)
            chats = Chat.objects.filter(participants=device)
            serializer = self.get_serializer(chats, many=True)
            return Response(serializer.data)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.filter(is_deleted=False).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def delete_message(self, request):
        message_id = request.data.get('message_id')
        if not message_id:
            return Response({"error": "message_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_deleted = True
            msg.save()
            return Response({"status": "deleted"})
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def edit_message(self, request):
        message_id = request.data.get('message_id')
        new_text = request.data.get('text', '')
        if not message_id:
            return Response({"error": "message_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            msg = Message.objects.get(id=message_id)
            msg.text = new_text
            msg.save()
            return Response({"status": "edited", "text": new_text})
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)



    @action(detail=False, methods=['post'])
    def get_or_create_direct(self, request):
        sender_id = request.data.get('sender_id')
        receiver_id = request.data.get('receiver_id')
        if not sender_id or not receiver_id:
            return Response({"error": "sender_id and receiver_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sender = Device.objects.get(device_id=sender_id)
            receiver = Device.objects.get(device_id=receiver_id)
        except Device.DoesNotExist:
            return Response({"error": "Sender or receiver device not found"}, status=status.HTTP_444_NOT_FOUND)
            
        chats = Chat.objects.filter(is_group=False, participants=sender).filter(participants=receiver)
        if chats.exists():
            chat = chats.first()
        else:
            chat = Chat.objects.create(is_group=False)
            chat.participants.add(sender, receiver)
            
        serializer = self.get_serializer(chat)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        sender_id = request.data.get('sender_id')
        text = request.data.get('text', '')
        emoji = request.data.get('emoji', None)
        
        if not sender_id or not text:
            return Response({"error": "sender_id and text are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            sender = Device.objects.get(device_id=sender_id)
        except Device.DoesNotExist:
            return Response({"error": "Sender device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        message = Message.objects.create(
            chat=chat,
            sender=sender,
            text=text,
            emoji=emoji
        )
        
        # Reset typing state when message is sent
        key = f"{chat.id}_{sender_id}"
        if key in _typing_states:
            _typing_states[key]["is_typing"] = False
            
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        chat = self.get_object()
        sender_id = request.data.get('sender_id')
        files = request.FILES.getlist('files')
        
        if not sender_id:
            return Response({"error": "sender_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not files:
            return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            sender = Device.objects.get(device_id=sender_id)
        except Device.DoesNotExist:
            return Response({"error": "Sender device not found"}, status=status.HTTP_404_NOT_FOUND)
            
        messages_created = []
        channel_layer = get_channel_layer()
        
        for file in files:
            message = Message.objects.create(
                chat=chat,
                sender=sender,
                text=f"Shared attachment: {file.name}",
                file=file,
                file_name=file.name,
                file_size=file.size,
                file_type=file.content_type
            )
            
            msg_data = MessageSerializer(message).data
            
            # Broadcast the message to participants in the WebSocket group
            for p in chat.participants.all():
                async_to_sync(channel_layer.group_send)(
                    f"device_{p.device_id}",
                    {
                        "type": "chat_message_relay",
                        "message": msg_data,
                    }
                )
            messages_created.append(msg_data)
            
        return Response(messages_created, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def set_typing(self, request, pk=None):
        chat_id = pk
        sender_id = request.data.get('sender_id')
        is_typing = request.data.get('is_typing', False)
        
        if not sender_id:
            return Response({"error": "sender_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        key = f"{chat_id}_{sender_id}"
        _typing_states[key] = {
            "is_typing": is_typing,
            "last_updated": timezone.now()
        }
        return Response({"status": "success"})

    @action(detail=True, methods=['get'])
    def typing_status(self, request, pk=None):
        chat_id = pk
        exclude_id = request.query_params.get('exclude_id')
        
        if not exclude_id:
            return Response({"error": "exclude_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        chat = self.get_object()
        other_participants = chat.participants.exclude(device_id=exclude_id)
        
        typing_users = []
        for p in other_participants:
            key = f"{chat_id}_{p.device_id}"
            state = _typing_states.get(key)
            if state and state["is_typing"]:
                time_diff = timezone.now() - state["last_updated"]
                if time_diff.total_seconds() < 4:
                    typing_users.append(p.username or p.device_name)
                    
        return Response({"typing_users": typing_users})
