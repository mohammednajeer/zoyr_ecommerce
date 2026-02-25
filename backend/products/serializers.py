from .models import Product,Reservation,Order
from rest_framework import serializers
from cloudinary.utils import cloudinary_url


class ProductSerializer(serializers.ModelSerializer):
    
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_image(self, obj):
        if obj.image:
            url, _ = cloudinary_url(obj.image.public_id)
            return url
        return None



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