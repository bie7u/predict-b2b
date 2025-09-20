import axios, { AxiosInstance } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  CreateUserRequest,
  League,
  Match,
  Prediction,
  PredictionRequest,
  LeaderboardEntry,
  CompanyStats,
  DashboardStats
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            await this.refreshToken();
            // Retry original request
            return this.api.request(error.config);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login/', credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await this.api.post('/auth/logout/', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post('/auth/refresh/', {
      refresh: refreshToken,
    });

    localStorage.setItem('access_token', response.data.access);
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/profile/');
    return response.data;
  }

  // User Management (for admins)
  async getUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users/');
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.api.post<User>('/users/', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.api.patch<User>(`/users/${userId}/`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/users/${userId}/`);
  }

  // Leagues
  async getLeagues(): Promise<League[]> {
    const response = await this.api.get<League[]>('/leagues/');
    return response.data;
  }

  // Matches
  async getMatches(filters?: {
    league?: number;
    status?: 'upcoming' | 'finished' | 'live';
  }): Promise<Match[]> {
    const params = new URLSearchParams();
    if (filters?.league) params.append('league', filters.league.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await this.api.get<Match[]>(`/matches/?${params.toString()}`);
    return response.data;
  }

  // Predictions
  async getPredictions(): Promise<Prediction[]> {
    const response = await this.api.get<Prediction[]>('/predictions/');
    return response.data;
  }

  async createPrediction(predictionData: PredictionRequest): Promise<Prediction> {
    const response = await this.api.post<Prediction>('/predictions/', predictionData);
    return response.data;
  }

  async updatePrediction(predictionId: number, predictionData: Partial<PredictionRequest>): Promise<Prediction> {
    const response = await this.api.patch<Prediction>(`/predictions/${predictionId}/`, predictionData);
    return response.data;
  }

  async deletePrediction(predictionId: number): Promise<void> {
    await this.api.delete(`/predictions/${predictionId}/`);
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await this.api.get<LeaderboardEntry[]>('/leaderboard/');
    return response.data;
  }

  // Statistics
  async getCompanyStats(): Promise<CompanyStats> {
    const response = await this.api.get<CompanyStats>('/stats/company/');
    return response.data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<DashboardStats>('/stats/dashboard/');
    return response.data;
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService();
export default apiService;