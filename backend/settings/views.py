from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import StoreSettings
from .serializers import StoreSettingsSerializer
 
 
def is_admin(user):
    return user.is_staff or getattr(user, 'role', '') == 'admin'
 
 
class AdminSettingsView(APIView):
    """GET /api/admin/settings/  — full settings object, all sections."""
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        if not is_admin(request.user):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        settings_obj = StoreSettings.load()
        return Response(StoreSettingsSerializer(settings_obj).data)
 
 
class AdminSettingsSectionView(APIView):
    """
    GET    /api/admin/settings/<section>/            — read one section
    PATCH  /api/admin/settings/<section>/             — merge updates into the section
    PUT    /api/admin/settings/<section>/             — replace the section entirely
    """
    permission_classes = [IsAuthenticated]
 
    def _get_settings_or_403(self, request):
        if not is_admin(request.user):
            return None, Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        return StoreSettings.load(), None
 
    def _validate_section(self, section):
        return section in StoreSettings.SECTIONS
 
    def get(self, request, section):
        settings_obj, err = self._get_settings_or_403(request)
        if err:
            return err
        if not self._validate_section(section):
            return Response({"error": f"Invalid section: {section}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(getattr(settings_obj, section))
 
    def patch(self, request, section):
        settings_obj, err = self._get_settings_or_403(request)
        if err:
            return err
        if not self._validate_section(section):
            return Response({"error": f"Invalid section: {section}"}, status=status.HTTP_400_BAD_REQUEST)
 
        current = getattr(settings_obj, section) or {}
        current.update(request.data)
        setattr(settings_obj, section, current)
        settings_obj.save()
        return Response({"message": "Settings updated successfully", "data": current})
 
    def put(self, request, section):
        settings_obj, err = self._get_settings_or_403(request)
        if err:
            return err
        if not self._validate_section(section):
            return Response({"error": f"Invalid section: {section}"}, status=status.HTTP_400_BAD_REQUEST)
 
        setattr(settings_obj, section, request.data)
        settings_obj.save()
        return Response({"message": "Settings saved successfully", "data": request.data})
 
 
class AdminSettingsArrayItemView(APIView):
    """
    POST   /api/admin/settings/<section>/<array_field>/         { "value": "..." }  — add
    DELETE /api/admin/settings/<section>/<array_field>/<value>/                     — remove
    e.g. POST /api/admin/settings/shipping/deliveryAreas/  { "value": "Andhra Pradesh" }
    """
    permission_classes = [IsAuthenticated]
 
    def post(self, request, section, array_field):
        if not is_admin(request.user):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        if section not in StoreSettings.SECTIONS:
            return Response({"error": f"Invalid section: {section}"}, status=status.HTTP_400_BAD_REQUEST)
 
        value = request.data.get('value')
        if not value:
            return Response({"error": "value is required"}, status=status.HTTP_400_BAD_REQUEST)
 
        settings_obj = StoreSettings.load()
        current = getattr(settings_obj, section) or {}
        arr = current.get(array_field, [])
        if not isinstance(arr, list):
            return Response({"error": f"{array_field} is not a list field"}, status=status.HTTP_400_BAD_REQUEST)
        if value not in arr:
            arr.append(value)
        current[array_field] = arr
        setattr(settings_obj, section, current)
        settings_obj.save()
        return Response({"message": "Item added", "data": current}, status=status.HTTP_201_CREATED)
 
    def delete(self, request, section, array_field, value):
        if not is_admin(request.user):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        if section not in StoreSettings.SECTIONS:
            return Response({"error": f"Invalid section: {section}"}, status=status.HTTP_400_BAD_REQUEST)
 
        settings_obj = StoreSettings.load()
        current = getattr(settings_obj, section) or {}
        arr = current.get(array_field, [])
        current[array_field] = [v for v in arr if v != value]
        setattr(settings_obj, section, current)
        settings_obj.save()
        return Response({"message": "Item removed", "data": current})
 