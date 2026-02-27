from django.urls import path
from .views import RegisterView,profileView,Loginview,LogoutView,RefreshTokenView,VerifyOTPView



urlpatterns = [
    path("register/",RegisterView.as_view()),
    path("login/", Loginview.as_view()),
    path("profile/",profileView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("refresh/",RefreshTokenView.as_view()),
    path("verify-otp/",VerifyOTPView.as_view()),
]
