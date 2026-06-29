import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from devices.models import Device
from chat.models import Chat, Message
from django.contrib.auth.models import User

class CommunicationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.device_id = self.scope['url_route']['kwargs']['device_id']
        self.user_group = f"device_{self.device_id}"
        self.lan_group = "lan_discovery"

        # Join their own group and the discovery group
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(self.lan_group, self.channel_name)

        await self.accept()

        # Mark device as online
        client_ip = self.scope.get('client', [None])[0]
        await self.update_device_presence(self.device_id, is_online=True, ip_address=client_ip)

        # Notify others
        await self.channel_layer.group_send(
            self.lan_group,
            {
                "type": "presence_update",
                "device_id": self.device_id,
                "is_online": True,
            }
        )

    async def disconnect(self, close_code):
        # Leave groups
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard(self.lan_group, self.channel_name)

        # Mark device as offline
        await self.update_device_presence(self.device_id, is_online=False)

        # Notify others
        await self.channel_layer.group_send(
            self.lan_group,
            {
                "type": "presence_update",
                "device_id": self.device_id,
                "is_online": False,
            }
        )

    async def receive_json(self, content):
        msg_type = content.get("type")
        target_device_id = content.get("target_id")

        if msg_type == "chat_message":
            # Save message to DB
            text = content.get("text", "")
            chat_id = content.get("chat_id")
            emoji = content.get("emoji")
            reply_to_id = content.get("reply_to")

            res = await self.save_message(
                self.device_id, target_device_id, chat_id, text, emoji, reply_to_id
            )
            msg_data = res["msg_data"]
            participant_device_ids = res["participant_device_ids"]

            # Send to all active devices of the participants in the chat
            for p_dev_id in participant_device_ids:
                await self.channel_layer.group_send(
                    f"device_{p_dev_id}",
                    {
                        "type": "chat_message_relay",
                        "message": msg_data,
                    }
                )

        elif msg_type == "typing":
            chat_id = content.get("chat_id")
            target_device_id = content.get("target_id")
            is_typing = content.get("is_typing", False)
            if chat_id:
                p_dev_ids = await self.get_chat_participants(chat_id)
                for p_dev_id in p_dev_ids:
                    if p_dev_id != self.device_id:
                        await self.channel_layer.group_send(
                            f"device_{p_dev_id}",
                            {
                                "type": "typing_relay",
                                "sender_id": self.device_id,
                                "chat_id": chat_id,
                                "is_typing": is_typing,
                            }
                        )
            elif target_device_id:
                await self.channel_layer.group_send(
                    f"device_{target_device_id}",
                    {
                        "type": "typing_relay",
                        "sender_id": self.device_id,
                        "is_typing": is_typing,
                    }
                )

        elif msg_type == "read_receipt":
            message_id = content.get("message_id")
            await self.mark_message_read(message_id)
            if target_device_id:
                await self.channel_layer.group_send(
                    f"device_{target_device_id}",
                    {
                        "type": "read_receipt_relay",
                        "message_id": message_id,
                        "reader_id": self.device_id,
                    }
                )

        elif msg_type == "signal":
            # WebRTC signaling (offer, answer, candidate)
            signal_data = content.get("data")
            sub_type = content.get("sub_type") # 'offer', 'answer', 'candidate'
            call_type = content.get("call_type") # 'voice', 'video', 'file'

            if target_device_id:
                await self.channel_layer.group_send(
                    f"device_{target_device_id}",
                    {
                        "type": "signal_relay",
                        "sender_id": self.device_id,
                        "sub_type": sub_type,
                        "call_type": call_type,
                        "data": signal_data,
                    }
                )

    # Event handlers
    async def presence_update(self, event):
        await self.send_json({
            "type": "presence",
            "device_id": event["device_id"],
            "is_online": event["is_online"],
        })

    async def chat_message_relay(self, event):
        await self.send_json({
            "type": "chat_message",
            "message": event["message"],
        })

    async def typing_relay(self, event):
        await self.send_json({
            "type": "typing",
            "sender_id": event["sender_id"],
            "chat_id": event.get("chat_id"),
            "is_typing": event["is_typing"],
        })

    async def read_receipt_relay(self, event):
        await self.send_json({
            "type": "read_receipt",
            "message_id": event["message_id"],
            "reader_id": event["reader_id"],
        })

    async def signal_relay(self, event):
        await self.send_json({
            "type": "signal",
            "sender_id": event["sender_id"],
            "sub_type": event["sub_type"],
            "call_type": event["call_type"],
            "data": event["data"],
        })

    # DB methods
    @database_sync_to_async
    def update_device_presence(self, device_id, is_online, ip_address=None):
        try:
            device = Device.objects.get(device_id=device_id)
            device.is_online = is_online
            if ip_address:
                device.ip_address = ip_address
            device.save()
        except Device.DoesNotExist:
            pass

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, chat_id, text, emoji=None, reply_to_id=None):
        sender_device = Device.objects.get(device_id=sender_id)
        if sender_device.user:
            sender = sender_device.user
        else:
            try:
                sender = User.objects.get(username=sender_device.username)
            except User.DoesNotExist:
                sender, _ = User.objects.get_or_create(username=sender_device.username or sender_device.device_name)

        if chat_id:
            chat = Chat.objects.get(id=chat_id)
        elif receiver_id:
            try:
                receiver_device = Device.objects.get(device_id=receiver_id)
                if receiver_device.user:
                    receiver = receiver_device.user
                else:
                    try:
                        receiver = User.objects.get(username=receiver_device.username)
                    except User.DoesNotExist:
                        receiver, _ = User.objects.get_or_create(username=receiver_device.username or receiver_device.device_name)

                chats = Chat.objects.filter(is_group=False, participants=sender).filter(participants=receiver)
                if chats.exists():
                    chat = chats.first()
                else:
                    chat = Chat.objects.create(is_group=False)
                    chat.participants.add(sender, receiver)
            except Device.DoesNotExist:
                chat, _ = Chat.objects.get_or_create(is_group=True, name="Common Group")
        else:
            chat, _ = Chat.objects.get_or_create(is_group=True, name="Common Group")

        # Sync participants for common group
        if chat.is_group:
            all_users = User.objects.all()
            chat.participants.set(all_users)

        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id)
            except Message.DoesNotExist:
                pass

        msg = Message.objects.create(
            chat=chat,
            sender=sender,
            text=text,
            emoji=emoji,
            reply_to=reply_to
        )

        sender_display = sender.first_name if sender.first_name else sender.username
        
        # Get active device IDs for all participants
        participant_device_ids = []
        for u in chat.participants.all():
            from django.db.models import Q
            devices = Device.objects.filter(Q(user=u) | Q(username=u.first_name) | Q(username=u.username)).distinct()
            for d in devices:
                participant_device_ids.append(d.device_id)

        return {
            "msg_data": {
                "id": msg.id,
                "chat_id": chat.id,
                "sender_id": sender_device.device_id,
                "sender_user_id": sender.id,
                "sender_name": sender_display,
                "sender_device_name": sender_device.device_name,
                "text": msg.text,
                "emoji": msg.emoji,
                "reply_to": reply_to.id if reply_to else None,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat(),
            },
            "participant_device_ids": participant_device_ids
        }

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_read = True
            msg.save()
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def get_chat_participants(self, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
            device_ids = []
            for u in chat.participants.all():
                from django.db.models import Q
                devices = Device.objects.filter(Q(user=u) | Q(username=u.first_name) | Q(username=u.username)).distinct()
                for d in devices:
                    device_ids.append(d.device_id)
            return device_ids
        except Chat.DoesNotExist:
            return []
