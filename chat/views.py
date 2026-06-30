from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from chat.models import Chat, Message
from chat.serializers import ChatSerializer, MessageSerializer
from devices.models import Device
from django.contrib.auth.models import User
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# In-memory typing status registry: key = f"{chat_id}_{user_id}" -> dict
_typing_states = {}

def get_user_from_id_or_device(val):
    if not val:
        return None
    # 1. Check if it's a device_id
    device = Device.objects.filter(device_id=val).first()
    if device:
        if device.user:
            return device.user
        if device.username:
            user = User.objects.filter(username=device.username).first()
            if user:
                return user
            user = User.objects.filter(email=device.username).first()
            if user:
                return user
    # 2. Check if it's a user ID
    try:
        user = User.objects.get(id=int(val))
        return user
    except (ValueError, User.DoesNotExist):
        pass
    # 3. Check if it's a username or email
    user = User.objects.filter(username=val).first()
    if user:
        return user
    user = User.objects.filter(email=val).first()
    if user:
        return user
    return None

from django.db.models import Q

def get_devices_for_user(user):
    if not user:
        return Device.objects.none()
    return Device.objects.filter(
        Q(user=user) | 
        Q(username=user.first_name) | 
        Q(username=user.username)
    ).distinct()

import os
from django.conf import settings

