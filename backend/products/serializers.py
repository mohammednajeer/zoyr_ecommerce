from .models import Product,Reservation,Order
from rest_framework import serializers
from cloudinary.utils import cloudinary_url


class ProductSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(required=False ,allow_null = True)

    class Meta:
        model = Product
        fields = "__all__"

class ReservationSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"