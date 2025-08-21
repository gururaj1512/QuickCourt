import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { RootState } from '../store';
import AddCourtFormV2 from '../components/AddCourtFormV2';
import DashboardSidebar from '../components/DashboardSidebar';
import { courtAPI, type CourtData } from '../services/courtAPI';

const AddCourtPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is an owner
  if (user?.role !== 'Owner') {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-qc-text mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Only court owners can add new courts. Please contact support if you believe this is an error.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-qc-primary text-white rounded-qc-radius hover:bg-qc-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CourtData, images: File[]) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await courtAPI.createCourt(data, images);

      if (result.success) {
        setSuccess('Court created successfully! Redirecting to your courts...');
        setTimeout(() => {
          navigate('/owner/courts');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create court');
      }
    } catch (err: unknown) {
      console.error('Error creating court:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the court. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qc-bg flex">
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
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
            <h1 className="text-lg font-semibold text-qc-text">Add Court</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 p-4 m-4 rounded-qc-radius"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 p-4 m-4 rounded-qc-radius"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
            <AddCourtFormV2
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            />
        </div>
      </div>
    </div>
  );
};

export default AddCourtPage;
