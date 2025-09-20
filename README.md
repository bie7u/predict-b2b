# Predict B2B - Football Match Prediction Platform

A B2B football match prediction web application that allows companies to purchase access for their employees to predict football matches in a fun, competitive environment.

![Dashboard Screenshot](https://github.com/user-attachments/assets/1efd9674-c00c-4862-ad52-df185abf9939)

## Features

### Core Functionality
- **B2B Company Management**: Companies can purchase access and manage their employees
- **Admin User Creation**: Company admins can add new users to their organization
- **Football Match Predictions**: Users can predict scores for upcoming football matches
- **Company-Specific Leagues**: Each company has its own prediction league and rankings
- **Top 5 Football Leagues**: Supports Premier League, La Liga, Bundesliga, Serie A, and Ligue 1
- **Smart Points System**: 
  - 5 points for exact score predictions
  - 3 points for correct result + goal difference
  - 1 point for correct result only
- **Real-time Rankings**: Company leaderboards with detailed statistics
- **Custom Company Logos**: Companies can upload their own logos

### Technical Features
- **Modern UI/UX**: Clean, mobile-first design using Tailwind CSS
- **Single Page Application**: React-based SPA with smooth navigation
- **Token Authentication**: Secure JWT-based authentication system
- **Server-side Filtering**: All data filtering performed on the backend
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Input Validation**: Comprehensive validation for all user inputs

## Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework 3.14.0** - API framework
- **Simple JWT** - Token authentication
- **SQLite** - Database (easily configurable for PostgreSQL/MySQL)
- **Pillow** - Image handling for company logos

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client

## Installation & Setup

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd predict-b2b
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Populate sample data**
   ```bash
   python manage.py populate_data
   ```

6. **Start the Django server**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Demo Accounts

After running `python manage.py populate_data`, the following accounts will be available:

### Super Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Company**: TechCorp Solutions

### Company Admins
- **TechCorp Solutions**: `techcorp_solutions_admin` / `password123`
- **Innovate Industries**: `innovate_industries_admin` / `password123`
- **Digital Dynamics**: `digital_dynamics_admin` / `password123`
- **Future Systems Ltd**: `future_systems_ltd_admin` / `password123`
- **Quantum Technologies**: `quantum_technologies_admin` / `password123`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - User login
- `GET /api/v1/users/profile/` - Get user profile
- `PATCH /api/v1/users/profile/` - Update user profile

### Company Management
- `GET /api/v1/companies/` - List companies
- `GET /api/v1/users/` - List company users
- `POST /api/v1/users/register/` - Register new user (admin only)

### Predictions
- `GET /api/v1/leagues/` - List football leagues
- `GET /api/v1/matches/` - List matches (with optional filters)
- `GET /api/v1/predictions/` - List user predictions
- `POST /api/v1/predictions/` - Create prediction
- `PATCH /api/v1/predictions/{id}/` - Update prediction

### Rankings
- `GET /api/v1/rankings/` - Get company rankings
- `POST /api/v1/rankings/update/` - Update rankings
- `GET /api/v1/stats/` - Get user statistics

## Project Structure

```
predict-b2b/
├── backend/                 # Django backend
│   ├── predict_b2b/        # Main Django project
│   ├── companies/          # Company and user management
│   ├── predictions/        # Predictions, matches, leagues
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main App component
│   ├── package.json       # Node dependencies
│   └── tailwind.config.js # Tailwind configuration
└── README.md              # This file
```

## Key Components

### Backend Models
- **Company**: Represents B2B companies with logo support
- **User**: Extended Django user with company association
- **League**: Football leagues (Premier League, La Liga, etc.)
- **Match**: Football matches with dates and results
- **Prediction**: User predictions for matches
- **CompanyRanking**: Company-specific user rankings

### Frontend Components
- **Login**: Authentication interface
- **Dashboard**: User overview with stats and recent activity
- **Matches**: Match listing with prediction interface
- **Rankings**: Company leaderboard
- **Admin**: User management for company admins
- **Navbar**: Navigation with responsive design

## Development Notes

### Authentication Flow
1. User logs in with username/password
2. Backend returns JWT access and refresh tokens
3. Frontend stores tokens and includes access token in API requests
4. Automatic token refresh on expiry

### Prediction System
1. Users can predict upcoming matches
2. Predictions are locked when matches start
3. Points are calculated after matches finish
4. Rankings are updated based on total points

### Mobile Responsiveness
The application is designed mobile-first with:
- Responsive navigation (hamburger menu on mobile)
- Touch-friendly interfaces
- Optimized layouts for all screen sizes

## Production Deployment

### Backend (Django)
1. Set `DEBUG = False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS for production domain
5. Use environment variables for sensitive settings

### Frontend (React)
1. Build production bundle: `npm run build`
2. Serve static files via web server (Nginx, Apache)
3. Configure API_URL environment variable

## License

This project is created for demonstration purposes. All rights reserved.

## Support

For issues and questions, please create an issue in the repository.