from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from companies.models import User


class League(models.Model):
    """Football leagues (Premier League, La Liga, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.country})"


class Match(models.Model):
    """Football matches"""
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='matches')
    home_team = models.CharField(max_length=100)
    away_team = models.CharField(max_length=100)
    match_date = models.DateTimeField()
    home_score = models.PositiveIntegerField(null=True, blank=True)
    away_score = models.PositiveIntegerField(null=True, blank=True)
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Matches"
        ordering = ['match_date']

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.league.name}"


class Prediction(models.Model):
    """User predictions for football matches"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='predictions')
    predicted_home_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    predicted_away_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'match']

    def __str__(self):
        return f"{self.user.username}: {self.match.home_team} {self.predicted_home_score}-{self.predicted_away_score} {self.match.away_team}"

    def calculate_points(self):
        """Calculate points based on prediction accuracy"""
        if not self.match.is_finished:
            return 0
        
        points = 0
        home_score = self.match.home_score
        away_score = self.match.away_score
        pred_home = self.predicted_home_score
        pred_away = self.predicted_away_score
        
        # Exact score prediction: 5 points
        if pred_home == home_score and pred_away == away_score:
            points = 5
        # Correct result (win/draw/loss) and goal difference: 3 points
        elif (pred_home - pred_away == home_score - away_score and 
              ((pred_home > pred_away and home_score > away_score) or
               (pred_home < pred_away and home_score < away_score) or
               (pred_home == pred_away and home_score == away_score))):
            points = 3
        # Correct result (win/draw/loss): 1 point
        elif ((pred_home > pred_away and home_score > away_score) or
              (pred_home < pred_away and home_score < away_score) or
              (pred_home == pred_away and home_score == away_score)):
            points = 1
        
        self.points_earned = points
        self.save()
        return points


class CompanyRanking(models.Model):
    """Company-specific user rankings"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rankings')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='rankings')
    total_points = models.IntegerField(default=0)
    total_predictions = models.IntegerField(default=0)
    rank = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'company']
        ordering = ['-total_points', 'total_predictions']

    def __str__(self):
        return f"{self.user.username} - {self.company.name}: {self.total_points} points"
