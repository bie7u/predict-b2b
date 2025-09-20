from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from predictions.models import League, Match
from companies.models import Company, User


class Command(BaseCommand):
    help = 'Populate database with sample data for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create leagues
        leagues_data = [
            ('Premier League', 'England'),
            ('La Liga', 'Spain'),
            ('Bundesliga', 'Germany'),
            ('Serie A', 'Italy'),
            ('Ligue 1', 'France'),
        ]

        for name, country in leagues_data:
            league, created = League.objects.get_or_create(
                name=name,
                defaults={'country': country, 'is_active': True}
            )
            if created:
                self.stdout.write(f'Created league: {name}')

        # Create sample companies
        companies_data = [
            'TechCorp Solutions',
            'Innovate Industries',
            'Digital Dynamics',
            'Future Systems Ltd',
            'Quantum Technologies'
        ]

        for company_name in companies_data:
            company, created = Company.objects.get_or_create(
                name=company_name,
                defaults={'is_active': True}
            )
            if created:
                self.stdout.write(f'Created company: {company_name}')

        # Create sample teams for each league
        teams_data = {
            'Premier League': [
                'Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham',
                'Newcastle', 'Brighton', 'Aston Villa', 'West Ham', 'Crystal Palace', 'Fulham',
                'Wolves', 'Everton', 'Brentford', 'Nottingham Forest', 'Luton Town', 'Burnley',
                'Sheffield United', 'Bournemouth'
            ],
            'La Liga': [
                'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Real Betis', 'Villarreal',
                'Real Sociedad', 'Athletic Bilbao', 'Valencia', 'Getafe', 'Osasuna', 'Las Palmas',
                'Girona', 'Cadiz', 'Mallorca', 'Rayo Vallecano', 'Celta Vigo', 'Alaves',
                'Granada', 'Almeria'
            ],
            'Bundesliga': [
                'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Union Berlin', 'SC Freiburg',
                'Bayer Leverkusen', 'Eintracht Frankfurt', 'Wolfsburg', 'Mainz', 'Borussia Monchengladbach',
                'FC Cologne', 'Augsburg', 'VfB Stuttgart', 'Werder Bremen', 'Hoffenheim',
                'VfL Bochum', 'Heidenheim', 'Darmstadt'
            ],
            'Serie A': [
                'Inter Milan', 'AC Milan', 'Juventus', 'Atalanta', 'Roma', 'Lazio',
                'Napoli', 'Fiorentina', 'Bologna', 'Torino', 'Monza', 'Genoa',
                'Lecce', 'Udinese', 'Frosinone', 'Empoli', 'Verona', 'Cagliari',
                'Sassuolo', 'Salernitana'
            ],
            'Ligue 1': [
                'Paris Saint-Germain', 'AS Monaco', 'Lille', 'Nice', 'Rennes', 'Lyon',
                'Marseille', 'Montpellier', 'Strasbourg', 'Nantes', 'Lens', 'Toulouse',
                'Reims', 'Brest', 'Le Havre', 'Metz', 'Lorient', 'Clermont Foot'
            ]
        }

        # Create matches for each league
        now = timezone.now()
        for league in League.objects.all():
            teams = teams_data.get(league.name, [])
            if not teams:
                continue

            # Create matches for next 4 weeks
            for week in range(4):
                week_start = now + timedelta(weeks=week)
                matches_this_week = min(10, len(teams) // 2)
                
                for i in range(matches_this_week):
                    home_team = random.choice(teams)
                    away_team = random.choice([t for t in teams if t != home_team])
                    match_date = week_start + timedelta(
                        days=random.randint(0, 6),
                        hours=random.randint(12, 20),
                        minutes=random.choice([0, 15, 30, 45])
                    )

                    match, created = Match.objects.get_or_create(
                        league=league,
                        home_team=home_team,
                        away_team=away_team,
                        match_date=match_date,
                        defaults={'is_finished': False}
                    )
                    
                    if created:
                        # Randomly finish some past matches
                        if match_date < now:
                            match.is_finished = True
                            match.home_score = random.randint(0, 4)
                            match.away_score = random.randint(0, 4)
                            match.save()

        # Create a superuser for admin access
        if not User.objects.filter(username='admin').exists():
            company = Company.objects.first()
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                company=company,
                is_company_admin=True
            )
            self.stdout.write('Created admin user: admin/admin123')

        # Create sample company admin users
        for company in Company.objects.all():
            if not company.employees.filter(is_company_admin=True).exists():
                admin_user = User.objects.create_user(
                    username=f'{company.name.lower().replace(" ", "_")}_admin',
                    email=f'admin@{company.name.lower().replace(" ", "")}.com',
                    password='password123',
                    company=company,
                    is_company_admin=True,
                    first_name='Company',
                    last_name='Admin'
                )
                self.stdout.write(f'Created company admin: {admin_user.username}/password123')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )