from django.contrib import admin
from .models import League, Match, Prediction, CompanyRanking


@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'is_active')
    list_filter = ('is_active', 'country')
    search_fields = ('name', 'country')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('home_team', 'away_team', 'league', 'match_date', 'is_finished')
    list_filter = ('is_finished', 'league', 'match_date')
    search_fields = ('home_team', 'away_team')
    date_hierarchy = 'match_date'


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'match', 'predicted_home_score', 'predicted_away_score', 'points_earned')
    list_filter = ('points_earned', 'match__league', 'created_at')
    search_fields = ('user__username', 'match__home_team', 'match__away_team')


@admin.register(CompanyRanking)
class CompanyRankingAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'total_points', 'total_predictions', 'rank')
    list_filter = ('company', 'rank')
    search_fields = ('user__username', 'company__name')
