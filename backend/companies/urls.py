from django.urls import path
from . import views

urlpatterns = [
    path('companies/', views.CompanyListCreateView.as_view(), name='company-list-create'),
    path('companies/<int:pk>/', views.CompanyDetailView.as_view(), name='company-detail'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
]