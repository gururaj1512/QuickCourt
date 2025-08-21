import axios from 'axios';

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

export interface BookingData {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  players: {
    count: number;
    names?: string[];
  };
  additionalServices?: {
    equipment: boolean;
    lighting: boolean;
    coaching: boolean;
    cleaning: boolean;
  };
  userNotes?: string;
  paymentMethod?: 'online' | 'cash' | 'card' | 'upi';
}

export interface BookingResponse {
  success: boolean;
  booking?: any;
  bookings?: any[];
  analytics?: any;
  availability?: any;
  message?: string;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  paidBookings: number;
  pendingPayments: number;
  failedPayments: number;
  sportTypeStats: Record<string, number>;
  dailyStats: Record<string, number>;
  hourStats: Record<string, number>;
  recentBookings: any[];
  period: number;
}

export interface CourtAvailability {
  court: {
    id: string;
    name: string;
    sportType: string;
  };
  date: string;
  operatingHours: {
    open: string;
    close: string;
  };
  timeSlots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  existingBookings: {
    startTime: string;
    endTime: string;
  }[];
}

export const bookingAPI = {
  // Create a new booking
  createBooking: async (bookingData: BookingData): Promise<BookingResponse> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async (params?: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingResponse> => {
    const response = await api.get('/bookings/user', { params });
    return response.data;
  },

  // Get owner's bookings
  getOwnerBookings: async (params?: {
    status?: string;
    date?: string;
    courtId?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingResponse> => {
    const response = await api.get('/bookings/owner', { params });
    return response.data;
  },

  // Get single booking by ID
  getBookingById: async (bookingId: string): Promise<BookingResponse> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, statusData: {
    status: string;
    cancellationReason?: string;
  }): Promise<BookingResponse> => {
    const response = await api.put(`/bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (bookingId: string, paymentData: {
    paymentStatus: string;
    transactionId?: string;
    paymentMethod?: string;
  }): Promise<BookingResponse> => {
    const response = await api.put(`/bookings/${bookingId}/payment`, paymentData);
    return response.data;
  },

  // Add booking review
  addBookingReview: async (bookingId: string, reviewData: {
    rating: number;
    review?: string;
  }): Promise<BookingResponse> => {
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, cancellationData: {
    cancellationReason?: string;
  }): Promise<BookingResponse> => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, cancellationData);
    return response.data;
  },

  // Get booking analytics for user
  getUserBookingAnalytics: async (params?: {
    period?: number;
  }): Promise<BookingResponse> => {
    const response = await api.get('/bookings/analytics/user', { params });
    return response.data;
  },

  // Get booking analytics for owner
  getOwnerBookingAnalytics: async (params?: {
    period?: number;
  }): Promise<BookingResponse> => {
    const response = await api.get('/bookings/analytics/owner', { params });
    return response.data;
  },

  // Get court availability
  getCourtAvailability: async (courtId: string, date: string): Promise<BookingResponse> => {
    const response = await api.get('/bookings/availability', { 
      params: { courtId, date } 
    });
    return response.data;
  },

  // Admin: Get all bookings
  getAllBookings: async (params?: {
    status?: string;
    paymentStatus?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingResponse> => {
    const response = await api.get('/bookings/admin/all', { params });
    return response.data;
  },

  // Helper function to calculate booking duration
  calculateDuration: (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  },

  // Helper function to format booking time
  formatBookingTime: (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  },

  // Helper function to check if booking is active
  isBookingActive: (status: string): boolean => {
    return !['cancelled', 'completed', 'no-show'].includes(status);
  },

  // Helper function to check if booking is in the past
  isBookingPast: (date: string, endTime: string): boolean => {
    const now = new Date();
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));
    return bookingDateTime < now;
  },

  // Helper function to check if booking is today
  isBookingToday: (date: string): boolean => {
    const today = new Date();
    const bookingDate = new Date(date);
    return today.toDateString() === bookingDate.toDateString();
  },

  // Helper function to check if booking is upcoming
  isBookingUpcoming: (date: string, startTime: string): boolean => {
    const now = new Date();
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
    return bookingDateTime > now;
  },

  // Helper function to get booking status color
  getStatusColor: (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      'no-show': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  },

  // Helper function to get payment status color
  getPaymentStatusColor: (paymentStatus: string): string => {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-600 bg-yellow-100',
      paid: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-blue-600 bg-blue-100',
      cancelled: 'text-gray-600 bg-gray-100'
    };
    return colors[paymentStatus] || 'text-gray-600 bg-gray-100';
  },

  // Helper function to format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Helper function to format date
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Helper function to format time
  formatTime: (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  // Helper function to get booking summary
  getBookingSummary: (booking: any): string => {
    const courtName = booking.court?.name || 'Unknown Court';
    const sportType = booking.court?.sportType || 'Unknown Sport';
    const date = bookingAPI.formatDate(booking.date);
    const time = bookingAPI.formatBookingTime(booking.startTime, booking.endTime);
    
    return `${courtName} (${sportType}) - ${date} at ${time}`;
  },

  // Helper function to validate booking data
  validateBookingData: (data: BookingData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.courtId) errors.push('Court is required');
    if (!data.date) errors.push('Date is required');
    if (!data.startTime) errors.push('Start time is required');
    if (!data.endTime) errors.push('End time is required');
    if (!data.players?.count || data.players.count < 1) errors.push('At least 1 player is required');

    if (data.startTime && data.endTime) {
      const duration = bookingAPI.calculateDuration(data.startTime, data.endTime);
      if (duration <= 0) errors.push('End time must be after start time');
      if (duration < 0.5) errors.push('Minimum booking duration is 30 minutes');
      if (duration > 24) errors.push('Maximum booking duration is 24 hours');
    }

    const bookingDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      errors.push('Cannot book for past dates');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
