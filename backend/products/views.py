from django.shortcuts import render

from rest_framework import generics
from .models import Product,Wishlist
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from .serializers import ReservationSerializer,OrderSerializer
from .models import Product, Reservation,Order
from rest_framework.decorators import api_view, permission_classes
from accounts.models import User
from .models import Product, Order
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
import stripe 
from django.conf import settings
from products.models import Reservation,Order




class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser,JSONParser]

    def get_queryset(self):
        if self.request.user.is_staff:
            queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(status="active")

        ordering = self.request.query_params.get("ordering")
        if ordering:
            queryset = queryset.order_by(ordering)

        limit = self.request.query_params.get("limit")
        if limit:
            queryset = queryset[:int(limit)]

        return queryset

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminUser()]

        return [IsAuthenticatedOrReadOnly()]    

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]

    def patch(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

class ReserveProductView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self,request,pk):

        existing_reservation = Reservation.objects.filter(
            user=request.user
        ).exists()

        if existing_reservation:
            return Response(
                {"error": "You already have an active reservation"},
                status=400
            )


        try:
            product = Product.objects.get(id=pk)

        except Product.DoesNotExist:
            return Response({"error":"Product not found"},status=404)
        
        if product.availability != "available":
            return Response({"error":"Already reserved or sold"},status=400)
        
        if Reservation.objects.filter(product=product).exists():
            return Response(
                {"error": "This car is already reserved"},
                status=400
            )

        Reservation.objects.create(
            user = request.user,
            product = product
        )

        product.availability = "reserved"
        product.save()

        return Response({"message":"car reserved successfully"})
    

class UserReservationListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)
    

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unreserve_product(request, pk):
    try:
        reservation = Reservation.objects.get(product_id=pk, user=request.user)
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=404)

    product = reservation.product
    product.availability = "available"
    product.save()

    reservation.delete()

    return Response({"message": "Car unreserved successfully"})

class UnreserveProductView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        try:
            reservation = Reservation.objects.get(
                user=request.user,
                product_id=pk
            )

        except Reservation.DoesNotExist:
            return Response({"error":"Reservation not found"}, status=404)

        product = reservation.product
        product.availability = "available"
        product.save()

        reservation.delete()

        return Response({"message":"Unreserved successfully"})
    
# class CreateOrderView(APIView):

#     permission_classes = [IsAuthenticated]

#     def post(self, request):

#         reservations = Reservation.objects.filter(user=request.user)

#         if not reservations.exists():
#             return Response({"error":"No reservation found"}, status=400)
        
#         existing = Order.objects.filter(user=request.user, status="pending")

#         if existing.exists():
#             return Response(
#                 {"error": "You already have a pending order"},
#                 status=400
#             )

#         name = request.data.get("name")
#         phone = request.data.get("phone")
#         email = request.data.get("email")
#         address = request.data.get("address")
#         city = request.data.get("city")
#         pincode = request.data.get("pincode")
#         delivery_date = request.data.get("delivery_date")
#         created_orders = []

#         for r in reservations:

#             order = Order.objects.create(
#                 user=request.user,
#                 product=r.product,
#                 name=name,
#                 phone=phone,
#                 email=email,
#                 address=address,
#                 city=city,
#                 pincode=pincode,
#                 delivery_date=delivery_date,
#                 status="pending"
#             )

#             created_orders.append(order)

#         return Response({
#             "message": "Order created",
#             "order_ids": [o.id for o in created_orders]
#         })
    

    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, pk):

    try:
        product = Product.objects.get(id=pk)

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    wishlist_item = Wishlist.objects.filter(
        user=request.user,
        product=product
    ).first()

    if wishlist_item:
        wishlist_item.delete()
        return Response({"message": "removed from wishlist"})

    Wishlist.objects.create(
        user=request.user,
        product=product
    )

    return Response({"message": "added to wishlist"})



class MyWishlistView(ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(
            wishlist_items__user=self.request.user
        )
    
class MyOrdersView(ListAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    

class AdminDashboardView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        users = User.objects.count()
        products = Product.objects.count()
        orders = Order.objects.count()

        revenue = sum(
            order.product.price for order in Order.objects.select_related("product")
        )

        recent_orders = Order.objects.select_related(
            "user","product"
        ).order_by("-created_at")[:10]

        data = [
            {
                "id": o.id,
                "user": o.user.username,
                "product": o.product.model,
                "price": o.product.price,
                "date": o.created_at
            }
            for o in recent_orders
        ]

        return Response({
            "users": users,
            "products": products,
            "orders": orders,
            "revenue": revenue,
            "recent_orders": data
        })
    


stripe.api_key = settings.STRIPE_SECRET_KEY
class ConfirmPayment(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        session_id = request.data.get("session_id")

        if not session_id:
            return Response({"error": "Session ID missing"}, status=400)

        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status != "paid":
            return Response({"error": "Payment not completed"}, status=400)

        metadata = session.metadata

        reservations = Reservation.objects.filter(user=request.user)

        created_orders = []

        for r in reservations:

            order = Order.objects.create(
                user=request.user,
                product=r.product,

                name=metadata.get("name"),
                phone=metadata.get("phone"),
                email=metadata.get("email"),
                address=metadata.get("address"),
                city=metadata.get("city"),
                pincode=metadata.get("pincode"),
                delivery_date=metadata.get("delivery_date"),

                payment_id=session.payment_intent,
                status="paid"
            )

            r.product.availability = "sold"
            r.product.save()

            created_orders.append(order)

        reservations.delete()

        return Response({
            "message": "Payment confirmed",
            "orders": [o.id for o in created_orders]
        })