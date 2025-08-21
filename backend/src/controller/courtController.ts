import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import fs from 'fs';
import Court from '../models/Court';
import { AuthRequest } from '../types';

// Create a new court
export const createCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawData = req.body;
    const ownerId = req.user?._id;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Reconstruct nested objects from flattened FormData
    const courtData = {
      name: rawData.name,
      sportType: rawData.sportType,
      surfaceType: rawData.surfaceType,
      description: rawData.description,
      location: {
        address: rawData.address,
        city: rawData.city,
        state: rawData.state,
        zipCode: rawData.zipCode,
        country: rawData.country || 'India',
        coordinates: {
          lat: parseFloat(rawData.latitude),
          lng: parseFloat(rawData.longitude),
        },
      },
      pricing: {
        basePrice: parseFloat(rawData.basePrice),
        peakHourPrice: rawData.peakHourPrice ? parseFloat(rawData.peakHourPrice) : undefined,
        weekendPrice: rawData.weekendPrice ? parseFloat(rawData.weekendPrice) : undefined,
        currency: rawData.currency || 'INR',
        hourlyRate: rawData.hourlyRate !== 'false',
      },
      amenities: Array.isArray(rawData.amenities) ? rawData.amenities : [],
      capacity: {
        minPlayers: parseInt(rawData.minPlayers),
        maxPlayers: parseInt(rawData.maxPlayers),
      },
      dimensions: {
        length: parseFloat(rawData.length),
        width: parseFloat(rawData.width),
        unit: rawData.unit || 'meters',
      },
      lighting: {
        available: rawData.lightingAvailable === 'true',
        type: rawData.lightingType,
        additionalCost: rawData.lightingAdditionalCost ? parseFloat(rawData.lightingAdditionalCost) : undefined,
      },
      equipment: {
        provided: rawData.equipmentProvided === 'true',
        items: rawData.equipmentItems ? JSON.parse(rawData.equipmentItems) : [],
        rentalCost: rawData.equipmentRentalCost ? parseFloat(rawData.equipmentRentalCost) : undefined,
      },
      availability: {
        isAvailable: rawData.isAvailable !== 'false',
        maintenanceMode: rawData.maintenanceMode === 'true',
        maintenanceReason: rawData.maintenanceReason,
        maintenanceEndDate: rawData.maintenanceEndDate ? new Date(rawData.maintenanceEndDate) : undefined,
      },
      operatingHours: rawData.operatingHours ? JSON.parse(rawData.operatingHours) : {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '06:00', close: '22:00', closed: false },
        sunday: { open: '06:00', close: '22:00', closed: false },
      },
      rules: Array.isArray(rawData.rules) ? rawData.rules : [],
    };

    // Handle image uploads if files are provided
    const images = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          try {
            const result = await cloudinary.v2.uploader.upload(file.path, {
              folder: "courts",
              width: 800,
              crop: "scale",
            });
            
            images.push({
              public_id: result.public_id,
              url: result.secure_url,
            });

            // Delete temporary file
            fs.unlinkSync(file.path);
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        } else {
          // If Cloudinary not configured, delete uploaded file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    const court = await Court.create({
      ...courtData,
      owner: ownerId,
      images: images.length > 0 ? images : [],
    });

    res.status(201).json({
      success: true,
      court,
    });
  } catch (error: any) {
    console.error('Create court error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while creating court'
    });
  }
};

// Get all courts (with filters)
export const getAllCourts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sportType,
      city,
      state,
      minPrice,
      maxPrice,
      amenities,
      rating,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = {
      status: 'active',
      approvalStatus: 'approved',
      'availability.isAvailable': true,
    };

    // Apply filters
    if (sportType) filter.sportType = sportType;
    if (city) filter['location.city'] = new RegExp(city as string, 'i');
    if (state) filter['location.state'] = new RegExp(state as string, 'i');
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = Number(maxPrice);
    }
    if (amenities) {
      const amenitiesArray = (amenities as string).split(',');
      filter.amenities = { $in: amenitiesArray };
    }
    if (rating) {
      filter['ratings.average'] = { $gte: Number(rating) };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const courts = await Court.find(filter)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Court.countDocuments(filter);

    res.status(200).json({
      success: true,
      courts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCourts: total,
        hasNextPage: skip + courts.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get all courts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching courts'
    });
  }
};

// Get single court by ID
export const getCourtById = async (req: Request, res: Response): Promise<void> => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('approvedBy', 'name');

    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      court,
    });
  } catch (error: any) {
    console.error('Get court by ID error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching court'
    });
  }
};

// Get courts by owner (for dashboard)
export const getCourtsByOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?._id;
    const { status, approvalStatus, page = 1, limit = 10 } = req.query;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const filter: any = { owner: ownerId };

    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const courts = await Court.find(filter)
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Court.countDocuments(filter);

    res.status(200).json({
      success: true,
      courts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCourts: total,
        hasNextPage: skip + courts.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get courts by owner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching owner courts'
    });
  }
};

