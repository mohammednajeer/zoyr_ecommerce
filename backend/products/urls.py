from django.urls import path
from .views import ProductListCreateView, ProductDetailView

urlpatterns = [
    path("", ProductListCreateView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),
]