from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Company, User, League, Team, Match, Prediction, CompanyLeaderboard


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'company', 'is_company_admin', 'is_active')
    list_filter = ('is_company_admin', 'is_active', 'company')
    search_fields = ('username', 'email', 'company__name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Company Info', {'fields': ('company', 'is_company_admin')}),
    )


@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'is_active')
    list_filter = ('country', 'is_active')
    search_fields = ('name', 'country')


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'league')
    list_filter = ('league',)
    search_fields = ('name', 'league__name')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('home_team', 'away_team', 'match_date', 'is_finished', 'home_score', 'away_score')
    list_filter = ('is_finished', 'match_date', 'home_team__league')
    search_fields = ('home_team__name', 'away_team__name')
    date_hierarchy = 'match_date'


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'match', 'home_score_prediction', 'away_score_prediction', 'points_earned', 'created_at')
    list_filter = ('points_earned', 'match__is_finished', 'user__company')
    search_fields = ('user__username', 'match__home_team__name', 'match__away_team__name')
    readonly_fields = ('points_earned',)


@admin.register(CompanyLeaderboard)
class CompanyLeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'total_points', 'total_predictions', 'correct_results', 'exact_scores')
    list_filter = ('company',)
    search_fields = ('user__username', 'company__name')
    readonly_fields = ('total_points', 'total_predictions', 'correct_results', 'exact_scores')
