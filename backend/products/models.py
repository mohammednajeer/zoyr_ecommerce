from django.db import models
from cloudinary.models import CloudinaryField
from django.conf import settings
from django.utils import timezone
class Product(models.Model):

    AVAILABILITY_CHOICES = [
        ("available","Available"),
        ("reserved", "Reserved"),
        ("sold", "Sold"),
    ]

    brand = models.CharField( max_length=150)
    model = models.CharField( max_length=200)
    price = models.IntegerField()
    year = models.IntegerField()
    fuel = models.CharField(max_length=100)
    kmCover = models.IntegerField()
    status = models.CharField(max_length=50 , default="active")
    availability = models.CharField( max_length=50,
                                    choices=AVAILABILITY_CHOICES,
                                    default="available")
    
    image = CloudinaryField("image",folder = "cars", blank=True, null=True)

    def save(self, *args, **kwargs):

        if self.brand:
            self.brand = self.brand.upper()

        if self.model:
            self.model = self.model.upper()

        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.brand} {self.model}"
    
User  = settings.AUTH_USER_MODEL

class Reservation(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} reserved {self.product}"
    
class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ("progress",   "In Progress"),
        ("delayed",    "Delayed"),
        ("cancelled",  "Cancelled"),
        ("handed_over","Handed Over"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    name = models.CharField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)

    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=20, null=True, blank=True)

    delivery_date = models.DateField(null=True, blank=True)

    payment_id = models.CharField(max_length=255, null=True, blank=True)

    status = models.CharField(max_length=100, default="pending")
    order_status = models.CharField(                               # fulfillment status
        max_length=100,
        choices=ORDER_STATUS_CHOICES,
        default="progress"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    
class Wishlist(models.Model):
    user  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="wishlists"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlist_items"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user","product")

    def __str__(self):
        return f"{self.user} ❤️ {self.product}"
    

