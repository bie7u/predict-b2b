from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.profile_view, name='profile'),
    
    # User management (for company admins)
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Leagues and matches
    path('leagues/', views.LeagueListView.as_view(), name='league-list'),
    path('matches/', views.MatchListView.as_view(), name='match-list'),
    
    # Predictions
    path('predictions/', views.PredictionListCreateView.as_view(), name='prediction-list-create'),
    path('predictions/<int:pk>/', views.PredictionDetailView.as_view(), name='prediction-detail'),
    
    # Leaderboard
    path('leaderboard/', views.CompanyLeaderboardView.as_view(), name='leaderboard'),
    
    # Statistics
    path('stats/company/', views.company_stats_view, name='company-stats'),
    path('stats/dashboard/', views.dashboard_stats_view, name='dashboard-stats'),
]