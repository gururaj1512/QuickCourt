/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      // Decode the token in case it's URL-encoded
      const decodedToken = decodeURIComponent(token);
      verifyEmail(decodedToken);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerificationStatus('loading');
      setMessage('Verifying your email...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.message || 'Email verified successfully!');
        setEmail(result.user?.email || '');
      } else {
        setVerificationStatus('error');
        setMessage(result.error || 'Verification failed');
      }
    } catch (error: unknown) {
      console.error('Frontend - Verification error:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setIsResending(true);
      setMessage('Sending verification email...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message || 'Verification email sent successfully!');
      } else {
        setMessage(result.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred while sending verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case 'loading':
        return <RefreshCw className="w-16 h-16 text-qc-primary animate-spin" />;
      default:
        return <Mail className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'loading':
        return 'text-qc-primary';
      default:
        return 'text-gray-600';
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
            <h1 className="text-3xl font-bold text-qc-text mb-2">Email Verification</h1>
            <p className="text-gray-600">Verify your email address to complete registration</p>
          </motion.div>

          {/* Status Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mb-6"
          >
            {getStatusIcon()}
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-4 rounded-qc-radius text-center ${getStatusColor()}`}
            >
              <p className="text-sm">{message}</p>
            </motion.div>
          )}

          {/* Success Actions */}
          {verificationStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Continue to Login
              </Button>
            </motion.div>
          )}

          {/* Error Actions */}
          {verificationStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleResendVerification}
                  loading={isResending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </Button>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-qc-primary hover:text-qc-primary/80 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {verificationStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600">Please wait while we verify your email...</p>
            </motion.div>
          )}

          {/* No Token State */}
          {!token && verificationStatus === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Please enter your email address to receive a verification link
                </p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300 mb-4"
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleResendVerification}
                  loading={isResending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Email
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
