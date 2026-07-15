from django.urls import path
from .views import AdminSettingsView, AdminSettingsSectionView, AdminSettingsArrayItemView
 
urlpatterns = [
    path("admin/settings/", AdminSettingsView.as_view()),
    path("admin/settings/<str:section>/", AdminSettingsSectionView.as_view()),
    path("admin/settings/<str:section>/<str:array_field>/", AdminSettingsArrayItemView.as_view()),
    path("admin/settings/<str:section>/<str:array_field>/<str:value>/", AdminSettingsArrayItemView.as_view()),
]