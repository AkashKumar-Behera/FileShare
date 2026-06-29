from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from chat.models import Chat
from devices.models import Device

@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username') # Display name
        email = data.get('email')       # Login email
        password = data.get('password')
        device_id = data.get('device_id')
        device_name = data.get('device_name', 'Unknown')
        device_type = data.get('device_type', 'desktop')
        
        if not username or not email or not password:
            return JsonResponse({'error': 'Name, email, and password are required'}, status=400)
            
        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
            
        # Create user with email as username
        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = username # Store display name in first_name
        user.save()
        
        # Log the user in
        login(request, user)
        
        # Link device to user
        if device_id:
            device, _ = Device.objects.update_or_create(
                device_id=device_id,
                defaults={
                    'username': username,
                    'device_name': device_name,
                    'device_type': device_type,
                    'is_online': True
                }
            )
            device.user = user
            device.save()
            
        # Automatically join or create the global Common Group
        common_group, created = Chat.objects.get_or_create(
            is_group=True,
            name="Common Group"
        )
        common_group.participants.add(user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': username,
                'email': email
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        device_id = data.get('device_id')
        device_name = data.get('device_name', 'Unknown')
        device_type = data.get('device_type', 'desktop')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
            
        user = authenticate(username=email, password=password)
        
        if user is not None:
            login(request, user)
            display_name = user.first_name if user.first_name else user.username
            
            # Link device
            avatar = 'avatar_1'
            profile_completed = False
            other_device = Device.objects.filter(user=user).exclude(avatar='').exclude(avatar='avatar_1').first()
            if other_device:
                avatar = other_device.avatar
                profile_completed = True
            elif user.first_name:
                profile_completed = True

            if device_id:
                device, _ = Device.objects.update_or_create(
                    device_id=device_id,
                    defaults={
                        'username': display_name,
                        'device_name': device_name,
                        'device_type': device_type,
                        'avatar': avatar,
                        'is_online': True
                    }
                )
                device.user = user
                device.save()
            
            # Ensure user is in the common group
            common_group, _ = Chat.objects.get_or_create(
                is_group=True,
                name="Common Group"
            )
            common_group.participants.add(user)
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': display_name,
                    'email': user.email,
                    'avatar': avatar,
                    'profile_completed': profile_completed
                }
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def logout_user(request):
    logout(request)
    return JsonResponse({'success': True})

