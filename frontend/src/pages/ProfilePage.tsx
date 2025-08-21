import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { getCurrentUser } from '../store/authSlice';
import { authAPI } from '../services/authAPI';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import DashboardSidebar from '../components/DashboardSidebar';

// Validation schemas
const profileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phone: yup.string().optional().default(''),
}).required();

const passwordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
}).required();

type ProfileFormData = yup.InferType<typeof profileSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  // Remove the unnecessary getCurrentUser call since user data is already in Redux store
  // The App.tsx already handles fetching user data on app load

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileError(null);
      setProfileSuccess(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.phone) {
        formData.append('phone', data.phone);
      }
      if (profileImage) {
        formData.append('avatar', profileImage);
      }

      const result = await authAPI.updateProfile(formData);

      if (result.success) {
        setProfileSuccess('Profile updated successfully!');
        setIsEditingProfile(false);
        setProfileImage(null);
        dispatch(getCurrentUser()); // Refresh user data
      } else {
        setProfileError(result.message || 'Failed to update profile');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating profile';
      setProfileError(errorMessage);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);

      const result = await authAPI.updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        setPasswordSuccess('Password updated successfully!');
        setIsChangingPassword(false);
        passwordForm.reset();
      } else {
        setPasswordError(result.message || 'Failed to update password');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating password';
      setPasswordError(errorMessage);
    }
  };

  const handleImageChange = (file: File | null) => {
    setProfileImage(file);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-qc-text mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <Link to="/login">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-qc-bg flex">
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-qc-text">Profile Settings</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-qc-text">Profile Information</h2>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileImage(null);
                        setProfileError(null);
                        setProfileSuccess(null);
                        profileForm.reset({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || '',
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={profileForm.handleSubmit(handleProfileSubmit)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              {profileSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-qc-radius text-green-600 text-sm flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {profileSuccess}
                </motion.div>
              )}

              {profileError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-qc-radius text-red-600 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {profileError}
                </motion.div>
              )}

              {isEditingProfile ? (
                <form className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div>
                    <ImageUpload 
                      onImageChange={handleImageChange}
                      currentImage={user.avatar?.url}
                    />
                  </div>

                  {/* Name */}
                  <Input
                    label="Full Name"
                    type="text"
                    error={profileForm.formState.errors.name?.message}
                    placeholder="Enter your full name"
                    {...profileForm.register('name')}
                  />

                  {/* Email */}
                  <Input
                    label="Email Address"
                    type="email"
                    error={profileForm.formState.errors.email?.message}
                    placeholder="Enter your email"
                    {...profileForm.register('email')}
                  />

                  {/* Phone */}
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    error={profileForm.formState.errors.phone?.message}
                    placeholder="Enter your phone number"
                    {...profileForm.register('phone')}
                  />
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-qc-text">{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-qc-text">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-qc-text">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Password Change Card */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-qc-text">Change Password</h2>
                {!isChangingPassword ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        passwordForm.reset();
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={passwordForm.handleSubmit(handlePasswordSubmit)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                )}
              </div>

              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-qc-radius text-green-600 text-sm flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {passwordSuccess}
                </motion.div>
              )}

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-qc-radius text-red-600 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {passwordError}
                </motion.div>
              )}

              {isChangingPassword ? (
                <form className="space-y-6">
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showOldPassword ? 'text' : 'password'}
                      error={passwordForm.formState.errors.oldPassword?.message}
                      placeholder="Enter your current password"
                      {...passwordForm.register('oldPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      error={passwordForm.formState.errors.newPassword?.message}
                      placeholder="Enter your new password"
                      {...passwordForm.register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      placeholder="Confirm your new password"
                      {...passwordForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Click "Change Password" to update your password</p>
                </div>
              )}
            </Card>
          </div>

          {/* Account Information Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <h3 className="text-lg font-semibold text-qc-text mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium text-qc-text capitalize">{user.role}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Verification</span>
                  <span className={`text-sm font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-qc-text">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium text-qc-text">
                    {formatDate(user.updatedAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-qc-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full text-left px-4 py-3 text-sm text-qc-text hover:bg-gray-50 rounded-qc-radius transition-colors"
                >
                  View Dashboard
                </Link>
                <Link
                  to="/bookings"
                  className="block w-full text-left px-4 py-3 text-sm text-qc-text hover:bg-gray-50 rounded-qc-radius transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  to="/settings"
                  className="block w-full text-left px-4 py-3 text-sm text-qc-text hover:bg-gray-50 rounded-qc-radius transition-colors"
                >
                  Account Settings
                </Link>
              </div>
            </Card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;
