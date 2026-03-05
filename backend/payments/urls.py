from django.urls import path
from .views import CreateCheckoutSession

urlpatterns = [
    path("checkout/", CreateCheckoutSession.as_view()),
]