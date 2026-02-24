from django.urls import path
from .views import RegisterView,profileView

urlpatterns = [
    path("register/",RegisterView.as_view()),
    path("profile/",profileView.as_view()),
]
