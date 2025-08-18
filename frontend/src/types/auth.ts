export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'User' | 'Owner' | 'Admin';
  avatar?: {
    public_id: string;
    url: string;
  };
  phone?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  role: 'User' | 'Owner';
  password: string;
  confirmPassword: string;
  avatar?: File;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
