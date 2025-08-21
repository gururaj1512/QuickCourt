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

export interface CourtData {
  name: string;
  sportType: string;
  surfaceType: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    basePrice: number;
    peakHourPrice?: number;
    weekendPrice?: number;
    currency: string;
    hourlyRate: boolean;
  };
  amenities: string[];
  capacity: {
    minPlayers: number;
    maxPlayers: number;
  };
  dimensions: {
    length: number;
    width: number;
    unit: string;
  };
  lighting: {
    available: boolean;
    type?: string;
    additionalCost?: number;
  };
  equipment: {
    provided: boolean;
    items?: string[];
    rentalCost?: number;
  };
  availability: {
    isAvailable: boolean;
    maintenanceMode: boolean;
    maintenanceReason?: string;
    maintenanceEndDate?: Date;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  rules: string[];
}

export interface CourtResponse {
  success: boolean;
  court?: CourtData;
  courts?: CourtData[];
  statistics?: {
    totalCourts: number;
    activeCourts: number;
    pendingApproval: number;
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    recentCourts: number;
    sportTypeStats: Record<string, number>;
    statusStats: Record<string, number>;
    topCourts: Array<{
      id: string;
      name: string;
      revenue: number;
      bookings: number;
      rating: number;
    }>;
  };
  analytics?: {
    totalCourts: number;
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    revenueBySport: Record<string, number>;
    bookingsBySport: Record<string, number>;
    courtPerformance: Array<{
      id: string;
      name: string;
      sportType: string;
      revenue: number;
      bookings: number;
      rating: number;
      status: string;
      approvalStatus: string;
    }>;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCourts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
  error?: string;
}

export const courtAPI = {
  // Create a new court
  createCourt: async (courtData: CourtData, images: File[]): Promise<CourtResponse> => {
    const formData = new FormData();

    // Append court data in flattened format
    // Basic fields
    formData.append('name', courtData.name);
    formData.append('sportType', courtData.sportType);
    formData.append('surfaceType', courtData.surfaceType);
    formData.append('description', courtData.description);
    
    // Location fields
    formData.append('address', courtData.location.address);
    formData.append('city', courtData.location.city);
    formData.append('state', courtData.location.state);
    formData.append('zipCode', courtData.location.zipCode);
    formData.append('country', courtData.location.country);
    formData.append('latitude', courtData.location.coordinates.lat.toString());
    formData.append('longitude', courtData.location.coordinates.lng.toString());
    
    // Pricing fields
    formData.append('basePrice', courtData.pricing.basePrice.toString());
    if (courtData.pricing.peakHourPrice) {
      formData.append('peakHourPrice', courtData.pricing.peakHourPrice.toString());
    }
    if (courtData.pricing.weekendPrice) {
      formData.append('weekendPrice', courtData.pricing.weekendPrice.toString());
    }
    formData.append('currency', courtData.pricing.currency);
    formData.append('hourlyRate', courtData.pricing.hourlyRate.toString());
    
    // Amenities (array)
    courtData.amenities.forEach(amenity => {
      formData.append('amenities', amenity);
    });
    
    // Capacity fields
    formData.append('minPlayers', courtData.capacity.minPlayers.toString());
    formData.append('maxPlayers', courtData.capacity.maxPlayers.toString());
    
    // Dimensions fields
    formData.append('length', courtData.dimensions.length.toString());
    formData.append('width', courtData.dimensions.width.toString());
    formData.append('unit', courtData.dimensions.unit);
    
    // Lighting fields
    formData.append('lightingAvailable', courtData.lighting.available.toString());
    if (courtData.lighting.type) {
      formData.append('lightingType', courtData.lighting.type);
    }
    if (courtData.lighting.additionalCost) {
      formData.append('lightingAdditionalCost', courtData.lighting.additionalCost.toString());
    }
    
    // Equipment fields
    formData.append('equipmentProvided', courtData.equipment.provided.toString());
    if (courtData.equipment.items && courtData.equipment.items.length > 0) {
      formData.append('equipmentItems', JSON.stringify(courtData.equipment.items));
    }
    if (courtData.equipment.rentalCost) {
      formData.append('equipmentRentalCost', courtData.equipment.rentalCost.toString());
    }
    
    // Availability fields
    formData.append('isAvailable', courtData.availability.isAvailable.toString());
    formData.append('maintenanceMode', courtData.availability.maintenanceMode.toString());
    if (courtData.availability.maintenanceReason) {
      formData.append('maintenanceReason', courtData.availability.maintenanceReason);
    }
    if (courtData.availability.maintenanceEndDate) {
      formData.append('maintenanceEndDate', courtData.availability.maintenanceEndDate.toISOString());
    }
    
    // Operating hours
    formData.append('operatingHours', JSON.stringify(courtData.operatingHours));
    
    // Rules (array)
    courtData.rules.forEach(rule => {
      formData.append('rules', rule);
    });

    // Append images
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/courts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all courts (public)
  getAllCourts: async (params?: {
    sportType?: string;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    rating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<CourtResponse> => {
    const response = await api.get('/courts', { params });
    return response.data;
  },

  // Get court by ID
  getCourtById: async (courtId: string): Promise<CourtResponse> => {
    const response = await api.get(`/courts/${courtId}`);
    return response.data;
  },

  // Get courts by owner
  getCourtsByOwner: async (params?: {
    status?: string;
    approvalStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<CourtResponse> => {
    const response = await api.get('/courts/owner/courts', { params });
    return response.data;
  },

  // Get courts for admin approval
  getCourtsForApproval: async (): Promise<CourtResponse> => {
    const response = await api.get('/courts/admin/approval');
    return response.data;
  },

  // Approve or reject court (admin only)
  approveRejectCourt: async (courtId: string, data: {
    approvalStatus: 'approved' | 'rejected';
    status: 'active' | 'inactive';
    rejectionReason?: string;
  }): Promise<CourtResponse> => {
    const response = await api.put(`/courts/admin/${courtId}/approve`, data);
    return response.data;
  },

  // Update court
  updateCourt: async (courtId: string, courtData: Partial<CourtData>, images?: File[]): Promise<CourtResponse> => {
    const formData = new FormData();

    // Append court data in flattened format (only for fields that are provided)
    if (courtData.name) formData.append('name', courtData.name);
    if (courtData.sportType) formData.append('sportType', courtData.sportType);
    if (courtData.surfaceType) formData.append('surfaceType', courtData.surfaceType);
    if (courtData.description) formData.append('description', courtData.description);
    
    // Location fields
    if (courtData.location) {
      if (courtData.location.address) formData.append('address', courtData.location.address);
      if (courtData.location.city) formData.append('city', courtData.location.city);
      if (courtData.location.state) formData.append('state', courtData.location.state);
      if (courtData.location.zipCode) formData.append('zipCode', courtData.location.zipCode);
      if (courtData.location.country) formData.append('country', courtData.location.country);
      if (courtData.location.coordinates) {
        formData.append('latitude', courtData.location.coordinates.lat.toString());
        formData.append('longitude', courtData.location.coordinates.lng.toString());
      }
    }
    
    // Pricing fields
    if (courtData.pricing) {
      if (courtData.pricing.basePrice) formData.append('basePrice', courtData.pricing.basePrice.toString());
      if (courtData.pricing.peakHourPrice) formData.append('peakHourPrice', courtData.pricing.peakHourPrice.toString());
      if (courtData.pricing.weekendPrice) formData.append('weekendPrice', courtData.pricing.weekendPrice.toString());
      if (courtData.pricing.currency) formData.append('currency', courtData.pricing.currency);
      if (courtData.pricing.hourlyRate !== undefined) formData.append('hourlyRate', courtData.pricing.hourlyRate.toString());
    }
    
    // Amenities (array)
    if (courtData.amenities) {
      courtData.amenities.forEach(amenity => {
        formData.append('amenities', amenity);
      });
    }
    
    // Capacity fields
    if (courtData.capacity) {
      if (courtData.capacity.minPlayers) formData.append('minPlayers', courtData.capacity.minPlayers.toString());
      if (courtData.capacity.maxPlayers) formData.append('maxPlayers', courtData.capacity.maxPlayers.toString());
    }
    
    // Dimensions fields
    if (courtData.dimensions) {
      if (courtData.dimensions.length) formData.append('length', courtData.dimensions.length.toString());
      if (courtData.dimensions.width) formData.append('width', courtData.dimensions.width.toString());
      if (courtData.dimensions.unit) formData.append('unit', courtData.dimensions.unit);
    }
    
    // Lighting fields
    if (courtData.lighting) {
      if (courtData.lighting.available !== undefined) formData.append('lightingAvailable', courtData.lighting.available.toString());
      if (courtData.lighting.type) formData.append('lightingType', courtData.lighting.type);
      if (courtData.lighting.additionalCost) formData.append('lightingAdditionalCost', courtData.lighting.additionalCost.toString());
    }
    
    // Equipment fields
    if (courtData.equipment) {
      if (courtData.equipment.provided !== undefined) formData.append('equipmentProvided', courtData.equipment.provided.toString());
      if (courtData.equipment.items && courtData.equipment.items.length > 0) {
        formData.append('equipmentItems', JSON.stringify(courtData.equipment.items));
      }
      if (courtData.equipment.rentalCost) formData.append('equipmentRentalCost', courtData.equipment.rentalCost.toString());
    }
    
    // Availability fields
    if (courtData.availability) {
      if (courtData.availability.isAvailable !== undefined) formData.append('isAvailable', courtData.availability.isAvailable.toString());
      if (courtData.availability.maintenanceMode !== undefined) formData.append('maintenanceMode', courtData.availability.maintenanceMode.toString());
      if (courtData.availability.maintenanceReason) formData.append('maintenanceReason', courtData.availability.maintenanceReason);
      if (courtData.availability.maintenanceEndDate) formData.append('maintenanceEndDate', courtData.availability.maintenanceEndDate.toISOString());
    }
    
    // Operating hours
    if (courtData.operatingHours) {
      formData.append('operatingHours', JSON.stringify(courtData.operatingHours));
    }
    
    // Rules (array)
    if (courtData.rules) {
      courtData.rules.forEach(rule => {
        formData.append('rules', rule);
      });
    }

    // Append images if provided
    if (images) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.put(`/courts/${courtId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete court
  deleteCourt: async (courtId: string): Promise<CourtResponse> => {
    const response = await api.delete(`/courts/${courtId}`);
    return response.data;
  },

  // Toggle court availability
  toggleCourtAvailability: async (courtId: string, availabilityData: {
    isAvailable: boolean;
    maintenanceMode?: boolean;
    maintenanceReason?: string;
    maintenanceEndDate?: Date;
  }): Promise<CourtResponse> => {
    const response = await api.put(`/courts/${courtId}/availability`, availabilityData);
    return response.data;
  },

  // Add court review
  addCourtReview: async (courtId: string, reviewData: {
    rating: number;
    comment?: string;
  }): Promise<CourtResponse> => {
    const response = await api.post(`/courts/${courtId}/review`, reviewData);
    return response.data;
  },

};
