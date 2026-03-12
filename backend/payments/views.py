import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from products.models import Reservation

stripe.api_key = settings.STRIPE_SECRET_KEY



class CreateCheckoutSession(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        reservations = Reservation.objects.filter(user=request.user)

        if not reservations.exists():
            return Response({"error": "No reserved car"}, status=400)

        line_items = []

        for r in reservations:
            
            advance_amount = int(r.product.price * 0.40)

            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{r.product.brand} {r.product.model}",
                    },
                    "unit_amount": advance_amount * 100,
                },
                "quantity": 1,
            })

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",

            metadata={
                "name": request.data.get("name"),
                "phone": request.data.get("phone"),
                "email": request.data.get("email"),
                "address": request.data.get("address"),
                "city": request.data.get("city"),
                "pincode": request.data.get("pincode"),
                "delivery_date": request.data.get("delivery_date"),
            },


            success_url=f"{settings.FRONTEND_URL}/orderplaced?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/cart",
        )

        return Response({"checkout_url": session.url})