// Update court
export const updateCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courtId = req.params.id;
    const ownerId = req.user?._id;
    const updateData = req.body;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
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

    // Check if user owns this court
    if (court.owner.toString() !== ownerId.toString()) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to update this court'
      });
      return;
    }

    // Handle new image uploads
    const newImages = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          try {
            const result = await cloudinary.v2.uploader.upload(file.path, {
              folder: "courts",
              width: 800,
              crop: "scale",
            });
            
            newImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });

            fs.unlinkSync(file.path);
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        } else {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    // Handle image deletion if specified
    if (updateData.imagesToDelete && Array.isArray(updateData.imagesToDelete)) {
      for (const imageId of updateData.imagesToDelete) {
        const imageToDelete = court.images.find(img => img.public_id === imageId);
        if (imageToDelete && process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            await cloudinary.v2.uploader.destroy(imageId);
          } catch (deleteError) {
            console.error('Image deletion error:', deleteError);
          }
        }
      }
      
      // Remove deleted images from court
      court.images = court.images.filter(img => !updateData.imagesToDelete.includes(img.public_id));
    }

    // Add new images to existing ones
    if (newImages.length > 0) {
      court.images = [...court.images, ...newImages];
    }

    // Update court data
    const { imagesToDelete, ...courtUpdateData } = updateData;
    Object.assign(court, courtUpdateData);

    await court.save();

    res.status(200).json({
      success: true,
      court,
    });
  } catch (error: any) {
    console.error('Update court error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating court'
    });
  }
};

// Delete court
export const deleteCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courtId = req.params.id;
    const ownerId = req.user?._id;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
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

    // Check if user owns this court
    if (court.owner.toString() !== ownerId.toString()) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this court'
      });
      return;
    }

    // Delete images from Cloudinary
    if (court.images.length > 0 && process.env.CLOUDINARY_CLOUD_NAME) {
      for (const image of court.images) {
        try {
          await cloudinary.v2.uploader.destroy(image.public_id);
        } catch (deleteError) {
          console.error('Image deletion error:', deleteError);
        }
      }
    }

    await court.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Court deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete court error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while deleting court'
    });
  }
};

// Toggle court availability
export const toggleCourtAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courtId = req.params.id;
    const ownerId = req.user?._id;
    const { isAvailable, maintenanceMode, maintenanceReason, maintenanceEndDate } = req.body;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
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

    if (court.owner.toString() !== ownerId.toString()) {
      res.status(403).json({
        success: false,
        error: 'You are not authorized to modify this court'
      });
      return;
    }

    court.availability.isAvailable = isAvailable;
    court.availability.maintenanceMode = maintenanceMode;
    if (maintenanceReason) court.availability.maintenanceReason = maintenanceReason;
    if (maintenanceEndDate) court.availability.maintenanceEndDate = maintenanceEndDate;

    await court.save();

    res.status(200).json({
      success: true,
      court,
    });
  } catch (error: any) {
    console.error('Toggle court availability error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating court availability'
    });
  }
};

// Add court review/rating
export const addCourtReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courtId = req.params.id;
    const userId = req.user?._id;
    const { rating, comment } = req.body;

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

    const court = await Court.findById(courtId);

    if (!court) {
      res.status(404).json({
        success: false,
        error: 'Court not found'
      });
      return;
    }

    // Check if user already reviewed this court
    const existingReview = court.ratings.reviews.find(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      res.status(400).json({
        success: false,
        error: 'You have already reviewed this court'
      });
      return;
    }

    // Add new review
    court.ratings.reviews.push({
      user: userId as any,
      rating,
      comment: comment || '',
      date: new Date(),
    });

    // Update average rating
    (court as any).updateAverageRating();

    await court.save();

    res.status(200).json({
      success: true,
      court,
    });
  } catch (error: any) {
    console.error('Add court review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while adding review'
    });
  }
};