def cleanup_expired_messages():
    try:
        expiry_threshold = timezone.now() - timezone.timedelta(hours=1)
        expired_messages = Message.objects.filter(
            is_deleted=False,
            created_at__lt=expiry_threshold
        ).exclude(file='')

        for msg in expired_messages:
            if msg.file:
                try:
                    file_path = msg.file.path
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception:
                    pass
            msg.is_deleted = True
            msg.save()
    except Exception:
        pass

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    @action(detail=False, methods=['get'])
    def device_chats(self, request):
        device_id = request.query_params.get('device_id')
        if not device_id:
            return Response({"error": "device_id parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_user_from_id_or_device(device_id)
        if not user:
            return Response({"error": "User not found for this device"}, status=status.HTTP_404_NOT_FOUND)
            
        # Ensure user is in the global Common Group
        common_group, created = Chat.objects.get_or_create(is_group=True, name="Common Group")
        if not common_group.participants.filter(id=user.id).exists():
            common_group.participants.add(user)
            
        chats = Chat.objects.filter(participants=user)
        serializer = self.get_serializer(chats, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        cleanup_expired_messages()
        chat = self.get_object()
        messages = chat.messages.filter(is_deleted=False).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def delete_message(self, request):
        message_id = request.data.get('message_id')
        if message_id is None:
            return Response({"error": "message_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            msg = Message.objects.get(id=int(message_id))
            msg.is_deleted = True
            msg.save()
            return Response({"status": "deleted"})
        except (Message.DoesNotExist, ValueError):
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
        
        sender = get_user_from_id_or_device(sender_id)
        receiver = get_user_from_id_or_device(receiver_id)
        
        if not sender or not receiver:
            return Response({"error": "Sender or receiver not found"}, status=status.HTTP_404_NOT_FOUND)
            
        chats = Chat.objects.filter(is_group=False, participants=sender).filter(participants=receiver)
        if chats.exists():
            chat = chats.first()
        else:
            chat = Chat.objects.create(is_group=False)
            chat.participants.add(sender, receiver)
            
        serializer = self.get_serializer(chat)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def get_or_create_group(self, request):
        chat, created = Chat.objects.get_or_create(is_group=True, name="Common Group")
        all_users = User.objects.all()
        chat.participants.set(all_users)
            
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
            
        sender = get_user_from_id_or_device(sender_id)
        if not sender:
            return Response({"error": "Sender not found"}, status=status.HTTP_404_NOT_FOUND)
            
        message = Message.objects.create(
            chat=chat,
            sender=sender,
            text=text,
            emoji=emoji
        )
        
        # Reset typing state
        key = f"{chat.id}_{sender.id}"
        if key in _typing_states:
            _typing_states[key]["is_typing"] = False
            
        msg_data = MessageSerializer(message).data

        # Auto sync participants for common group
        if chat.is_group:
            all_users = User.objects.all()
            chat.participants.set(all_users)

        # Broadcast message to participants
        channel_layer = get_channel_layer()
        for p in chat.participants.all():
            # Send to all active devices of this user
            devices = get_devices_for_user(p)
            for dev in devices:
                async_to_sync(channel_layer.group_send)(
                    f"device_{dev.device_id}",
                    {
                        "type": "chat_message_relay",
                        "message": msg_data,
                    }
                )

        return Response(msg_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        chat = self.get_object()
        sender_id = request.data.get('sender_id')
        files = request.FILES.getlist('files')
        
        if not sender_id:
            return Response({"error": "sender_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not files:
            return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        sender = get_user_from_id_or_device(sender_id)
        if not sender:
            return Response({"error": "Sender not found"}, status=status.HTTP_404_NOT_FOUND)
            
        sender_device = get_devices_for_user(sender).first()
        messages_created = []
        channel_layer = get_channel_layer()
        
        # Sync participants if it's the global group
        if chat.is_group:
            all_users = User.objects.all()
            chat.participants.set(all_users)
            
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
            
            # Record in Transfer history
            from transfer.models import Transfer
            import uuid
            for p in chat.participants.all():
                if p != sender:
                    p_device = get_devices_for_user(p).first()
                    if p_device and sender_device:
                        Transfer.objects.create(
                            transfer_id=f"tr-{uuid.uuid4().hex[:8]}",
                            sender=sender_device,
                            receiver=p_device,
                            file_name=file.name,
                            file_size=file.size,
                            file_type=file.content_type or "file",
                            status='completed',
                            progress=1.0
                        )

            msg_data = MessageSerializer(message).data
            
            # Broadcast the message
            for p in chat.participants.all():
                devices = get_devices_for_user(p)
                for dev in devices:
                    async_to_sync(channel_layer.group_send)(
                        f"device_{dev.device_id}",
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
            
        sender = get_user_from_id_or_device(sender_id)
        if not sender:
            return Response({"error": "Sender not found"}, status=status.HTTP_404_NOT_FOUND)
            
        key = f"{chat_id}_{sender.id}"
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
            
        exclude_user = get_user_from_id_or_device(exclude_id)
        chat = self.get_object()
        
        other_participants = chat.participants.all()
        if exclude_user:
            other_participants = other_participants.exclude(id=exclude_user.id)
        
        typing_users = []
        for p in other_participants:
            key = f"{chat_id}_{p.id}"
            state = _typing_states.get(key)
            if state and state["is_typing"]:
                time_diff = timezone.now() - state["last_updated"]
                if time_diff.total_seconds() < 4:
                    # Find a device to represent them
                    dev = get_devices_for_user(p).first()
                    typing_users.append(p.first_name or p.username or (dev.device_name if dev else "User"))
                    
        return Response({"typing_users": typing_users})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        chat = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_user_from_id_or_device(user_id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        unread_messages = chat.messages.filter(is_read=False).exclude(sender=user)
        # Collect message IDs to notify senders
        unread_ids = list(unread_messages.values_list('id', flat=True))
        unread_messages.update(is_read=True)
        
        channel_layer = get_channel_layer()
        # Notify other participants about read status
        for msg_id in unread_ids:
            try:
                msg = Message.objects.get(id=msg_id)
                devices = get_devices_for_user(msg.sender)
                for dev in devices:
                    async_to_sync(channel_layer.group_send)(
                        f"device_{dev.device_id}",
                        {
                            "type": "read_receipt_relay",
                            "message_id": msg.id,
                            "chat_id": chat.id,
                            "reader_id": user_id
                        }
                    )
            except Message.DoesNotExist:
                pass
                
        return Response({"status": "success"})
