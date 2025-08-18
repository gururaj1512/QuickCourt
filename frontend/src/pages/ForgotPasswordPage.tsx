import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/authAPI';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
}).required();

type ForgotPasswordFormData = yup.InferType<typeof schema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authAPI.forgotPassword(data.email);

      if (result.success) {
        setIsSuccess(true);
        reset();
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending reset email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-qc-bg via-white to-qc-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Link
            to="/login"
            className="inline-flex items-center text-qc-text hover:text-qc-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-qc-text mb-2">Forgot Password</h1>
            <p className="text-gray-600">Enter your email to receive a password reset link</p>
          </motion.div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-qc-text mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleResend}
                  className="w-full"
                >
                  Send Another Email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Input
                  label="Email Address"
                  type="email"
                  error={errors.email?.message}
                  placeholder="Enter your email address"
                  {...register('email')}
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-qc-radius text-red-600 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  Send Reset Link
                </Button>
              </motion.div>
            </form>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600">
              Remember your password?{' '}
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

export default ForgotPasswordPage;
