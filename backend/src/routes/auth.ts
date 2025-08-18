import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth';
import { registerUser, loginUser, forgotPassword, resetPassword, getUserDetails, logout, updatePassword, updateUserProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser, verifyEmail, resendVerificationEmail } from '../controller/userController';
import upload from '../middleware/upload';


const router = express.Router();

router.route('/register').post(upload.single('avatar'), registerUser)
router.route('/login').post(loginUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/logout').get(logout)

// Email verification routes
router.route('/verify-email/:token').get(verifyEmail)
router.route('/resend-verification').post(resendVerificationEmail)

router.route('/me').get(isAuthenticatedUser, getUserDetails)
router.route('/me/update').put(isAuthenticatedUser, upload.single('avatar'), updateUserProfile)
router.route('/password/update').put(isAuthenticatedUser, updatePassword)

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers)
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser)


export default router;