// Get court statistics (for owner dashboard)
export const getCourtStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?._id;
    const { period = '30' } = req.query; // days

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get all courts owned by user
    const courts = await Court.find({ owner: ownerId });

    // Calculate statistics
    const totalCourts = courts.length;
    const activeCourts = courts.filter(court => court.status === 'active').length;
    const pendingApproval = courts.filter(court => court.approvalStatus === 'pending').length;
    const totalRevenue = courts.reduce((sum, court) => sum + court.statistics.totalRevenue, 0);
    const totalBookings = courts.reduce((sum, court) => sum + court.statistics.totalBookings, 0);
    const averageRating = courts.length > 0 
      ? courts.reduce((sum, court) => sum + court.ratings.average, 0) / courts.length 
      : 0;

    // Recent activity (courts created in the specified period)
    const recentCourts = courts.filter(court => court.createdAt >= daysAgo);

    // Sport type distribution
    const sportTypeStats = courts.reduce((acc, court) => {
      acc[court.sportType] = (acc[court.sportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusStats = courts.reduce((acc, court) => {
      acc[court.status] = (acc[court.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top performing courts (by revenue)
    const topCourts = courts
      .sort((a, b) => b.statistics.totalRevenue - a.statistics.totalRevenue)
      .slice(0, 5)
      .map(court => ({
        id: court._id,
        name: court.name,
        revenue: court.statistics.totalRevenue,
        bookings: court.statistics.totalBookings,
        rating: court.ratings.average,
      }));

    res.status(200).json({
      success: true,
      statistics: {
        totalCourts,
        activeCourts,
        pendingApproval,
        totalRevenue,
        totalBookings,
        averageRating: Math.round(averageRating * 100) / 100,
        recentCourts: recentCourts.length,
        sportTypeStats,
        statusStats,
        topCourts,
      },
    });
  } catch (error: any) {
    console.error('Get court statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching statistics'
    });
  }
};

// Search courts by location (nearby courts)
export const searchCourtsByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 10, sportType, maxPrice } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
      return;
    }

    const filter: any = {
      status: 'active',
      approvalStatus: 'approved',
      'availability.isAvailable': true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius) * 1000, // Convert km to meters
        },
      },
    };

    if (sportType) filter.sportType = sportType;
    if (maxPrice) filter['pricing.basePrice'] = { $lte: Number(maxPrice) };

    const courts = await Court.find(filter)
      .populate('owner', 'name')
      .limit(20);

    res.status(200).json({
      success: true,
      courts,
      searchParams: {
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius),
        sportType,
        maxPrice,
      },
    });
  } catch (error: any) {
    console.error('Search courts by location error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while searching courts'
    });
  }
};

// Get court analytics (detailed dashboard data)
export const getCourtAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?._id;
    const { courtId, period = '30' } = req.query;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    let courts;
    if (courtId) {
      // Get analytics for specific court
      const court = await Court.findById(courtId);
      if (!court || court.owner.toString() !== ownerId.toString()) {
        res.status(404).json({
          success: false,
          error: 'Court not found or not authorized'
        });
        return;
      }
      courts = [court];
    } else {
      // Get analytics for all owner's courts
      courts = await Court.find({ owner: ownerId });
    }

    // Calculate detailed analytics
    const analytics = {
      totalCourts: courts.length,
      totalRevenue: courts.reduce((sum, court) => sum + court.statistics.totalRevenue, 0),
      totalBookings: courts.reduce((sum, court) => sum + court.statistics.totalBookings, 0),
      averageRating: courts.length > 0 
        ? courts.reduce((sum, court) => sum + court.ratings.average, 0) / courts.length 
        : 0,
      revenueBySport: courts.reduce((acc, court) => {
        acc[court.sportType] = (acc[court.sportType] || 0) + court.statistics.totalRevenue;
        return acc;
      }, {} as Record<string, number>),
      bookingsBySport: courts.reduce((acc, court) => {
        acc[court.sportType] = (acc[court.sportType] || 0) + court.statistics.totalBookings;
        return acc;
      }, {} as Record<string, number>),
      courtPerformance: courts.map(court => ({
        id: court._id,
        name: court.name,
        sportType: court.sportType,
        revenue: court.statistics.totalRevenue,
        bookings: court.statistics.totalBookings,
        rating: court.ratings.average,
        status: court.status,
        approvalStatus: court.approvalStatus,
      })),
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error('Get court analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching analytics'
    });
  }
};

// Admin: Approve/Reject court
export const approveRejectCourt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courtId = req.params.id;
    const adminId = req.user?._id;
    const { approvalStatus, rejectionReason } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Check if user is admin
    if (req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can approve/reject courts'
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

    // Use findByIdAndUpdate to avoid validation issues
    const updateData: any = {
      approvalStatus,
      approvedBy: adminId,
      approvalDate: new Date(),
    };

    if (approvalStatus === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (approvalStatus === 'approved') {
      updateData.status = 'active';
      updateData.rejectionReason = undefined;
    }

    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      updateData,
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      court: updatedCourt,
    });
  } catch (error: any) {
    console.error('Approve/Reject court error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating court approval'
    });
  }
};

// Admin: Get all courts for approval
export const getCourtsForApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, approvalStatus } = req.query;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const filter: any = {};
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    } else {
      // Default to pending courts if no approvalStatus is specified
      filter.approvalStatus = 'pending';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const courts = await Court.find(filter)
      .populate('owner', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Court.countDocuments(filter);

    res.status(200).json({
      success: true,
      courts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCourts: total,
        hasNextPage: skip + courts.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Get courts for approval error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching courts for approval'
    });
  }
};
