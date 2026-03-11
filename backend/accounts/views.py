from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializers import RegisterSerializer,UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .utils import generate_otp
from django.core.mail import send_mail
from .models import EmailOTP,User
from rest_framework.exceptions import AuthenticationFailed
class RegisterView(APIView):

    def post(self , request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.is_verified = False
            user.save()

            EmailOTP.objects.filter(user=user).delete()

            otp = generate_otp()

            EmailOTP.objects.create(
                user = user
                ,otp = otp
            )

            send_mail(
                subject="verify your account",
                message=f"Your OTP is {otp}",
                from_email="dummyem118@gmail.com",
                recipient_list=[user.email],
                fail_silently=True

            )

            return Response({"message":"OTP sent to email",
                             "username":user.username},status=201)
        
        return Response(serializer.errors,status=400)
    

class Loginview(APIView):
    
    def post(self,request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username = username , password = password)

        if user is None:
            return Response({"error":"invalid credentials"},status= 401)
        
        if user.status == "block":
            return Response(
                {"error": "Access blocked. Contact admin."},
                status=403
            )
        
        if not user.is_verified:
            EmailOTP.objects.filter(user=user).delete()

            otp =generate_otp()

            EmailOTP.objects.create(
                user = user,
                otp = otp
            )

            send_mail(
                subject="verify your account",
                message=f"Your OTP is {otp}",
                from_email="dummyem118@gmail.com",
                recipient_list=[user.email],
                fail_silently=False

            )
            return Response(
                {"error": "Email not verified",
                 "email":user.email,
                 "username":user.username},
                status=403
            )


        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        response = Response({"message":"Login successful"})

        # set access token in HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="None",
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value = str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            path="/"
        )
        return response
        

class profileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self,request):
        serializer = UserSerializer(request.user
                                    ,data=request.data,
                                    partial = True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors,status = 400)
    


class LogoutView(APIView):

    def post(self, request):

        response = Response({"message": "Logged out successfully"})

        response.delete_cookie(
            key="access_token",
            path="/",
            samesite="None",
        )

        response.delete_cookie(
            key="refresh_token",
            path="/",
            samesite="None",
        )

        return response
    

class RefreshTokenView(APIView):

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "No refresh token"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)

            response = Response({"message": "Token refreshed"})

            response.set_cookie(
                key="access_token",
                value=new_access,
                httponly=True,
                secure=True,
                samesite="None",
               
                path="/"
            )

            return response

        except Exception:
            return Response({"error": "Invalid refresh token"}, status=401)
        

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        username = request.data.get("username")  

        try:
            
            if username:
                user = User.objects.filter(username=username).first()
            else:
                user = User.objects.filter(email=email).last()

            if not user:
                return Response({"error": "User not found"}, status=404)

            otp_obj = EmailOTP.objects.filter(user=user).last()

            if not otp_obj:
                return Response({"error": "No OTP found"}, status=400)

            if otp_obj.otp != otp:
                return Response({"error": "Invalid OTP"}, status=400)

            if otp_obj.is_expired():
                otp_obj.delete()
                return Response({"error": "OTP expired"}, status=400)

            user.is_verified = True
            user.save()
            otp_obj.delete()
            return Response({"message": "Account verified"}, status=200)

        except Exception as e:
            return Response({"error": "Something went wrong"}, status=500)   


from rest_framework.permissions import IsAdminUser
from products.models import Order
from products.serializers import OrderSerializer
from django.shortcuts import get_object_or_404


class AdminUsersListView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        users = User.objects.filter(role="user")

        data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "status": getattr(u, "status", "active"),
                "is_verified": u.is_verified,
            }
            for u in users
        ]

        return Response(data)


class AdminUserDetailView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, pk):

        user = get_object_or_404(User, id=pk)

        orders = Order.objects.filter(user=user).select_related("product")

        order_data = [
            {
                "id": o.id,
                "status": o.status,
                "created_at": o.created_at,
                "product": {
                    "brand": o.product.brand,
                    "model": o.product.model,
                    "price": o.product.price,
                    "year": o.product.year,
                    "fuel": o.product.fuel,
                    "kmCover": o.product.kmCover,
                    "image": o.product.image.url if o.product.image else None
                }
            }
            for o in orders
        ]

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "status": getattr(user, "status", "active"),
                "is_verified": user.is_verified, 
            },
            "orders": order_data
        })


class AdminDeleteUserView(APIView):

    permission_classes = [IsAdminUser]

    def delete(self, request, pk):

        user = get_object_or_404(User, id=pk)

        user.delete()

        return Response({"message": "User deleted"})
    

class AdminToggleUserStatusView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, pk):

        user = get_object_or_404(User, id=pk)

        new_status = "block" if getattr(user,"status","active") == "active" else "active"

        user.status = new_status
        user.save()

        return Response({"status": new_status})