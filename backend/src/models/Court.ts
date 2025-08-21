import mongoose, { Document, Schema } from 'mongoose';

export interface Court extends Document {
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
  owner: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  ratings: {
    average: number;
    totalReviews: number;
    reviews: {
      user: mongoose.Types.ObjectId;
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

const courtSchema = new Schema<Court>({
  name: {
    type: String,
    required: [true, 'Court name is required'],
    trim: true,
    maxLength: [100, 'Court name cannot exceed 100 characters'],
  },
  sportType: {
    type: String,
    required: [true, 'Sport type is required'],
    enum: ['Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Squash', 'Table Tennis', 'Other'],
  },
  surfaceType: {
    type: String,
    required: [true, 'Surface type is required'],
    enum: ['Hard Court', 'Clay Court', 'Grass Court', 'Synthetic', 'Wooden', 'Concrete', 'Asphalt', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Court description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India',
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    peakHourPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    weekendPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    hourlyRate: {
      type: Boolean,
      default: true,
    },
  },
  amenities: [{
    type: String,
    enum: [
      'Parking', 'Shower', 'Changing Room', 'Water Dispenser', 'First Aid Kit',
      'Equipment Rental', 'Coach Available', 'Spectator Seating', 'Restroom',
      'WiFi', 'Air Conditioning', 'Heating', 'Vending Machine', 'Cafeteria',
      'Pro Shop', 'Lockers', 'Security', 'Lighting', 'Covered Court'
    ],
  }],
  images: [{
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  }],
  capacity: {
    minPlayers: {
      type: Number,
      required: [true, 'Minimum players is required'],
      min: [1, 'Minimum players must be at least 1'],
    },
    maxPlayers: {
      type: Number,
      required: [true, 'Maximum players is required'],
      min: [1, 'Maximum players must be at least 1'],
    },
  },
  dimensions: {
    length: {
      type: Number,
      required: [true, 'Court length is required'],
      min: [1, 'Length must be positive'],
    },
    width: {
      type: Number,
      required: [true, 'Court width is required'],
      min: [1, 'Width must be positive'],
    },
    unit: {
      type: String,
      default: 'meters',
      enum: ['meters', 'feet', 'yards'],
    },
  },
  lighting: {
    available: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['LED', 'Halogen', 'Fluorescent', 'Natural', 'Other'],
    },
    additionalCost: {
      type: Number,
      min: [0, 'Additional cost cannot be negative'],
    },
  },
  equipment: {
    provided: {
      type: Boolean,
      default: false,
    },
    items: [String],
    rentalCost: {
      type: Number,
      min: [0, 'Rental cost cannot be negative'],
    },
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceReason: String,
    maintenanceEndDate: Date,
  },
  operatingHours: {
    monday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    tuesday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    wednesday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    thursday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    friday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    saturday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false },
    },
  },
  rules: [String],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Court owner is required'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvalDate: Date,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: String,
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxLength: 500,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  statistics: {
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    averageBookingDuration: {
      type: Number,
      default: 0,
    },
    peakHours: [String],
    popularDays: [String],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
courtSchema.index({ owner: 1 });
courtSchema.index({ 'location.coordinates': '2dsphere' });
courtSchema.index({ sportType: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({ approvalStatus: 1 });
courtSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual for full address
courtSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}, ${this.location.country}`;
});

// Method to calculate current price based on time
courtSchema.methods.getCurrentPrice = function() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend pricing
  if (day === 0 || day === 6) {
    return this.pricing.weekendPrice || this.pricing.basePrice;
  }
  
  // Peak hour pricing (6 PM - 10 PM)
  if (hour >= 18 && hour <= 22) {
    return this.pricing.peakHourPrice || this.pricing.basePrice;
  }
  
  return this.pricing.basePrice;
};

// Method to check if court is open
courtSchema.methods.isOpen = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[currentDay];
  
  if (daySchedule.closed) return false;
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

  // Method to update average rating
  courtSchema.methods.updateAverageRating = function() {
    if (this.ratings.reviews.length === 0) {
      this.ratings.average = 0;
      this.ratings.totalReviews = 0;
    } else {
      const totalRating = this.ratings.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      this.ratings.average = totalRating / this.ratings.reviews.length;
      this.ratings.totalReviews = this.ratings.reviews.length;
    }
  };

export default mongoose.model<Court>('Court', courtSchema);
