import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { predictionAPI } from '../services/api';
import { CompanyRanking } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Rankings: React.FC = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<CompanyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchRankings = async () => {
    try {
      const response = await predictionAPI.getRankings();
      setRankings(response.data.results);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRankings = async () => {
    setUpdating(true);
    try {
      await predictionAPI.updateRankings();
      await fetchRankings();
    } catch (error) {
      console.error('Error updating rankings:', error);
      alert('Error updating rankings. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3:
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-white border-gray-200';
    }
  };

  return (
    <>
      <Navbar>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Rankings</h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.company_name} League Standings
            </p>
          </div>
          <button
            onClick={updateRankings}
            disabled={updating}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {updating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Refresh Rankings'
            )}
          </button>
        </div>
      </Navbar>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading rankings...</p>
            </div>
          ) : rankings.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Rankings based on prediction accuracy and points earned
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {rankings.map((ranking, index) => (
                  <div
                    key={ranking.id}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      ranking.user === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getRankColor(ranking.rank)}`}>
                        <span className="text-xl">{getRankIcon(ranking.rank)}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ranking.user_full_name}
                          </h3>
                          {ranking.user === user?.id && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">@{ranking.user_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{ranking.total_points}</p>
                          <p className="text-xs text-gray-500">Points</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">{ranking.total_predictions}</p>
                          <p className="text-xs text-gray-500">Predictions</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">
                            {ranking.total_predictions > 0 
                              ? (ranking.total_points / ranking.total_predictions).toFixed(1)
                              : '0.0'
                            }
                          </p>
                          <p className="text-xs text-gray-500">Avg</p>
                        </div>

                        <div className="text-center min-w-[3rem]">
                          <p className="text-3xl font-bold text-primary-600">#{ranking.rank}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings available</h3>
              <p className="text-gray-500 mb-6">
                Rankings will appear once predictions are made and matches are completed.
              </p>
              <button
                onClick={updateRankings}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Calculate Rankings
              </button>
            </div>
          )}

          {/* Points System Explanation */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Points System</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium text-gray-900">Exact Score</p>
                  <p className="text-gray-600">5 points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-gray-900">Correct Result + Goal Difference</p>
                  <p className="text-gray-600">3 points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Correct Result</p>
                  <p className="text-gray-600">1 point</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rankings;