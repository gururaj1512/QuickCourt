import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth';
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  addBookingReview,
  getBookingAnalytics,
  getCourtAvailability,
  cancelBooking,
  getAllBookings,
} from '../controller/bookingController';

const router = express.Router();

// Public routes (no authentication required)
router.route('/availability').get(getCourtAvailability);

// Protected routes (authentication required)
router.use(isAuthenticatedUser);

// User routes (any authenticated user)
router.route('/').post(createBooking);
router.route('/user').get(getUserBookings);

// Analytics routes
router.route('/analytics/user').get(getBookingAnalytics);
router.route('/analytics/owner').get(getBookingAnalytics);

// Owner routes (Owner role required)
router.route('/owner').get(authorizeRoles('Owner'), getOwnerBookings);

// Admin routes (Admin role required)
router.route('/admin/all').get(authorizeRoles('Admin'), getAllBookings);

// Parameterized routes (must come after specific routes)
router.route('/:id').get(getBookingById);
router.route('/:id/status').put(updateBookingStatus);
router.route('/:id/payment').put(updatePaymentStatus);
router.route('/:id/review').post(addBookingReview);
router.route('/:id/cancel').put(cancelBooking);

export default router;
