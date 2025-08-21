import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Court from '../models/Court';
import User from '../models/User';
import { AuthRequest } from '../types';

// Create a new booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const {
      courtId,
      date,
      startTime,
      endTime,
      players,
      additionalServices,
      userNotes,
      paymentMethod
    } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Validate court exists and is available
    const court = await Court.findById(courtId);
    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    if (!court.availability.isAvailable) {
      res.status(400).json({
        success: false,
        error: 'Court is not available for booking'
      });
      return;
    }

    // Check for booking conflicts
    const bookingDate = new Date(date);
    const conflictingBooking = await Booking.findOne({
      court: courtId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBooking) {
      res.status(400).json({
        success: false,
        error: 'Time slot is already booked'
      });
      return;
    }

    // Calculate duration and total amount
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours

    // Calculate base cost
    let baseCost = court.pricing.basePrice * duration;

    // Apply peak hour pricing if applicable
    const hour = parseInt(startTime.split(':')[0]);
    const day = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (day === 0 || day === 6) {
      // Weekend pricing
      baseCost = (court.pricing.weekendPrice || court.pricing.basePrice) * duration;
    } else if (hour >= 18 && hour <= 22) {
      // Peak hour pricing (6 PM - 10 PM)
      baseCost = (court.pricing.peakHourPrice || court.pricing.basePrice) * duration;
    }

    // Calculate additional costs
    let additionalCosts = {
      equipment: 0,
      lighting: 0,
      coaching: 0,
      cleaning: 0
    };

    if (additionalServices) {
      if (additionalServices.equipment && court.equipment.rentalCost) {
        additionalCosts.equipment = court.equipment.rentalCost * duration;
      }
      if (additionalServices.lighting && court.lighting.additionalCost) {
        additionalCosts.lighting = court.lighting.additionalCost * duration;
      }
      if (additionalServices.coaching) {
        additionalCosts.coaching = 500 * duration; // Default coaching rate
      }
      if (additionalServices.cleaning) {
        additionalCosts.cleaning = 200; // Fixed cleaning cost
      }
    }

    const totalAdditionalCosts = Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
    const totalAmount = baseCost + totalAdditionalCosts;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      court: courtId,
      owner: court.owner,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      paymentMethod,
      additionalServices: additionalServices || {
        equipment: false,
        lighting: false,
        coaching: false,
        cleaning: false
      },
      additionalCosts,
      players: {
        count: players.count,
        names: players.names || []
      },
      userNotes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Populate references for response
    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'court', select: 'name sportType location' },
      { path: 'owner', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while creating booking'
    });
  }
};

// Get all bookings for a user
export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { status, date, page = 1, limit = 10 } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const filter: any = { user: userId };

    if (status) filter.status = status;
    if (date) {
      const filterDate = new Date(date as string);
      filter.date = {
        $gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        $lt: new Date(filterDate.setHours(23, 59, 59, 999))
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('court', 'name sportType location images')
      .populate('owner', 'name email')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBookings: total,
        hasNextPage: skip + bookings.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching bookings'
    });
  }
};

// Get all bookings for a court owner
export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?._id;
    const { status, date, courtId, page = 1, limit = 10 } = req.query;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const filter: any = { owner: ownerId };

    if (status) filter.status = status;
    if (courtId) filter.court = courtId;
    if (date) {
      const filterDate = new Date(date as string);
      filter.date = {
        $gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        $lt: new Date(filterDate.setHours(23, 59, 59, 999))
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('court', 'name sportType location')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBookings: total,
        hasNextPage: skip + bookings.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching bookings'
    });
  }
};

