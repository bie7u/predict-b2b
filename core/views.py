from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Company, User, League, Team, Match, Prediction, CompanyLeaderboard
from .serializers import (
    CompanySerializer, UserSerializer, UserCreateSerializer, LoginSerializer,
    LeagueSerializer, TeamSerializer, MatchSerializer, PredictionSerializer,
    PredictionCreateUpdateSerializer, CompanyLeaderboardSerializer
)


class CompanyPermission(permissions.BasePermission):
    """Only company admins can access company management endpoints"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_company_admin


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [CompanyPermission]
    
    def get_queryset(self):
        # Company admins can only see users from their company
        return User.objects.filter(company=self.request.user.company)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def perform_create(self, serializer):
        # Automatically assign new users to the admin's company
        serializer.save(company=self.request.user.company)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [CompanyPermission]
    
    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company)


class LeagueListView(generics.ListAPIView):
    serializer_class = LeagueSerializer
    queryset = League.objects.filter(is_active=True)


class MatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    
    def get_queryset(self):
        queryset = Match.objects.select_related('home_team', 'away_team', 'home_team__league')
        
        # Filter by league
        league_id = self.request.query_params.get('league')
        if league_id:
            queryset = queryset.filter(home_team__league_id=league_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'upcoming':
            queryset = queryset.filter(is_finished=False, match_date__gt=timezone.now())
        elif status_filter == 'finished':
            queryset = queryset.filter(is_finished=True)
        elif status_filter == 'live':
            # Matches that started but not finished
            now = timezone.now()
            queryset = queryset.filter(
                is_finished=False, 
                match_date__lte=now,
                match_date__gte=now - timedelta(hours=2)
            )
        
        # Default ordering: upcoming matches first, then by date
        return queryset.order_by('is_finished', 'match_date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PredictionListCreateView(generics.ListCreateAPIView):
    serializer_class = PredictionSerializer
    
    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user).select_related('match', 'match__home_team', 'match__away_team')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PredictionCreateUpdateSerializer
        return PredictionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PredictionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PredictionCreateUpdateSerializer
    
    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user)


class CompanyLeaderboardView(generics.ListAPIView):
    serializer_class = CompanyLeaderboardSerializer
    
    def get_queryset(self):
        # Only show leaderboard for the user's company
        company = self.request.user.company
        
        # Update leaderboard stats for all users in the company
        for user in company.users.all():
            leaderboard, created = CompanyLeaderboard.objects.get_or_create(
                company=company, 
                user=user
            )
            leaderboard.update_stats()
        
        return CompanyLeaderboard.objects.filter(company=company).order_by('-total_points', '-correct_results', '-exact_scores')


@api_view(['GET'])
def company_stats_view(request):
    """Get statistics for the user's company"""
    company = request.user.company
    users_count = company.users.count()
    total_predictions = Prediction.objects.filter(user__company=company).count()
    finished_matches = Match.objects.filter(is_finished=True).count()
    
    # Calculate average points per user
    leaderboard_entries = CompanyLeaderboard.objects.filter(company=company)
    avg_points = leaderboard_entries.aggregate(Avg('total_points'))['total_points__avg'] or 0
    
    return Response({
        'company_name': company.name,
        'company_logo': company.logo.url if company.logo else None,
        'users_count': users_count,
        'total_predictions': total_predictions,
        'finished_matches': finished_matches,
        'average_points': round(avg_points, 2)
    })


@api_view(['GET'])
def dashboard_stats_view(request):
    """Get dashboard statistics for the current user"""
    user = request.user
    
    # User's predictions
    total_predictions = user.predictions.count()
    finished_predictions = user.predictions.filter(match__is_finished=True).count()
    
    # User's points
    total_points = sum(p.points_earned for p in user.predictions.filter(match__is_finished=True))
    
    # Upcoming matches user can predict
    upcoming_matches = Match.objects.filter(
        is_finished=False,
        match_date__gt=timezone.now()
    ).count()
    
    # User's rank in company
    try:
        leaderboard = CompanyLeaderboard.objects.filter(
            company=user.company
        ).order_by('-total_points', '-correct_results', '-exact_scores')
        
        user_rank = None
        for idx, entry in enumerate(leaderboard, 1):
            if entry.user == user:
                user_rank = idx
                break
    except:
        user_rank = None
    
    return Response({
        'total_predictions': total_predictions,
        'finished_predictions': finished_predictions,
        'total_points': total_points,
        'upcoming_matches': upcoming_matches,
        'user_rank': user_rank,
        'company_users_count': user.company.users.count()
    })
