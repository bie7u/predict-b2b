export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  company: number;
  company_name: string;
  is_company_admin: boolean;
  is_superuser?: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  is_active: boolean;
}

export interface Match {
  id: number;
  league: number;
  league_name: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  is_finished: boolean;
  user_prediction?: UserPrediction;
}

export interface UserPrediction {
  id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
}

export interface Prediction {
  id: number;
  match: number;
  match_details?: Match;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyRanking {
  id: number;
  user: number;
  user_name: string;
  user_full_name: string;
  total_points: number;
  total_predictions: number;
  rank: number;
  updated_at: string;
}

export interface UserStats {
  total_predictions: number;
  total_points: number;
  exact_predictions: number;
  result_and_difference_predictions: number;
  result_only_predictions: number;
  wrong_predictions: number;
  average_points: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}