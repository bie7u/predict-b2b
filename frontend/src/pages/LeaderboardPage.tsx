import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, CompanyStats } from '../types';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Trophy, Medal, Award, Target, TrendingUp, Users } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, statsData] = await Promise.all([
        apiService.getLeaderboard(),
        apiService.getCompanyStats()
      ]);
      setLeaderboard(leaderboardData);
      setCompanyStats(statsData);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-600 font-semibold">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getCurrentUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.user === user?.id);
    return userEntry ? leaderboard.indexOf(userEntry) + 1 : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
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

  const userRank = getCurrentUserRank();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Trophy className="h-8 w-8 mr-3" />
              Company Leaderboard
            </h1>
            <p className="text-purple-100 mt-2">
              {companyStats?.company_name} - Football Prediction League
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

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyStats?.users_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyStats?.total_predictions || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyStats?.average_points || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                {userRank ? `#${userRank}` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card title="Rankings" subtitle="Based on total points earned from predictions">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rankings available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Start making predictions to see the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user === user?.id;
              const bgColor = getRankBgColor(rank);
              
              return (
                <div
                  key={entry.user}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${bgColor} ${
                    isCurrentUser ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(rank)}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-gray-900">
                        {entry.first_name} {entry.last_name}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">@{entry.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-lg text-green-600">
                        {entry.total_points}
                      </p>
                      <p className="text-gray-500">Points</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium text-gray-900">
                        {entry.total_predictions}
                      </p>
                      <p className="text-gray-500">Predictions</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium text-gray-900">
                        {entry.correct_results}
                      </p>
                      <p className="text-gray-500">Correct</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium text-gray-900">
                        {entry.exact_scores}
                      </p>
                      <p className="text-gray-500">Exact</p>
                    </div>
                    
                    {entry.total_predictions > 0 && (
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {((entry.total_points / entry.total_predictions) * 100).toFixed(0)}%
                        </p>
                        <p className="text-gray-500">Accuracy</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Scoring System Info */}
      <Card title="Scoring System" subtitle="How points are calculated">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">3 Points</div>
            <p className="text-sm text-gray-700">Exact Score Match</p>
            <p className="text-xs text-gray-500 mt-1">
              Predict the exact final score
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">2 Points</div>
            <p className="text-sm text-gray-700">Goal Difference</p>
            <p className="text-xs text-gray-500 mt-1">
              Correct goal difference but wrong scores
            </p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">1 Point</div>
            <p className="text-sm text-gray-700">Correct Result</p>
            <p className="text-xs text-gray-500 mt-1">
              Correct winner or draw prediction
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LeaderboardPage;