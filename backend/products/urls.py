# backend/products/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryDetailView,
    AdminCategoryListView,
    AdminDashboardStatsView,
    AdminProductDetailView,
    AdminProductListView,
    ProductViewSet,
    PublicCategoryListView,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    # Public product browsing (list/retrieve, via router -> /products/, /products/<pk>/)
    path("", include(router.urls)),
    # Public categories
    path("categories/", PublicCategoryListView.as_view(), name="public-categories"),
    # Admin dashboard
    path(
        "admin/dashboard/stats/",
        AdminDashboardStatsView.as_view(),
        name="admin-dashboard-stats",
    ),
    # Admin products
    path("admin/products/", AdminProductListView.as_view(), name="admin-products"),
    path(
        "admin/products/<int:product_id>/",
        AdminProductDetailView.as_view(),
        name="admin-product-detail",
    ),
    # Admin categories
    path("admin/categories/", AdminCategoryListView.as_view(), name="admin-categories"),
    path(
        "admin/categories/<int:category_id>/",
        AdminCategoryDetailView.as_view(),
        name="admin-category-detail",
    ),
]
