from django.shortcuts import render

from rest_framework import generics
from .models import Product,Wishlist
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from .serializers import ReservationSerializer,OrderSerializer
from .models import Product, Reservation,Order
from rest_framework.decorators import api_view, permission_classes


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.all()

        # 🔥 ordering support
        ordering = self.request.query_params.get("ordering")
        if ordering:
            queryset = queryset.order_by(ordering)

        # 🔥 limit support
        limit = self.request.query_params.get("limit")
        if limit:
            queryset = queryset[:int(limit)]

        return queryset

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


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
    
class CreateOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        reservations = Reservation.objects.filter(user=request.user)

        if not reservations.exists():
            return Response({"error":"No reservation found"}, status=400)

        for r in reservations:

            Order.objects.create(
                user=request.user,
                product=r.product,
                status="placed"
            )

            r.product.availability = "sold"
            r.product.save()

        reservations.delete()

        return Response({"message":"Order placed successfully"})
    
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