export interface AuthRequest {
  user?: User & { _id: string };
  params: any;
  query: any;
  body: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  headers: any;
  cookies: any;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface User {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Owner' | 'Admin';
  phone?: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
  isVerified?: boolean;
  verificationReason?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Court {
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
  images: {
    public_id: string;
    url: string;
  }[];
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
  owner: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  ratings: {
    average: number;
    totalReviews: number;
    reviews: {
      user: string;
      rating: number;
      comment: string;
      date: Date;
    }[];
  };
  statistics: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingDuration: number;
    peakHours: string[];
    popularDays: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  user: string | User;
  court: string | Court;
  owner: string | User;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod?: 'online' | 'cash' | 'card' | 'upi';
  transactionId?: string;
  paymentDate?: Date;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'owner' | 'admin';
  cancellationDate?: Date;
  additionalServices?: {
    equipment: boolean;
    lighting: boolean;
    coaching: boolean;
    cleaning: boolean;
  };
  additionalCosts?: {
    equipment: number;
    lighting: number;
    coaching: number;
    cleaning: number;
  };
  players: {
    count: number;
    names?: string[];
  };
  userNotes?: string;
  ownerNotes?: string;
  rating?: number;
  review?: string;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}