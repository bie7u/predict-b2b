from rest_framework import serializers
from .models import League, Match, Prediction, CompanyRanking
from companies.models import User


class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ['id', 'name', 'country', 'is_active']


class MatchSerializer(serializers.ModelSerializer):
    league_name = serializers.CharField(source='league.name', read_only=True)
    user_prediction = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'league', 'league_name', 'home_team', 'away_team', 
                 'match_date', 'home_score', 'away_score', 'is_finished', 'user_prediction']

    def get_user_prediction(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            prediction = obj.predictions.filter(user=user).first()
            if prediction:
                return {
                    'id': prediction.id,
                    'predicted_home_score': prediction.predicted_home_score,
                    'predicted_away_score': prediction.predicted_away_score,
                    'points_earned': prediction.points_earned
                }
        return None


class PredictionSerializer(serializers.ModelSerializer):
    match_details = MatchSerializer(source='match', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Prediction
        fields = ['id', 'match', 'match_details', 'predicted_home_score', 
                 'predicted_away_score', 'points_earned', 'user_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'points_earned', 'created_at', 'updated_at']

    def validate(self, attrs):
        match = attrs.get('match')
        user = self.context['request'].user
        
        # Check if match is already finished
        if match.is_finished:
            raise serializers.ValidationError("Cannot predict on finished matches.")
        
        # Check if user already has a prediction for this match (for updates)
        if self.instance is None:  # Creating new prediction
            existing_prediction = Prediction.objects.filter(user=user, match=match).first()
            if existing_prediction:
                raise serializers.ValidationError("You already have a prediction for this match.")
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CompanyRankingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = CompanyRanking
        fields = ['id', 'user', 'user_name', 'user_full_name', 'total_points', 
                 'total_predictions', 'rank', 'updated_at']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username