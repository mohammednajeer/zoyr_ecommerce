from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializers import RegisterSerializer,UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
class RegisterView(APIView):

    def post(self , request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message":"User Created"},status=201)
        
        return Response(serializer.errors,status=400)
    

class Loginview(APIView):
    
    def post(self,request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username = username , password = password)

        if user is None:
            return Response({"error":"invalid credentials"},status= 401)
        
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

        # DELETE COOKIES
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