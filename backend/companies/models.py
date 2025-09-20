from django.db import models
from django.contrib.auth.models import AbstractUser


class Company(models.Model):
    """Model for B2B companies that purchase access to the app"""
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Extended user model for company employees"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    is_company_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.company.name}"
