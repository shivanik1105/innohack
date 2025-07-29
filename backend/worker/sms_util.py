import requests
import random
from django.conf import settings
from django.core.cache import cache

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_via_fast2sms(phone_number, otp):
    """Send OTP via Fast2SMS API"""
    url = "https://www.fast2sms.com/dev/bulkV2"
    
    headers = {
        'authorization': settings.FAST2SMS_API_KEY,
        'Content-Type': "application/x-www-form-urlencoded",
        'Cache-Control': "no-cache",
    }
    
    message = f"Your OTP is {otp}. Valid for {settings.OTP_EXPIRY_MINUTES} minutes."
    
    payload = {
        'sender_id': settings.FAST2SMS_SENDER_ID,
        'message': message,
        'language': 'english',
        'route': 'v3',
        'numbers': phone_number
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get('return'):
            return {
                'status': 'success',
                'message': 'OTP sent successfully',
                'request_id': response_data.get('request_id')
            }
        return {
            'status': 'error',
            'message': response_data.get('message', 'Failed to send OTP'),
            'code': response.status_code
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'API connection failed: {str(e)}'
        }

def cache_otp(phone_number, otp):
    """Store OTP in cache"""
    cache_key = f'otp_{phone_number}'
    cache.set(cache_key, otp, timeout=settings.OTP_EXPIRY_SECONDS)

def verify_otp_in_cache(phone_number: str, otp: str) -> bool:
    """
    Verify OTP against cached value
    Returns:
        bool: True if OTP matches and is not expired, False otherwise
    """
    cache_key = f'otp_{phone_number}'
    stored_otp = cache.get(cache_key)
    if stored_otp and stored_otp == otp:
        cache.delete(cache_key)  # OTP can only be used once
        return True
    return False