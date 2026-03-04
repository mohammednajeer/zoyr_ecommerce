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
    
    image = CloudinaryField("image", blank=True, null=True)

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
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    status = models.CharField(max_length=100,default="placed")
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