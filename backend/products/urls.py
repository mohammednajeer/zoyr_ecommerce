from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    ReserveProductView,
    UserReservationListView,
    unreserve_product,
    UnreserveProductView,
    # CreateOrderView,
    toggle_wishlist,
    MyWishlistView,
    MyOrdersView,
    AdminDashboardView,
    ConfirmPayment,
    AdminOrdersView,
    AdminOrderDetailView
)

urlpatterns = [
    path("", ProductListCreateView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),
    path("reserve/<int:pk>/",ReserveProductView.as_view()),
    path("my-reservations/",UserReservationListView.as_view()),
    # path("unreserve/<int:pk>/", unreserve_product),
    path("unreserve/<int:pk>/", UnreserveProductView.as_view()),
    # path("create-order/", CreateOrderView.as_view()),
    path("wishlist/toggle/<int:pk>/", toggle_wishlist),
    path("my-wishlist/", MyWishlistView.as_view()),
    path("my-orders/",MyOrdersView.as_view()),
    path("admin/dashboard/", AdminDashboardView.as_view()),
    path("admin/orders/", AdminOrdersView.as_view()),
    path("admin/orders/<int:pk>/", AdminOrderDetailView.as_view()),
    path("confirm-payment/", ConfirmPayment.as_view()),
]