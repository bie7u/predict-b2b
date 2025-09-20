import axios, { AxiosResponse } from 'axios';
import { AuthTokens, User, Company, League, Match, Prediction, CompanyRanking, UserStats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('accessToken', access);

          return api(original);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string): Promise<AxiosResponse<AuthTokens>> =>
    api.post('/auth/login/', { username, password }),

  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    company: number;
    password: string;
    password_confirm: string;
  }): Promise<AxiosResponse<User>> =>
    api.post('/users/register/', userData),

  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/users/profile/'),

  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> =>
    api.patch('/users/profile/', userData),
};

export const companyAPI = {
  getCompanies: (): Promise<AxiosResponse<{ results: Company[] }>> =>
    api.get('/companies/'),

  getCompany: (id: number): Promise<AxiosResponse<Company>> =>
    api.get(`/companies/${id}/`),

  updateCompany: (id: number, data: Partial<Company>): Promise<AxiosResponse<Company>> =>
    api.patch(`/companies/${id}/`, data),

  getUsers: (): Promise<AxiosResponse<{ results: User[] }>> =>
    api.get('/users/'),
};

export const predictionAPI = {
  getLeagues: (): Promise<AxiosResponse<{ results: League[] }>> =>
    api.get('/leagues/'),

  getMatches: (params?: { league?: number; status?: string }): Promise<AxiosResponse<{ results: Match[] }>> =>
    api.get('/matches/', { params }),

  getPredictions: (): Promise<AxiosResponse<{ results: Prediction[] }>> =>
    api.get('/predictions/'),

  createPrediction: (data: {
    match: number;
    predicted_home_score: number;
    predicted_away_score: number;
  }): Promise<AxiosResponse<Prediction>> =>
    api.post('/predictions/', data),

  updatePrediction: (id: number, data: {
    predicted_home_score: number;
    predicted_away_score: number;
  }): Promise<AxiosResponse<Prediction>> =>
    api.patch(`/predictions/${id}/`, data),

  getRankings: (): Promise<AxiosResponse<{ results: CompanyRanking[] }>> =>
    api.get('/rankings/'),

  updateRankings: (): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/rankings/update/'),

  getUserStats: (): Promise<AxiosResponse<UserStats>> =>
    api.get('/stats/'),
};

export default api;