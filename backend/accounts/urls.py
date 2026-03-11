from django.urls import path
from .views import RegisterView,profileView,Loginview,LogoutView,RefreshTokenView,VerifyOTPView
from .views import (
    AdminUsersListView,
    AdminUserDetailView,
    AdminDeleteUserView,
    AdminToggleUserStatusView,
    ResendOTPView,
)


urlpatterns = [
    path("register/",RegisterView.as_view()),
    path("login/", Loginview.as_view()),
    path("profile/",profileView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("refresh/",RefreshTokenView.as_view()),
    path("verify-otp/",VerifyOTPView.as_view()),
    path("admin/users/", AdminUsersListView.as_view()),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view()),
    path("admin/users/<int:pk>/toggle-status/", AdminToggleUserStatusView.as_view()),
    path("admin/users/<int:pk>/delete/", AdminDeleteUserView.as_view()),
    path("resend-otp/", ResendOTPView.as_view()),
]