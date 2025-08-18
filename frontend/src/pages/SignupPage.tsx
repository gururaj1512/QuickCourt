import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { register as registerUser, clearError } from '../store/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  role: yup.string().oneOf(['User', 'Owner'], 'Please select a valid role').required('Role is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
}).required();

type SignupFormData = yup.InferType<typeof schema>;

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema),
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...registerData } = data;
    await dispatch(registerUser({ 
      ...registerData, 
      confirmPassword,
      avatar: profileImage || undefined
    }));
  };

  const handleImageChange = (file: File | null) => {
    setProfileImage(file);
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: password?.length >= 6 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password || '') },
    { label: 'One lowercase letter', met: /[a-z]/.test(password || '') },
    { label: 'One number', met: /\d/.test(password || '') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-qc-bg via-white to-qc-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center text-qc-text hover:text-qc-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        <Card className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-qc-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">QC</span>
            </div>
            <h1 className="text-3xl font-bold text-qc-text mb-2">Join QuickCourt</h1>
            <p className="text-gray-600">Create your account to start playing</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ImageUpload onImageChange={handleImageChange} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Input
                label="Full Name"
                type="text"
                error={errors.name?.message}
                placeholder="Enter your full name"
                {...register('name')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                placeholder="Enter your email"
                {...register('email')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <div className="w-full">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-qc-text">
                    Account Type
                  </label>
                </div>
                <div className="relative">
                  <select
                    {...register('role')}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">Select your account type</option>
                    <option value="User">User - Book courts and play sports</option>
                    <option value="Owner">Owner - Manage courts and facilities</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
            >
              <Input
                label="Password"
                type="password"
                showPasswordToggle
                error={errors.password?.message}
                placeholder="Enter your password"
                {...register('password')}
              />
              
              {/* Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-gray-50 rounded-qc-radius"
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle 
                          className={`w-4 h-4 mr-2 ${
                            requirement.met ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={requirement.met ? 'text-gray-700' : 'text-gray-500'}>
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
            >
              <Input
                label="Confirm Password"
                type="password"
                showPasswordToggle
                error={errors.confirmPassword?.message}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-qc-radius text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              className="flex items-start"
            >
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-qc-primary border-gray-300 rounded focus:ring-qc-primary mt-1"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-qc-primary hover:text-qc-primary/80 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-qc-primary hover:text-qc-primary/80 transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.05 }}
            >
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.15 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-qc-primary hover:text-qc-primary/80 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
