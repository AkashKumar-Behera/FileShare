from django.apps import AppConfig


class TransferConfig(AppConfig):
    name = "transfer"

    def ready(self):
        try:
            import os
            from django.utils import timezone
            from django.conf import settings
            from transfer.models import Transfer

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
