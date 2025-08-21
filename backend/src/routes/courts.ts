import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth';
import {
  createCourt,
  getAllCourts,
  getCourtById,
  getCourtsByOwner,
  updateCourt,
  deleteCourt,
  toggleCourtAvailability,
  addCourtReview,
  getCourtStatistics,
  searchCourtsByLocation,
  getCourtAnalytics,
  approveRejectCourt,
  getCourtsForApproval,
} from '../controller/courtController';
import upload from '../middleware/upload';

const router = express.Router();

// Public routes (no authentication required)
router.route('/').get(getAllCourts);
router.route('/search/location').get(searchCourtsByLocation);
router.route('/:id').get(getCourtById);

// Protected routes (authentication required)
router.use(isAuthenticatedUser);

// Owner routes (Owner role required)
router.route('/owner/courts').get(authorizeRoles('Owner'), getCourtsByOwner);
router.route('/owner/statistics').get(authorizeRoles('Owner'), getCourtStatistics);
router.route('/owner/analytics').get(authorizeRoles('Owner'), getCourtAnalytics);

// Court management routes (Owner role required)
router.route('/').post(
  authorizeRoles('Owner'),
  upload.array('images', 10), // Allow up to 10 images
  createCourt
);

router.route('/:id')
  .put(
    authorizeRoles('Owner'),
    upload.array('images', 10),
    updateCourt
  )
  .delete(authorizeRoles('Owner'), deleteCourt);

router.route('/:id/availability').put(authorizeRoles('Owner'), toggleCourtAvailability);

// User routes (any authenticated user)
router.route('/:id/review').post(addCourtReview);

// Admin routes (Admin role required)
router.route('/admin/approval').get(authorizeRoles('Admin'), getCourtsForApproval);
router.route('/admin/:id/approve').put(authorizeRoles('Admin'), approveRejectCourt);

export default router;
