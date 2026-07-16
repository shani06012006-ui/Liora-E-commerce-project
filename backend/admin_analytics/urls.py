# backend/admin_analytics/urls.py
from django.urls import path
from .views import (
    AdminAnalyticsSalesView,
    AdminAnalyticsRevenueView,
    AdminAnalyticsCustomersView,
    AdminAnalyticsProductsView ,
    AdminAnalyticsTestView
)

urlpatterns = [
    path('sales/', AdminAnalyticsSalesView.as_view(), name='admin-analytics-sales'),
    path('revenue/', AdminAnalyticsRevenueView.as_view(), name='admin-analytics-revenue'),
    path('customers/', AdminAnalyticsCustomersView.as_view(), name='admin-analytics-customers'),
    path('products/', AdminAnalyticsProductsView.as_view(), name='admin-analytics-products'),
    path('test/', AdminAnalyticsTestView.as_view(), name='admin-analytics-test'),

]