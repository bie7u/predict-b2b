import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats, CompanyStats } from '../types';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Trophy, Target, Calendar, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [dashboard, company] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getCompanyStats()
        ]);
        setDashboardStats(dashboard);
        setCompanyStats(company);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-blue-100 mt-2">
              Ready to make some predictions for {companyStats?.company_name}?
            </p>
          </div>
          {companyStats?.company_logo && (
            <img 
              src={companyStats.company_logo} 
              alt="Company Logo" 
              className="h-16 w-16 object-contain rounded-lg bg-white/10 p-2"
            />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.total_points || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Predictions Made</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.total_predictions || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Matches</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.upcoming_matches || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.user_rank ? `#${dashboardStats.user_rank}` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Company Overview and Personal Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Company Overview" subtitle="Your company's prediction league statistics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{companyStats?.company_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Members:</span>
              <span className="font-medium">{companyStats?.users_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Predictions:</span>
              <span className="font-medium">{companyStats?.total_predictions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Points:</span>
              <span className="font-medium">{companyStats?.average_points}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Finished Matches:</span>
              <span className="font-medium">{companyStats?.finished_matches}</span>
            </div>
          </div>
        </Card>

        <Card title="Your Performance" subtitle="Your prediction statistics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Predictions Made:</span>
              <span className="font-medium">{dashboardStats?.total_predictions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Predictions Scored:</span>
              <span className="font-medium">{dashboardStats?.finished_predictions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Points:</span>
              <span className="font-medium text-green-600">
                {dashboardStats?.total_points}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Company Rank:</span>
              <span className="font-medium text-purple-600">
                {dashboardStats?.user_rank ? `#${dashboardStats.user_rank}` : 'Not ranked'}
              </span>
            </div>
            {dashboardStats?.finished_predictions && dashboardStats?.finished_predictions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Points:</span>
                <span className="font-medium">
                  {((dashboardStats?.total_points || 0) / dashboardStats.finished_predictions).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="What would you like to do next?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/matches"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">View Matches</p>
              <p className="text-sm text-blue-600">See upcoming fixtures</p>
            </div>
          </a>
          
          <a
            href="/predictions"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">My Predictions</p>
              <p className="text-sm text-green-600">Manage your predictions</p>
            </div>
          </a>
          
          <a
            href="/leaderboard"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Trophy className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-purple-900">Leaderboard</p>
              <p className="text-sm text-purple-600">See company rankings</p>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;