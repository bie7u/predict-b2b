import React, { useEffect, useState } from 'react';
import { Match, League, PredictionRequest } from '../types';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, Clock, Trophy, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO, isBefore, addMinutes } from 'date-fns';

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'finished' | 'live'>('upcoming');
  const [error, setError] = useState('');
  const [predictionModal, setPredictionModal] = useState<{
    match: Match | null;
    homeScore: string;
    awayScore: string;
    loading: boolean;
  }>({
    match: null,
    homeScore: '',
    awayScore: '',
    loading: false
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [selectedLeague, selectedStatus]);

  const fetchLeagues = async () => {
    try {
      const data = await apiService.getLeagues();
      setLeagues(data);
    } catch (err) {
      console.error('Error fetching leagues:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedLeague) filters.league = selectedLeague;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      
      const data = await apiService.getMatches(filters);
      setMatches(data);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const openPredictionModal = (match: Match) => {
    setPredictionModal({
      match,
      homeScore: match.user_prediction?.home_score_prediction.toString() || '',
      awayScore: match.user_prediction?.away_score_prediction.toString() || '',
      loading: false
    });
  };

  const closePredictionModal = () => {
    setPredictionModal({
      match: null,
      homeScore: '',
      awayScore: '',
      loading: false
    });
  };

  const submitPrediction = async () => {
    if (!predictionModal.match) return;

    const homeScore = parseInt(predictionModal.homeScore);
    const awayScore = parseInt(predictionModal.awayScore);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0 || homeScore > 10 || awayScore > 10) {
      alert('Please enter valid scores between 0 and 10');
      return;
    }

    setPredictionModal(prev => ({ ...prev, loading: true }));

    try {
      const predictionData: PredictionRequest = {
        match: predictionModal.match.id,
        home_score_prediction: homeScore,
        away_score_prediction: awayScore
      };

      if (predictionModal.match.user_prediction) {
        // Update existing prediction
        await apiService.updatePrediction(predictionModal.match.user_prediction.id, predictionData);
      } else {
        // Create new prediction
        await apiService.createPrediction(predictionData);
      }

      // Refresh matches to show updated prediction
      await fetchMatches();
      closePredictionModal();
    } catch (err: any) {
      console.error('Error saving prediction:', err);
      alert('Failed to save prediction. Please try again.');
    } finally {
      setPredictionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const canPredict = (match: Match) => {
    if (match.is_finished) return false;
    const matchTime = parseISO(match.match_date);
    const now = new Date();
    return isBefore(addMinutes(now, 30), matchTime);
  };

  const getMatchStatus = (match: Match) => {
    if (match.is_finished) {
      return { status: 'finished', color: 'text-green-600', label: 'Finished' };
    }
    
    const matchTime = parseISO(match.match_date);
    const now = new Date();
    
    if (isBefore(matchTime, now) && !match.is_finished) {
      return { status: 'live', color: 'text-red-600', label: 'Live' };
    }
    
    return { status: 'upcoming', color: 'text-blue-600', label: 'Upcoming' };
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading matches..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Football Matches</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              League
            </label>
            <select
              value={selectedLeague || ''}
              onChange={(e) => setSelectedLeague(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Leagues</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>
                  {league.name} ({league.country})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Matches</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No matches found for the selected filters.</p>
            </div>
          </Card>
        ) : (
          matches.map(match => {
            const matchStatus = getMatchStatus(match);
            const canMakePredict = canPredict(match);
            
            return (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {match.league_name}
                      </span>
                      <span className={`text-sm font-medium ${matchStatus.color}`}>
                        {matchStatus.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                        <p className="font-semibold text-gray-900">{match.home_team_name}</p>
                        {match.is_finished && (
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {match.home_score}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-center px-4">
                        <p className="text-gray-500">vs</p>
                        {match.is_finished && (
                          <p className="text-gray-400 text-sm mt-1">Final</p>
                        )}
                      </div>
                      
                      <div className="text-center flex-1">
                        <p className="font-semibold text-gray-900">{match.away_team_name}</p>
                        {match.is_finished && (
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {match.away_score}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(parseISO(match.match_date), 'MMM d, yyyy HH:mm')}
                      </div>
                      
                      {match.user_prediction && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Predicted: {match.user_prediction.home_score_prediction}-{match.user_prediction.away_score_prediction}
                          {match.is_finished && (
                            <span className="ml-2 text-blue-600">
                              ({match.user_prediction.points_earned} pts)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {canMakePredict ? (
                      <button
                        onClick={() => openPredictionModal(match)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Target className="h-4 w-4 mr-1" />
                        {match.user_prediction ? 'Update' : 'Predict'}
                      </button>
                    ) : match.is_finished ? (
                      <div className="flex items-center text-green-600">
                        <Trophy className="h-4 w-4 mr-1" />
                        Finished
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Too Late
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Prediction Modal */}
      {predictionModal.match && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Make Prediction
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">
                {predictionModal.match.league_name}
              </p>
              <p className="font-medium">
                {predictionModal.match.home_team_name} vs {predictionModal.match.away_team_name}
              </p>
              <p className="text-sm text-gray-500">
                {format(parseISO(predictionModal.match.match_date), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {predictionModal.match.home_team_name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={predictionModal.homeScore}
                  onChange={(e) => setPredictionModal(prev => ({
                    ...prev,
                    homeScore: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div className="text-center text-gray-500 pt-6">-</div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {predictionModal.match.away_team_name}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={predictionModal.awayScore}
                  onChange={(e) => setPredictionModal(prev => ({
                    ...prev,
                    awayScore: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closePredictionModal}
                disabled={predictionModal.loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitPrediction}
                disabled={predictionModal.loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {predictionModal.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Save Prediction'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;