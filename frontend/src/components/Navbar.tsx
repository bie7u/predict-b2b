import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl">⚽</span>
              <span className="ml-2 text-xl font-bold text-gray-900">Predict B2B</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/matches')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Matches
                </button>
                <button
                  onClick={() => navigate('/rankings')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Rankings
                </button>
                {user?.is_company_admin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              <span className="font-medium">{user?.first_name || user?.username}</span>
              <span className="ml-1 text-xs">@ {user?.company_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/matches')}
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Matches
          </button>
          <button
            onClick={() => navigate('/rankings')}
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Rankings
          </button>
          {user?.is_company_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Admin
            </button>
          )}
        </div>
      </div>

      {children && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;