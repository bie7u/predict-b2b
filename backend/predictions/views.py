from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.utils import timezone
from .models import League, Match, Prediction, CompanyRanking
from .serializers import (
    LeagueSerializer, MatchSerializer, PredictionSerializer, CompanyRankingSerializer
)


class LeagueListView(generics.ListAPIView):
    """List all active football leagues"""
    queryset = League.objects.filter(is_active=True)
    serializer_class = LeagueSerializer
    permission_classes = [permissions.IsAuthenticated]


class MatchListView(generics.ListAPIView):
    """List matches with optional filtering by league"""
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Match.objects.all().order_by('match_date')
        league_id = self.request.query_params.get('league', None)
        status_filter = self.request.query_params.get('status', None)
        
        if league_id is not None:
            queryset = queryset.filter(league_id=league_id)
        
        if status_filter == 'upcoming':
            queryset = queryset.filter(is_finished=False, match_date__gte=timezone.now())
        elif status_filter == 'finished':
            queryset = queryset.filter(is_finished=True)
        elif status_filter == 'live':
            # Matches that should be happening now (within 2 hours of start time)
            now = timezone.now()
            queryset = queryset.filter(
                match_date__lte=now,
                match_date__gte=now - timezone.timedelta(hours=2),
                is_finished=False
            )
        
        return queryset


class PredictionListCreateView(generics.ListCreateAPIView):
    """List user's predictions or create a new prediction"""
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user).order_by('-created_at')


class PredictionDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a specific prediction"""
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user)


class CompanyRankingView(generics.ListAPIView):
    """View company rankings for the user's company"""
    serializer_class = CompanyRankingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        company = self.request.user.company
        return CompanyRanking.objects.filter(company=company).order_by('rank')


class UpdateRankingsView(APIView):
    """Update company rankings based on current predictions"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        company = request.user.company
        
        # Calculate points for all users in the company
        users_in_company = company.employees.all()
        
        for user in users_in_company:
            total_points = user.predictions.aggregate(Sum('points_earned'))['points_earned__sum'] or 0
            total_predictions = user.predictions.count()
            
            ranking, created = CompanyRanking.objects.get_or_create(
                user=user,
                company=company,
                defaults={'total_points': total_points, 'total_predictions': total_predictions}
            )
            
            if not created:
                ranking.total_points = total_points
                ranking.total_predictions = total_predictions
                ranking.save()
        
        # Update ranks
        rankings = CompanyRanking.objects.filter(company=company).order_by('-total_points', 'total_predictions')
        for index, ranking in enumerate(rankings, start=1):
            ranking.rank = index
            ranking.save()
        
        return Response({'message': 'Rankings updated successfully'})


class UserStatsView(APIView):
    """Get user statistics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        predictions = user.predictions.all()
        
        stats = {
            'total_predictions': predictions.count(),
            'total_points': predictions.aggregate(Sum('points_earned'))['points_earned__sum'] or 0,
            'exact_predictions': predictions.filter(points_earned=5).count(),
            'result_and_difference_predictions': predictions.filter(points_earned=3).count(),
            'result_only_predictions': predictions.filter(points_earned=1).count(),
            'wrong_predictions': predictions.filter(points_earned=0).count(),
        }
        
        # Calculate average points
        if stats['total_predictions'] > 0:
            stats['average_points'] = round(stats['total_points'] / stats['total_predictions'], 2)
        else:
            stats['average_points'] = 0
        
        return Response(stats)
