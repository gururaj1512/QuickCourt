import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth';
import {
  getAdminStats,
  getPlatformAnalytics,
  getRecentActivity,
  getUserManagementData,
  updateUserRole,
  deleteUser
} from '../controller/adminController';

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticatedUser, authorizeRoles('Admin'));

// Dashboard statistics
router.get('/stats', getAdminStats);

// Platform analytics
router.get('/analytics', getPlatformAnalytics);

// Recent activity
router.get('/activity', getRecentActivity);

// User management
router.get('/users', getUserManagementData);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

export default router;

