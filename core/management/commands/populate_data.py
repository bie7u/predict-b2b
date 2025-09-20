from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from core.models import Company, User, League, Team, Match, CompanyLeaderboard
import random


class Command(BaseCommand):
    help = 'Populate the database with mock data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate mock data...'))

        # Create companies
        companies_data = [
            {'name': 'TechCorp Solutions', 'is_active': True},
            {'name': 'Global Dynamics Inc', 'is_active': True},
            {'name': 'Innovation Hub Ltd', 'is_active': True},
        ]

        for company_data in companies_data:
            company, created = Company.objects.get_or_create(**company_data)
            if created:
                self.stdout.write(f'Created company: {company.name}')

        # Create leagues
        leagues_data = [
            {'name': 'Premier League', 'country': 'England'},
            {'name': 'La Liga', 'country': 'Spain'},
            {'name': 'Bundesliga', 'country': 'Germany'},
            {'name': 'Serie A', 'country': 'Italy'},
            {'name': 'Ligue 1', 'country': 'France'},
        ]

        for league_data in leagues_data:
            league, created = League.objects.get_or_create(**league_data)
            if created:
                self.stdout.write(f'Created league: {league.name}')

        # Create teams for each league
        teams_data = {
            'Premier League': [
                'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 
                'Manchester United', 'Tottenham', 'Newcastle', 'Brighton'
            ],
            'La Liga': [
                'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla',
                'Real Betis', 'Real Sociedad', 'Valencia', 'Villarreal'
            ],
            'Bundesliga': [
                'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
                'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg', 'Union Berlin'
            ],
            'Serie A': [
                'Inter Milan', 'AC Milan', 'Juventus', 'Napoli',
                'Roma', 'Lazio', 'Atalanta', 'Fiorentina'
            ],
            'Ligue 1': [
                'Paris Saint-Germain', 'Marseille', 'Monaco', 'Lyon',
                'Nice', 'Rennes', 'Lille', 'Nantes'
            ]
        }

        for league_name, team_names in teams_data.items():
            league = League.objects.get(name=league_name)
            for team_name in team_names:
                team, created = Team.objects.get_or_create(
                    name=team_name, 
                    league=league
                )
                if created:
                    self.stdout.write(f'Created team: {team_name}')

        # Create users for each company
        company1 = Company.objects.get(name='TechCorp Solutions')
        company2 = Company.objects.get(name='Global Dynamics Inc')
        company3 = Company.objects.get(name='Innovation Hub Ltd')

        # Create admin users
        admin_users = [
            {
                'username': 'admin_techcorp',
                'email': 'admin@techcorp.com',
                'first_name': 'Admin',
                'last_name': 'TechCorp',
                'company': company1,
                'is_company_admin': True
            },
            {
                'username': 'admin_global',
                'email': 'admin@global.com',
                'first_name': 'Admin',
                'last_name': 'Global',
                'company': company2,
                'is_company_admin': True
            },
            {
                'username': 'admin_innovation',
                'email': 'admin@innovation.com',
                'first_name': 'Admin',
                'last_name': 'Innovation',
                'company': company3,
                'is_company_admin': True
            }
        ]

        for admin_data in admin_users:
            user, created = User.objects.get_or_create(
                username=admin_data['username'],
                defaults=admin_data
            )
            if created:
                user.set_password('admin123')
                user.save()
                self.stdout.write(f'Created admin user: {user.username}')

        # Create regular users
        regular_users = [
            {'username': 'john_doe', 'email': 'john@techcorp.com', 'first_name': 'John', 'last_name': 'Doe', 'company': company1},
            {'username': 'jane_smith', 'email': 'jane@techcorp.com', 'first_name': 'Jane', 'last_name': 'Smith', 'company': company1},
            {'username': 'mike_wilson', 'email': 'mike@global.com', 'first_name': 'Mike', 'last_name': 'Wilson', 'company': company2},
            {'username': 'sarah_jones', 'email': 'sarah@global.com', 'first_name': 'Sarah', 'last_name': 'Jones', 'company': company2},
            {'username': 'alex_brown', 'email': 'alex@innovation.com', 'first_name': 'Alex', 'last_name': 'Brown', 'company': company3},
        ]

        for user_data in regular_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('user123')
                user.save()
                self.stdout.write(f'Created user: {user.username}')

        # Create matches
        now = timezone.now()
        leagues = League.objects.all()

        for league in leagues:
            teams = list(league.teams.all())
            if len(teams) < 2:
                continue

            # Create past matches (finished)
            for i in range(10):
                home_team = random.choice(teams)
                away_team = random.choice([t for t in teams if t != home_team])
                
                match_date = now - timedelta(days=random.randint(1, 30))
                home_score = random.randint(0, 4)
                away_score = random.randint(0, 4)
                
                match, created = Match.objects.get_or_create(
                    home_team=home_team,
                    away_team=away_team,
                    match_date=match_date,
                    defaults={
                        'home_score': home_score,
                        'away_score': away_score,
                        'is_finished': True
                    }
                )
                if created:
                    self.stdout.write(f'Created finished match: {match}')

            # Create upcoming matches
            for i in range(15):
                home_team = random.choice(teams)
                away_team = random.choice([t for t in teams if t != home_team])
                
                match_date = now + timedelta(days=random.randint(1, 30))
                
                match, created = Match.objects.get_or_create(
                    home_team=home_team,
                    away_team=away_team,
                    match_date=match_date,
                    defaults={
                        'is_finished': False
                    }
                )
                if created:
                    self.stdout.write(f'Created upcoming match: {match}')

        # Initialize leaderboards for all companies
        for company in Company.objects.all():
            for user in company.users.all():
                leaderboard, created = CompanyLeaderboard.objects.get_or_create(
                    company=company,
                    user=user
                )
                leaderboard.update_stats()
                if created:
                    self.stdout.write(f'Created leaderboard entry for {user.username}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated mock data!')
        )
        self.stdout.write('Login credentials:')
        self.stdout.write('Admins: admin_techcorp, admin_global, admin_innovation (password: admin123)')
        self.stdout.write('Users: john_doe, jane_smith, mike_wilson, sarah_jones, alex_brown (password: user123)')