// Get single booking by ID
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('court', 'name sportType location pricing amenities')
      .populate('owner', 'name email phone');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check if user has access to this booking
    if (booking.user.toString() !== userId.toString() && 
        booking.owner.toString() !== userId.toString() &&
        req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to view this booking'
      });
      return;
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching booking'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id;
    const { status, cancellationReason } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check authorization
    const isOwner = booking.owner.toString() === userId.toString();
    const isUser = booking.user.toString() === userId.toString();
    const isAdmin = req.user?.role === 'Admin';

    if (!isOwner && !isUser && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to update this booking'
      });
      return;
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no-show'],
      completed: [],
      cancelled: [],
      'no-show': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status transition from ${booking.status} to ${status}`
      });
      return;
    }

    // Update booking
    booking.status = status;
    
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
      booking.cancelledBy = isUser ? 'user' : isOwner ? 'owner' : 'admin';
      booking.cancellationDate = new Date();
      
      // Update payment status if cancelled
      if (booking.paymentStatus === 'paid') {
        booking.paymentStatus = 'refunded';
      }
    }

    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'court', select: 'name sportType location' },
      { path: 'owner', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking status updated successfully'
    });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating booking'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const { paymentStatus, transactionId, paymentMethod } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check authorization (only user, owner, or admin can update payment)
    const isOwner = booking.owner.toString() === userId.toString();
    const isUser = booking.user.toString() === userId.toString();
    const isAdmin = req.user?.role === 'Admin';

    if (!isOwner && !isUser && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to update this booking'
      });
      return;
    }

    // Update payment information
    booking.paymentStatus = paymentStatus;
    if (transactionId) booking.transactionId = transactionId;
    if (paymentMethod) booking.paymentMethod = paymentMethod;
    
    if (paymentStatus === 'paid') {
      booking.paymentDate = new Date();
      // Auto-confirm booking when payment is made
      if (booking.status === 'pending') {
        booking.status = 'confirmed';
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Payment status updated successfully'
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating payment'
    });
  }
};

// Add review and rating
export const addBookingReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id;
    const { rating, review } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Only the user who made the booking can add a review
    if (booking.user.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        error: 'You can only review your own bookings'
      });
      return;
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: 'You can only review completed bookings'
      });
      return;
    }

    // Check if already reviewed
    if (booking.rating) {
      res.status(400).json({
        success: false,
        error: 'You have already reviewed this booking'
      });
      return;
    }

    // Add review
    booking.rating = rating;
    booking.review = review;
    booking.reviewDate = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Review added successfully'
    });
  } catch (error: any) {
    console.error('Add booking review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while adding review'
    });
  }
};

// Get booking analytics for dashboard
export const getBookingAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { period = '30', type = 'user' } = req.query; // period in days, type: 'user' or 'owner'

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const filter: any = {};
    
    if (type === 'user') {
      filter.user = userId;
    } else if (type === 'owner') {
      filter.owner = userId;
    }

    // Get bookings in the specified period
    const bookings = await Booking.find({
      ...filter,
      createdAt: { $gte: daysAgo }
    }).populate('court', 'name sportType');

    // Calculate analytics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

    // Payment analytics
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid').length;
    const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length;
    const failedPayments = bookings.filter(b => b.paymentStatus === 'failed').length;

    // Average booking value
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Sport type distribution
    const sportTypeStats = bookings.reduce((acc, booking) => {
      const sportType = (booking.court as any).sportType;
      acc[sportType] = (acc[sportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily booking trends
    const dailyStats = bookings.reduce((acc, booking) => {
      const date = booking.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Peak hours analysis
    const hourStats = bookings.reduce((acc, booking) => {
      const hour = parseInt(booking.startTime.split(':')[0]);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(booking => ({
        id: booking._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        totalAmount: booking.totalAmount,
        courtName: (booking.court as any).name,
        sportType: (booking.court as any).sportType
      }));

    res.status(200).json({
      success: true,
      analytics: {
        totalBookings,
        totalRevenue,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        confirmedBookings,
        paidBookings,
        pendingPayments,
        failedPayments,
        sportTypeStats,
        dailyStats,
        hourStats,
        recentBookings,
        period: Number(period)
      },
    });
  } catch (error: any) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching analytics'
    });
  }
};

// Get court availability for a specific date
export const getCourtAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      res.status(400).json({
        success: false,
        error: 'Court ID and date are required'
      });
      return;
    }

    const court = await Court.findById(courtId);
    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    const bookingDate = new Date(date as string);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[bookingDate.getDay()];
    const daySchedule = court.operatingHours[dayName as keyof typeof court.operatingHours];

    if (daySchedule.closed) {
      res.status(200).json({
        success: true,
        available: false,
        message: 'Court is closed on this day'
      });
      return;
    }

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      court: courtId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');

    // Generate time slots
    const timeSlots = [];
    const startHour = parseInt(daySchedule.open.split(':')[0]);
    const endHour = parseInt(daySchedule.close.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if slot conflicts with existing bookings
      const isConflict = existingBookings.some(booking => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      timeSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !isConflict
      });
    }

    res.status(200).json({
      success: true,
      court: {
        id: court._id,
        name: court.name,
        sportType: court.sportType
      },
      date: bookingDate,
      operatingHours: {
        open: daySchedule.open,
        close: daySchedule.close
      },
      timeSlots,
      existingBookings: existingBookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      }))
    });
  } catch (error: any) {
    console.error('Get court availability error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching availability'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id;
    const { cancellationReason } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Check authorization
    const isOwner = booking.owner.toString() === userId.toString();
    const isUser = booking.user.toString() === userId.toString();
    const isAdmin = req.user?.role === 'Admin';

    if (!isOwner && !isUser && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to cancel this booking'
      });
      return;
    }

    // Check if booking can be cancelled
    if (['cancelled', 'completed', 'no-show'].includes(booking.status)) {
      res.status(400).json({
        success: false,
        error: 'Booking cannot be cancelled'
      });
      return;
    }

    // Check cancellation policy (e.g., cannot cancel within 2 hours)
    const now = new Date();
    const bookingDateTime = new Date(booking.date);
    bookingDateTime.setHours(parseInt(booking.startTime.split(':')[0]), parseInt(booking.startTime.split(':')[1]));
    
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < 2) {
      res.status(400).json({
        success: false,
        error: 'Bookings cannot be cancelled within 2 hours of start time'
      });
      return;
    }

    // Cancel booking
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = isUser ? 'user' : isOwner ? 'owner' : 'admin';
    booking.cancellationDate = new Date();

    // Update payment status if paid
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while cancelling booking'
    });
  }
};

// Admin: Get all bookings
export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus, date, page = 1, limit = 10 } = req.query;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const filter: any = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (date) {
      const filterDate = new Date(date as string);
      filter.date = {
        $gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        $lt: new Date(filterDate.setHours(23, 59, 59, 999))
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('court', 'name sportType location')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBookings: total,
        hasNextPage: skip + bookings.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching bookings'
    });
  }
};
