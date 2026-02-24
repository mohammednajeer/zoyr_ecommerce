from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializers import RegisterSerializer,UserSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterView(APIView):

    def post(self , request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message":"User Created"},status=201)
        
        return Response(serializer.errors,status=400)
    

class profileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
