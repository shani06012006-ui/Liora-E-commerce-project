from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code, username):
    subject = "Your OTP Verification Code - L I O R A Ecommerce Website"
    message = (
        f"Hi {username},\n\n"
        f"Your OTP code is: {otp_code}\n\n"
        f"This code will expire in 5 minutes.\n\n"
        f"Thanks,\nLiora Team"
    )
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=10)