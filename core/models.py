from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class Company(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class User(AbstractUser):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users')
    is_company_admin = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.company.name})"


class League(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    logo_url = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.country})"


class Team(models.Model):
    name = models.CharField(max_length=200)
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='teams')
    logo_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name


class Match(models.Model):
    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    match_date = models.DateTimeField()
    home_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    away_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Matches"

    def __str__(self):
        return f"{self.home_team} vs {self.away_team}"


class Prediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='predictions')
    home_score_prediction = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    away_score_prediction = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'match')

    def calculate_points(self):
        """Calculate points based on prediction accuracy"""
        if not self.match.is_finished:
            return 0
        
        actual_home = self.match.home_score
        actual_away = self.match.away_score
        pred_home = self.home_score_prediction
        pred_away = self.away_score_prediction
        
        points = 0
        
        # Exact score = 3 points
        if pred_home == actual_home and pred_away == actual_away:
            points = 3
        # Correct goal difference = 2 points
        elif (pred_home - pred_away) == (actual_home - actual_away):
            points = 2
        # Correct result (win/draw/loss) = 1 point
        elif ((pred_home > pred_away) and (actual_home > actual_away)) or \
             ((pred_home < pred_away) and (actual_home < actual_away)) or \
             ((pred_home == pred_away) and (actual_home == actual_away)):
            points = 1
        
        self.points_earned = points
        self.save()
        return points

    def __str__(self):
        return f"{self.user.username}: {self.home_score_prediction}-{self.away_score_prediction} for {self.match}"


class CompanyLeaderboard(models.Model):
    """Aggregated leaderboard for each company"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='leaderboards')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_points = models.IntegerField(default=0)
    total_predictions = models.IntegerField(default=0)
    correct_results = models.IntegerField(default=0)
    exact_scores = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('company', 'user')
        ordering = ['-total_points', '-correct_results', '-exact_scores']

    def update_stats(self):
        """Update leaderboard statistics for this user"""
        predictions = self.user.predictions.filter(match__is_finished=True)
        self.total_predictions = predictions.count()
        self.total_points = sum(p.points_earned for p in predictions)
        self.exact_scores = predictions.filter(points_earned=3).count()
        self.correct_results = predictions.filter(points_earned__gte=1).count()
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.company.name}: {self.total_points} points"
