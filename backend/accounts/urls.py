from django.urls import path
from .views import RegisterView,profileView,Loginview

urlpatterns = [
    path("register/",RegisterView.as_view()),
    path("login/", Loginview.as_view()),
    path("profile/",profileView.as_view()),
]
