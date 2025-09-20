from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Company, User, League, Team, Match, Prediction, CompanyLeaderboard


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo', 'created_at', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'company', 'company_name', 'is_company_admin', 'date_joined']
        read_only_fields = ['date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'company']
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                data['user'] = user
                return data
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')


class LeagueSerializer(serializers.ModelSerializer):
    teams_count = serializers.IntegerField(source='teams.count', read_only=True)
    
    class Meta:
        model = League
        fields = ['id', 'name', 'country', 'logo_url', 'is_active', 'teams_count']


class TeamSerializer(serializers.ModelSerializer):
    league_name = serializers.CharField(source='league.name', read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'league', 'league_name', 'logo_url']


class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    league_name = serializers.CharField(source='home_team.league.name', read_only=True)
    league_id = serializers.IntegerField(source='home_team.league.id', read_only=True)
    user_prediction = serializers.SerializerMethodField()
    
    class Meta:
        model = Match
        fields = ['id', 'home_team', 'home_team_name', 'away_team', 'away_team_name',
                 'match_date', 'home_score', 'away_score', 'is_finished',
                 'league_name', 'league_id', 'user_prediction']
    
    def get_user_prediction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                prediction = obj.predictions.get(user=request.user)
                return PredictionSerializer(prediction).data
            except Prediction.DoesNotExist:
                return None
        return None


class PredictionSerializer(serializers.ModelSerializer):
    match_details = MatchSerializer(source='match', read_only=True)
    
    class Meta:
        model = Prediction
        fields = ['id', 'match', 'home_score_prediction', 'away_score_prediction',
                 'points_earned', 'created_at', 'updated_at', 'match_details']
        read_only_fields = ['points_earned', 'created_at', 'updated_at']
    
    def validate(self, data):
        match = data.get('match')
        if match and match.is_finished:
            raise serializers.ValidationError('Cannot predict finished matches.')
        
        # Check if match has already started (within 30 minutes of match time)
        from django.utils import timezone
        from datetime import timedelta
        if match and match.match_date <= timezone.now() + timedelta(minutes=30):
            raise serializers.ValidationError('Cannot predict matches that have already started.')
        
        return data


class PredictionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['match', 'home_score_prediction', 'away_score_prediction']
    
    def validate(self, data):
        match = data.get('match')
        if match and match.is_finished:
            raise serializers.ValidationError('Cannot predict finished matches.')
        
        # Check if match has already started
        from django.utils import timezone
        from datetime import timedelta
        if match and match.match_date <= timezone.now() + timedelta(minutes=30):
            raise serializers.ValidationError('Cannot predict matches that have already started.')
        
        return data


class CompanyLeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = CompanyLeaderboard
        fields = ['user', 'username', 'first_name', 'last_name', 'total_points', 
                 'total_predictions', 'correct_results', 'exact_scores', 'updated_at']