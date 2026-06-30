from django.apps import AppConfig


class ChatConfig(AppConfig):
    name = "chat"

    def ready(self):
        try:
            import os
            from django.utils import timezone
            from chat.models import Message

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
