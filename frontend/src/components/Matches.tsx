import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { predictionAPI } from '../services/api';
import { Match, League } from '../types';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('upcoming');
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await predictionAPI.getLeagues();
        setLeagues(response.data.results);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const params: any = { status: statusFilter };
        if (selectedLeague !== '') {
          params.league = selectedLeague;
        }
        
        const response = await predictionAPI.getMatches(params);
        setMatches(response.data.results);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedLeague, statusFilter]);

  const handlePrediction = async (matchId: number, homeScore: number, awayScore: number) => {
    setPredictionLoading(matchId);
    try {
      const match = matches.find(m => m.id === matchId);
      
      if (match?.user_prediction) {
        // Update existing prediction
        await predictionAPI.updatePrediction(match.user_prediction.id, {
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        });
      } else {
        // Create new prediction
        await predictionAPI.createPrediction({
          match: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        });
      }

      // Refresh matches to show updated prediction
      const params: any = { status: statusFilter };
      if (selectedLeague !== '') {
        params.league = selectedLeague;
      }
      const response = await predictionAPI.getMatches(params);
      setMatches(response.data.results);
    } catch (error) {
      console.error('Error making prediction:', error);
      alert('Error making prediction. Please try again.');
    } finally {
      setPredictionLoading(null);
    }
  };

  const PredictionForm: React.FC<{ match: Match }> = ({ match }) => {
    const [homeScore, setHomeScore] = useState(match.user_prediction?.predicted_home_score || 0);
    const [awayScore, setAwayScore] = useState(match.user_prediction?.predicted_away_score || 0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handlePrediction(match.id, homeScore, awayScore);
    };

    if (match.is_finished || new Date(match.match_date) < new Date()) {
      return (
        <div className="text-center">
          {match.user_prediction ? (
            <div className="text-sm text-gray-600">
              Your prediction: {match.user_prediction.predicted_home_score}-{match.user_prediction.predicted_away_score}
              {match.is_finished && (
                <span className="ml-2 text-green-600">({match.user_prediction.points_earned} pts)</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No prediction made</div>
          )}
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="flex items-center justify-center space-x-2">
        <input
          type="number"
          min="0"
          max="20"
          value={homeScore}
          onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
          className="w-12 text-center border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          min="0"
          max="20"
          value={awayScore}
          onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
          className="w-12 text-center border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={predictionLoading === match.id}
          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {predictionLoading === match.id ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            match.user_prediction ? 'Update' : 'Predict'
          )}
        </button>
      </form>
    );
  };

  return (
    <>
      <Navbar>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Football Matches</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>
      </Navbar>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="grid gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-1">
                      <div className="text-sm text-gray-600 mb-1">{match.league_name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.match_date).toLocaleDateString()} <br />
                        {new Date(match.match_date).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="md:col-span-1 text-right">
                      <div className="font-medium text-gray-900">{match.home_team}</div>
                    </div>
                    
                    <div className="md:col-span-1 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {match.is_finished ? (
                          `${match.home_score} - ${match.away_score}`
                        ) : (
                          'vs'
                        )}
                      </div>
                      {match.is_finished && (
                        <div className="text-xs text-green-600 mt-1">Final</div>
                      )}
                    </div>
                    
                    <div className="md:col-span-1 text-left">
                      <div className="font-medium text-gray-900">{match.away_team}</div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <PredictionForm match={match} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">⚽</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500">Try changing the league or status filter.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Matches;