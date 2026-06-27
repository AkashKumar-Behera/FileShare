import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from devices.models import Device
from chat.models import Chat, Message

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

            msg_data = await self.save_message(
                self.device_id, target_device_id, chat_id, text, emoji, reply_to_id
            )

            # Send to sender's own group to confirm delivery, and to recipient
            await self.channel_layer.group_send(
                f"device_{target_device_id}",
                {
                    "type": "chat_message_relay",
                    "message": msg_data,
                }
            )
            await self.channel_layer.group_send(
                self.user_group,
                {
                    "type": "chat_message_relay",
                    "message": msg_data,
                }
            )

        elif msg_type == "typing":
            await self.channel_layer.group_send(
                f"device_{target_device_id}",
                {
                    "type": "typing_relay",
                    "sender_id": self.device_id,
                    "is_typing": content.get("is_typing", False),
                }
            )

        elif msg_type == "read_receipt":
            message_id = content.get("message_id")
            await self.mark_message_read(message_id)
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
        sender = Device.objects.get(device_id=sender_id)
        receiver = Device.objects.get(device_id=receiver_id)

        # Get or create direct chat
        if not chat_id:
            chats = Chat.objects.filter(is_group=False, participants=sender).filter(participants=receiver)
            if chats.exists():
                chat = chats.first()
            else:
                chat = Chat.objects.create(is_group=False)
                chat.participants.add(sender, receiver)
        else:
            chat = Chat.objects.get(id=chat_id)

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

        return {
            "id": msg.id,
            "chat_id": chat.id,
            "sender_id": sender.device_id,
            "sender_name": sender.username,
            "text": msg.text,
            "emoji": msg.emoji,
            "reply_to": reply_to.id if reply_to else None,
            "created_at": msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_read = True
            msg.save()
        except Message.DoesNotExist:
            pass
