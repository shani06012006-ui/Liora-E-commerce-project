# backend/accounts/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging
 
logger = logging.getLogger(__name__)
 
 
@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code, username):
    """Send OTP email using Celery"""
    print(f"📨 SENDING OTP TO EXACTLY THIS ADDRESS: '{email}'")  # TEMP DEBUG LINE — remove once confirmed working
    try:
        subject = "🔐 Your Liora OTP Code"
        message = f"""Hi {username or 'User'},
 
Your OTP code is: {otp_code}
 
This code will expire in 5 minutes.
 
If you didn't request this, please ignore this email.
 
Thanks,
Liora Team"""
 
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f" OTP email sent to {email}")
        return {"success": True, "email": email}
 
    except Exception as e:
        logger.error(f"❌ Failed to send OTP to {email}: {str(e)}")
        raise self.retry(exc=e, countdown=60)