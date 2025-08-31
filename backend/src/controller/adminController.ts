import { Request, Response } from 'express';
import User from '../models/User';
import Court from '../models/Court';
import Booking from '../models/Booking';
import { AuthRequest } from '../types';

// Get admin dashboard statistics
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalCourts = await Court.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Get revenue
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get pending approvals
    const pendingApprovals = await Court.countDocuments({ approvalStatus: 'pending' });

    // Get active courts
    const activeCourts = await Court.countDocuments({ status: 'active' });

    // Get average rating
    const courtsWithRatings = await Court.find({ 'ratings.average': { $gt: 0 } });
    const averageRating = courtsWithRatings.length > 0 
      ? courtsWithRatings.reduce((sum, court) => sum + court.ratings.average, 0) / courtsWithRatings.length 
      : 0;

    // Calculate growth percentages (comparing with previous period)
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - Number(period));

    const currentPeriodUsers = await User.countDocuments({ createdAt: { $gte: daysAgo } });
    const previousPeriodUsers = await User.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo } 
    });
    const userGrowth = previousPeriodUsers > 0 
      ? Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100) 
      : currentPeriodUsers > 0 ? 100 : 0;

    const currentPeriodCourts = await Court.countDocuments({ createdAt: { $gte: daysAgo } });
    const previousPeriodCourts = await Court.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: daysAgo } 
    });
    const courtGrowth = previousPeriodCourts > 0 
      ? Math.round(((currentPeriodCourts - previousPeriodCourts) / previousPeriodCourts) * 100) 
      : currentPeriodCourts > 0 ? 100 : 0;

    const currentPeriodRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const previousPeriodRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: previousPeriodStart, $lt: daysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const currentRevenue = currentPeriodRevenue[0]?.total || 0;
    const previousRevenue = previousPeriodRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) 
      : currentRevenue > 0 ? 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourts,
        totalBookings,
        totalRevenue,
        pendingApprovals,
        activeCourts,
        averageRating: Math.round(averageRating * 100) / 100,
        userGrowth,
        courtGrowth,
        revenueGrowth,
        period: Number(period)
      },
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching admin statistics'
    });
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // User analytics
    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Court analytics
    const courtStats = await Court.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Booking analytics
    const bookingStats = await Booking.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Sport type distribution
    const sportTypeStats = await Court.aggregate([
      {
        $group: {
          _id: '$sportType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Status distribution
    const statusStats = await Court.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing courts
    const topCourts = await Court.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'court',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          totalRevenue: {
            $sum: '$bookings.totalAmount'
          }
        }
      },
      {
        $project: {
          name: 1,
          sportType: 1,
          totalBookings: 1,
          totalRevenue: 1,
          'ratings.average': 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userStats,
        courtStats,
        bookingStats,
        sportTypeStats,
        statusStats,
        topCourts,
        period: Number(period)
      },
    });
  } catch (error: any) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching platform analytics'
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const limit = Number(req.query.limit) || 20;

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email role createdAt');

    // Get recent courts
    const recentCourts = await Court.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('owner', 'name email')
      .select('name sportType status approvalStatus createdAt owner');

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate('court', 'name sportType')
      .select('totalAmount status createdAt user court');

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        title: 'New user registered',
        description: `${user.name} (${user.email})`,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentCourts.map(court => ({
        type: 'court_created',
        title: 'New court created',
        description: `${court.name} by ${(court.owner as any).name}`,
        timestamp: court.createdAt,
        data: court
      })),
      ...recentBookings.map(booking => ({
        type: 'booking_created',
        title: 'New booking',
        description: `${(booking.court as any).name} - ₹${booking.totalAmount}`,
        timestamp: booking.createdAt,
        data: booking
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error: any) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching recent activity'
    });
  }
};

// Get user management data
export const getUserManagementData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    const total = await User.countDocuments(filter);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: Number(page) > 1,
      },
      stats: userStats,
    });
  } catch (error: any) {
    console.error('Get user management data error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching user data'
    });
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    if (!['User', 'Owner', 'Admin'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
      message: 'User role updated successfully'
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while updating user role'
    });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can access this endpoint'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if user has any courts or bookings
    const courtCount = await Court.countDocuments({ owner: userId });
    const bookingCount = await Booking.countDocuments({ 
      $or: [{ user: userId }, { owner: userId }] 
    });

    if (courtCount > 0 || bookingCount > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete user with existing courts or bookings'
      });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while deleting user'
    });
  }
};

