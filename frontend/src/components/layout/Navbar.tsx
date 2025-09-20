import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Trophy, 
  Calendar, 
  Target, 
  Users, 
  BarChart3,
  LogOut,
  Building
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/matches', label: 'Matches', icon: Calendar },
    { path: '/predictions', label: 'My Predictions', icon: Target },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(user?.is_company_admin ? [
      { path: '/admin/users', label: 'Manage Users', icon: Users },
      { path: '/admin/company', label: 'Company Settings', icon: Building }
    ] : []),
  ];

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8" />
              <span className="font-bold text-xl">Football Predictions</span>
            </div>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-blue-100">Welcome, </span>
              <span className="font-medium">{user?.first_name || user?.username}</span>
              <div className="text-xs text-blue-200">{user?.company_name}</div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;