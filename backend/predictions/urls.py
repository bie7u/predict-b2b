from django.urls import path
from . import views

urlpatterns = [
    path('leagues/', views.LeagueListView.as_view(), name='league-list'),
    path('matches/', views.MatchListView.as_view(), name='match-list'),
    path('predictions/', views.PredictionListCreateView.as_view(), name='prediction-list-create'),
    path('predictions/<int:pk>/', views.PredictionDetailView.as_view(), name='prediction-detail'),
    path('rankings/', views.CompanyRankingView.as_view(), name='company-rankings'),
    path('rankings/update/', views.UpdateRankingsView.as_view(), name='update-rankings'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
]