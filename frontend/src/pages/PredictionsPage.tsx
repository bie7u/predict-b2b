import React, { useEffect, useState } from 'react';
import { Prediction } from '../types';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Target, Trophy, Clock, CheckCircle, XCircle, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO, isBefore, addMinutes } from 'date-fns';

const PredictionsPage: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPredictions();
      setPredictions(data);
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (predictionId: number) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) {
      return;
    }

    try {
      await apiService.deletePrediction(predictionId);
      setPredictions(prev => prev.filter(p => p.id !== predictionId));
    } catch (err: any) {
      console.error('Error deleting prediction:', err);
      alert('Failed to delete prediction');
    }
  };

  const canEdit = (prediction: Prediction) => {
    if (!prediction.match_details || prediction.match_details.is_finished) {
      return false;
    }
    const matchTime = parseISO(prediction.match_details.match_date);
    const now = new Date();
    return isBefore(addMinutes(now, 30), matchTime);
  };

  const getResultIcon = (prediction: Prediction) => {
    if (!prediction.match_details?.is_finished) {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }

    if (prediction.points_earned > 0) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getPointsColor = (points: number) => {
    switch (points) {
      case 3: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 1: return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPointsDescription = (points: number) => {
    switch (points) {
      case 3: return 'Exact Score!';
      case 2: return 'Goal Difference';
      case 1: return 'Correct Result';
      default: return 'No Points';
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    if (filter === 'all') return true;
    if (filter === 'finished') return prediction.match_details?.is_finished;
    if (filter === 'upcoming') return !prediction.match_details?.is_finished;
    return true;
  });

  const totalPoints = predictions
    .filter(p => p.match_details?.is_finished)
    .reduce((sum, p) => sum + p.points_earned, 0);

  const exactScores = predictions.filter(p => p.points_earned === 3).length;
  const correctResults = predictions.filter(p => p.points_earned >= 1).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading predictions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Target className="h-8 w-8 mr-3 text-blue-600" />
          My Predictions
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-green-600">
                {totalPoints}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct Results</p>
              <p className="text-2xl font-bold text-gray-900">
                {correctResults}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exact Scores</p>
              <p className="text-2xl font-bold text-gray-900">
                {exactScores}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Predictions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'finished', label: 'Finished' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === item.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't made any predictions yet." 
                  : `No ${filter} predictions found.`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <a href="/matches" className="text-blue-600 hover:text-blue-700">
                  Browse matches
                </a> to start making predictions!
              </p>
            </div>
          </Card>
        ) : (
          filteredPredictions
            .sort((a, b) => {
              if (!a.match_details || !b.match_details) return 0;
              return new Date(b.match_details.match_date).getTime() - new Date(a.match_details.match_date).getTime();
            })
            .map(prediction => {
              const match = prediction.match_details;
              if (!match) return null;

              const canEditPrediction = canEdit(prediction);

              return (
                <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {match.league_name}
                        </span>
                        <div className="flex items-center space-x-2">
                          {getResultIcon(prediction)}
                          {match.is_finished && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPointsColor(prediction.points_earned)}`}>
                              {prediction.points_earned} pts - {getPointsDescription(prediction.points_earned)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center mb-4">
                        {/* Home Team */}
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 mb-1">
                            {match.home_team_name}
                          </p>
                          <div className="flex flex-col space-y-1">
                            <span className="text-lg font-bold text-blue-600">
                              {prediction.home_score_prediction}
                            </span>
                            {match.is_finished && (
                              <span className="text-sm text-gray-500">
                                (Actual: {match.home_score})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <p className="text-gray-500 text-sm mb-2">vs</p>
                          <p className="text-xs text-gray-400">
                            Your Prediction
                          </p>
                        </div>

                        {/* Away Team */}
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 mb-1">
                            {match.away_team_name}
                          </p>
                          <div className="flex flex-col space-y-1">
                            <span className="text-lg font-bold text-blue-600">
                              {prediction.away_score_prediction}
                            </span>
                            {match.is_finished && (
                              <span className="text-sm text-gray-500">
                                (Actual: {match.away_score})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(parseISO(match.match_date), 'MMM d, yyyy HH:mm')}
                        </div>
                        <div>
                          Predicted: {format(parseISO(prediction.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {canEditPrediction && (
                        <>
                          <a
                            href={`/matches?highlight=${match.id}`}
                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </a>
                          <button
                            onClick={() => deletePrediction(prediction.id)}
                            className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;