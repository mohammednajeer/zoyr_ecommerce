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
                fail_silently=False

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
            secure=False,
            samesite="Lax"
        )
        response.set_cookie(
            key="refresh_token",
            value = str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax"
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

        
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

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
                secure=False,
                samesite="Lax"
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

