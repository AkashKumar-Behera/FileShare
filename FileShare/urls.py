"""
URL configuration for FileShare project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from devices.views import DeviceViewSet
from chat.views import ChatViewSet
from transfer.views import TransferViewSet
from calls.views import CallSessionViewSet
from settings.views import DeviceSettingsViewSet
from notifications.views import NotificationViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r'devices', DeviceViewSet)
router.register(r'chats', ChatViewSet)
router.register(r'transfers', TransferViewSet)
router.register(r'calls', CallSessionViewSet)
router.register(r'settings', DeviceSettingsViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

