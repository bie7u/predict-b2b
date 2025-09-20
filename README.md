# B2B Football Prediction Web Application

A complete B2B football prediction platform where companies can purchase access to provide their employees with an engaging football prediction experience.

## 🏗️ Architecture

- **Backend**: Django REST Framework with JWT authentication
- **Frontend**: React with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT token-based system

## ✨ Features

### 🔐 Authentication & Security
- JWT token-based authentication
- Company-specific user isolation
- Role-based permissions (Admin/User)
- Protected routes and API endpoints

### 🏢 B2B Company Management  
- Each company has its own prediction league
- Company admins can manage users
- Company-specific statistics and leaderboards
- Company logo upload support

### ⚽ Football Prediction System
- **Top 5 European Leagues**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
- 200+ matches with real team data
- Interactive prediction interface
- Smart scoring system (3-2-1 points)
- Time-based prediction validation

### 🏆 Leaderboard & Rankings
- Company-specific leaderboards
- Real-time ranking updates
- Comprehensive statistics tracking
- Performance analytics

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip & npm

### Backend Setup

1. **Install Python dependencies:**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
```

2. **Run database migrations:**
```bash
python manage.py migrate
```

3. **Populate with demo data:**
```bash
python manage.py populate_data
```

4. **Start Django server:**
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start React development server:**
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

## 🎮 Demo Credentials

### Company Administrators
- **TechCorp Solutions**: `admin_techcorp` / `admin123`
- **Global Dynamics**: `admin_global` / `admin123`
- **Innovation Hub**: `admin_innovation` / `admin123`

### Regular Users
- `john_doe` / `user123` (TechCorp Solutions)
- `jane_smith` / `user123` (TechCorp Solutions)
- `mike_wilson` / `user123` (Global Dynamics)

## 📱 Application Flow

1. **Login** with demo credentials
2. **Dashboard** - View statistics and quick actions
3. **Matches** - Browse and predict upcoming matches
4. **My Predictions** - Manage your predictions
5. **Leaderboard** - View company rankings
6. **Admin Panel** - Manage users (admin only)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout  
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile

### Matches & Predictions
- `GET /api/leagues/` - List football leagues
- `GET /api/matches/` - List matches (filterable)
- `GET/POST /api/predictions/` - Manage predictions
- `PATCH/DELETE /api/predictions/{id}/` - Update/delete specific prediction

### Leaderboard & Stats
- `GET /api/leaderboard/` - Company leaderboard
- `GET /api/stats/company/` - Company statistics
- `GET /api/stats/dashboard/` - User dashboard stats

### User Management (Admin Only)
- `GET/POST /api/users/` - List/create company users
- `GET/PATCH/DELETE /api/users/{id}/` - Manage specific user

## 🏆 Scoring System

- **3 Points**: Exact score match
- **2 Points**: Correct goal difference  
- **1 Point**: Correct result (win/draw/loss)
- **0 Points**: Incorrect prediction

## 🔒 Security Features

- JWT access/refresh token authentication
- Company-based data isolation
- Input validation and sanitization
- CORS protection
- Time-based prediction restrictions

## 📊 Technical Specifications

### Backend (Django)
- Django REST Framework for API
- Custom User model with company association
- Comprehensive data models and relationships
- Automated leaderboard calculations
- Mock data with realistic match fixtures

### Frontend (React)
- TypeScript for type safety
- Context API for state management
- Responsive design with custom CSS
- Protected routes and authentication handling
- Real-time API integration

## 🚀 Production Deployment

### Backend
1. Configure PostgreSQL database
2. Set up environment variables
3. Configure static files serving
4. Use gunicorn/uwsgi for WSGI server

### Frontend  
1. Run `npm run build`
2. Serve static files with nginx
3. Configure API proxy settings

## 📂 Project Structure

```
predict-b2b/
├── backend/               # Django settings
├── core/                  # Main Django app
│   ├── models.py         # Database models
│   ├── views.py          # API endpoints
│   ├── serializers.py    # Data serialization
│   └── management/       # Management commands
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Application pages
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript definitions
└── db.sqlite3           # Database file
```

## 📋 Requirements Fulfilled

- ✅ B2B approach with company isolation
- ✅ Admin user management capabilities  
- ✅ Company-specific prediction leagues
- ✅ Football match predictions
- ✅ Rankings and leaderboards
- ✅ Company logo support
- ✅ Top 5 European leagues
- ✅ Input validation (0-10 goals)
- ✅ React frontend + Django REST backend
- ✅ Server-side filtering
- ✅ JWT authentication
- ✅ Production-ready application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.