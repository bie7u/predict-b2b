export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  company: number;
  company_name: string;
  is_company_admin: boolean;
  date_joined: string;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  created_at: string;
  is_active: boolean;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo_url?: string;
  is_active: boolean;
  teams_count: number;
}

export interface Team {
  id: number;
  name: string;
  league: number;
  league_name: string;
  logo_url?: string;
}

export interface Match {
  id: number;
  home_team: number;
  home_team_name: string;
  away_team: number;
  away_team_name: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  is_finished: boolean;
  league_name: string;
  league_id: number;
  user_prediction?: Prediction;
}

export interface Prediction {
  id: number;
  match: number;
  home_score_prediction: number;
  away_score_prediction: number;
  points_earned: number;
  created_at: string;
  updated_at: string;
  match_details?: Match;
}

export interface LeaderboardEntry {
  user: number;
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  total_predictions: number;
  correct_results: number;
  exact_scores: number;
  updated_at: string;
}

export interface CompanyStats {
  company_name: string;
  company_logo?: string;
  users_count: number;
  total_predictions: number;
  finished_matches: number;
  average_points: number;
}

export interface DashboardStats {
  total_predictions: number;
  finished_predictions: number;
  total_points: number;
  upcoming_matches: number;
  user_rank?: number;
  company_users_count: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company?: number;
}

export interface PredictionRequest {
  match: number;
  home_score_prediction: number;
  away_score_prediction: number;
}