import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { predictionAPI } from '../services/api';
import { UserStats, Match, Prediction } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, matchesResponse, predictionsResponse] = await Promise.all([
          predictionAPI.getUserStats(),
          predictionAPI.getMatches({ status: 'upcoming' }),
          predictionAPI.getPredictions(),
        ]);

        setStats(statsResponse.data);
        setRecentMatches(matchesResponse.data.results.slice(0, 5));
        setUserPredictions(predictionsResponse.data.results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              You're playing for <span className="font-semibold">{user?.company_name}</span>
            </p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="text-3xl text-blue-500">📊</div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total_points}</p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="text-3xl text-green-500">🎯</div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total_predictions}</p>
                    <p className="text-sm text-gray-600">Total Predictions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="text-3xl text-yellow-500">⭐</div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.exact_predictions}</p>
                    <p className="text-sm text-gray-600">Exact Predictions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="text-3xl text-purple-500">📈</div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.average_points}</p>
                    <p className="text-sm text-gray-600">Avg Points</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Matches */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Matches</h2>
              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-sm text-gray-600">{match.league_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(match.match_date).toLocaleDateString()} {new Date(match.match_date).toLocaleTimeString()}
                        </p>
                      </div>
                      {match.user_prediction ? (
                        <div className="text-sm text-green-600 font-medium">
                          {match.user_prediction.predicted_home_score}-{match.user_prediction.predicted_away_score}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No prediction</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming matches found.</p>
              )}
            </div>

            {/* Recent Predictions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Predictions</h2>
              {userPredictions.length > 0 ? (
                <div className="space-y-4">
                  {userPredictions.map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {prediction.match_details?.home_team} vs {prediction.match_details?.away_team}
                        </p>
                        <p className="text-sm text-gray-600">{prediction.match_details?.league_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {prediction.predicted_home_score}-{prediction.predicted_away_score}
                        </p>
                        <p className="text-xs text-gray-500">{prediction.points_earned} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No predictions made yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;