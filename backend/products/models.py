from django.db import models

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
    
    imageSource = models.CharField( max_length=600)

    def __str__(self):
        return f"{self.brand} {self.model}"
    
