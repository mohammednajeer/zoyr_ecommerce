from django.urls import path
from .views import ProductListCreateView, ProductDetailView,ReserveProductView,UserReservationListView,unreserve_product
from .views import UnreserveProductView,CreateOrderView


urlpatterns = [
    path("", ProductListCreateView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),
    path("reserve/<int:pk>/",ReserveProductView.as_view()),
    path("my-reservations/",UserReservationListView.as_view()),
    path("unreserve/<int:pk>/", unreserve_product),
    path("unreserve/<int:pk>/", UnreserveProductView.as_view()),
    path("create-order/", CreateOrderView.as_view()),
]