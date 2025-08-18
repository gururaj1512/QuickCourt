import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', credentials.name);
    formData.append('email', credentials.email);
    formData.append('role', credentials.role);
    formData.append('password', credentials.password);
    formData.append('confirmPassword', credentials.confirmPassword);
    
    // Add avatar file if present
    if (credentials.avatar) {
      formData.append('avatar', credentials.avatar);
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateProfile: async (profileData: FormData): Promise<AuthResponse> => {
    const response = await api.put('/auth/me/update', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePassword: async (passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    const response = await api.put('/auth/password/update', passwordData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/password/forgot', { email });
    return response.data;
  },

  resetPassword: async (token: string, passwordData: {
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    const response = await api.put(`/auth/password/reset/${token}`, passwordData);
    return response.data;
  },
};
