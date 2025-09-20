from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Company, User
from .serializers import (
    CompanySerializer, UserRegistrationSerializer, 
    UserSerializer, LoginSerializer
)


class CompanyListCreateView(generics.ListCreateAPIView):
    """List all companies or create a new company"""
    queryset = Company.objects.filter(is_active=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a company"""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user (only company admins can create users for their company)"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Only company admins can create new users
        if not self.request.user.is_company_admin and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only company admins can create new users.")
        
        # Ensure the new user belongs to the same company as the admin
        if not self.request.user.is_superuser:
            serializer.validated_data['company'] = self.request.user.company
        
        serializer.save()


class UserListView(generics.ListAPIView):
    """List users for the authenticated user's company"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(company=self.request.user.company)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
