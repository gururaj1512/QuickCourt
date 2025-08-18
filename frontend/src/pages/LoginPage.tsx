/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

type LoginFormData = yup.InferType<typeof schema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data));
      // Check if login failed due to email verification requirement
      if (login.rejected.match(result)) {
        const errorPayload = result.payload as { requiresVerification?: boolean; email?: string };
        if (errorPayload?.requiresVerification) {
          setVerificationEmail(errorPayload.email || '');
          setShowVerificationMessage(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Verification email sent successfully!');
      } else {
        alert(result.error || 'Failed to send verification email');
      }
    } catch (error) {
      alert('An error occurred while sending verification email');
    }
  };

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
            <div className="w-16 h-16 bg-qc-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">QC</span>
            </div>
            <h1 className="text-3xl font-bold text-qc-text mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your QuickCourt account</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Input
                label="Password"
                type="password"
                showPasswordToggle
                error={errors.password?.message}
                placeholder="Enter your password"
                {...register('password')}
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

            {showVerificationMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-qc-radius"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 mb-2">
                      Please verify your email address before logging in. Check your inbox for a verification link.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleResendVerification}
                        className="text-sm text-yellow-700 hover:text-yellow-800 underline"
                      >
                        Resend verification email
                      </button>
                      <span className="text-yellow-600">•</span>
                      <Link
                        to="/verify-email"
                        className="text-sm text-yellow-700 hover:text-yellow-800 underline"
                      >
                        Verify manually
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-qc-primary border-gray-300 rounded focus:ring-qc-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-qc-primary hover:text-qc-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-qc-primary hover:text-qc-primary/80 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
