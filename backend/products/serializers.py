from .models import Product, Reservation, Order
from rest_framework import serializers
from datetime import date


# ──────────────────────────────────────────────────────────────
#  Product serializer
# ──────────────────────────────────────────────────────────────
class ProductSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model  = Product
        fields = "__all__"

    # ── Field-level validators ──

    def validate_brand(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Brand is required.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Brand must be at least 2 characters.")
        return value

    def validate_model(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Model is required.")
        return value

    def validate_year(self, value):
        current_year = date.today().year
        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError(
                f"Year must be between 1900 and {current_year + 1}."
            )
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

    def validate_kmCover(self, value):
        if value < 0:
            raise serializers.ValidationError("KMs covered cannot be negative.")
        return value

    def validate_fuel(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Fuel type is required.")
        return value


# ──────────────────────────────────────────────────────────────
#  Reservation serializer
# ──────────────────────────────────────────────────────────────
class ReservationSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)

    class Meta:
        model  = Reservation
        fields = "__all__"


# ──────────────────────────────────────────────────────────────
#  Order serializer
# ──────────────────────────────────────────────────────────────
class OrderSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)
    user    = serializers.StringRelatedField()

    class Meta:
        model  = Order
        fields = "__all__"

    # ── Field-level validators ──

    def validate_name(self, value):
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters.")
        return value

    def validate_phone(self, value):
        if value:
            import re
            if not re.match(r'^\+?[\d\s\-()\[\]]{7,15}$', value.strip()):
                raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_email(self, value):
        # DRF's EmailField handles format; just add a blank check here.
        if value and not value.strip():
            raise serializers.ValidationError("Email cannot be blank.")
        return value

    def validate_pincode(self, value):
        if value:
            import re
            if not re.match(r'^\d{4,10}$', value.strip()):
                raise serializers.ValidationError("Pincode must be 4–10 digits.")
        return value

    def validate_delivery_date(self, value):
        if value and value <= date.today():
            raise serializers.ValidationError("Delivery date must be in the future.")
        return value

    def validate_address(self, value):
        if value and len(value.strip()) < 8:
            raise serializers.ValidationError("Please provide a complete address.")
        return value

    # ── Object-level validator ──
    def validate(self, attrs):
        """Cross-field checks can go here if needed in the future."""
        return attrs