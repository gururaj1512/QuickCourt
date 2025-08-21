import mongoose, { Document, Schema } from 'mongoose';

export interface Booking extends Document {
  user: mongoose.Types.ObjectId;
  court: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  
  // Booking details
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalAmount: number;
  
  // Payment information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod?: 'online' | 'cash' | 'card' | 'upi';
  transactionId?: string;
  paymentDate?: Date;
  
  // Booking status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  cancellationReason?: string;
  cancelledBy?: 'user' | 'owner' | 'admin';
  cancellationDate?: Date;
  
  // Additional services
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
  
  // Player information
  players: {
    count: number;
    names?: string[];
  };
  
  // Notes and feedback
  userNotes?: string;
  ownerNotes?: string;
  rating?: number;
  review?: string;
  reviewDate?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<Booking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  court: {
    type: Schema.Types.ObjectId,
    ref: 'Court',
    required: [true, 'Court is required'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Court owner is required'],
  },
  
  // Booking details
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0.5, 'Duration must be at least 0.5 hours'],
    max: [24, 'Duration cannot exceed 24 hours'],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'card', 'upi'],
  },
  transactionId: String,
  paymentDate: Date,
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['user', 'owner', 'admin'],
  },
  cancellationDate: Date,
  
  // Additional services
  additionalServices: {
    equipment: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    coaching: { type: Boolean, default: false },
    cleaning: { type: Boolean, default: false },
  },
  additionalCosts: {
    equipment: { type: Number, default: 0 },
    lighting: { type: Number, default: 0 },
    coaching: { type: Number, default: 0 },
    cleaning: { type: Number, default: 0 },
  },
  
  // Player information
  players: {
    count: {
      type: Number,
      required: [true, 'Player count is required'],
      min: [1, 'At least 1 player required'],
    },
    names: [String],
  },
  
  // Notes and feedback
  userNotes: String,
  ownerNotes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  reviewDate: Date,
  
}, {
  timestamps: true,
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ court: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ court: 1, date: 1 });
bookingSchema.index({ owner: 1, date: 1 });

// Virtual for full booking time
bookingSchema.virtual('bookingTime').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for total additional costs
bookingSchema.virtual('totalAdditionalCosts').get(function() {
  if (!this.additionalCosts) return 0;
  return Object.values(this.additionalCosts).reduce((sum, cost) => sum + cost, 0);
});

// Virtual for base court cost
bookingSchema.virtual('baseCourtCost').get(function() {
  if (!this.additionalCosts) return this.totalAmount;
  const totalAdditionalCosts = Object.values(this.additionalCosts).reduce((sum, cost) => sum + cost, 0);
  return this.totalAmount - totalAdditionalCosts;
});

// Method to check if booking is active (not cancelled or completed)
bookingSchema.methods.isActive = function() {
  return !['cancelled', 'completed', 'no-show'].includes(this.status);
};

// Method to check if booking is in the past
bookingSchema.methods.isPast = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  bookingDateTime.setHours(parseInt(this.endTime.split(':')[0]), parseInt(this.endTime.split(':')[1]));
  return bookingDateTime < now;
};

// Method to check if booking is today
bookingSchema.methods.isToday = function() {
  const today = new Date();
  const bookingDate = new Date(this.date);
  return today.toDateString() === bookingDate.toDateString();
};

// Method to check if booking is upcoming
bookingSchema.methods.isUpcoming = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  bookingDateTime.setHours(parseInt(this.startTime.split(':')[0]), parseInt(this.startTime.split(':')[1]));
  return bookingDateTime > now;
};

// Pre-save middleware to validate booking times
bookingSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01 ${this.startTime}`);
    const end = new Date(`2000-01-01 ${this.endTime}`);
    
    if (end <= start) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

export default mongoose.model<Booking>('Booking', bookingSchema);
