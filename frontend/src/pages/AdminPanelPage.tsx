import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  X, 
  AlertCircle,
  Users,
  Building,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { courtAPI } from '../services/courtAPI';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DashboardSidebar from '../components/DashboardSidebar';
import type { RootState } from '../store';

interface Court {
  _id: string;
  name: string;
  sportType: string;
  location: {
    city: string;
    state: string;
  };
  owner: {
    name: string;
    email: string;
  };
  status: string;
  approvalStatus: string;
  createdAt: string;
}

const AdminPanelPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [pendingCourts, setPendingCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchPendingCourts();
  }, [user]);

  const fetchPendingCourts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courtAPI.getCourtsForApproval();
      
      if (response.success && response.courts) {
        setPendingCourts(response.courts);
      } else {
        setError(response.error || 'Failed to fetch pending courts');
      }
    } catch (err) {
      console.error('Error fetching pending courts:', err);
      setError('An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCourt = async (courtId: string) => {
    try {
      const response = await courtAPI.approveRejectCourt(courtId, { 
        approvalStatus: 'approved'
      });
      
      if (response.success) {
        fetchPendingCourts();
      } else {
        alert(response.error || 'Failed to approve court');
      }
    } catch (error) {
      console.error('Error approving court:', error);
      alert('An error occurred while approving the court');
    }
  };

  const handleRejectCourt = async (courtId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await courtAPI.approveRejectCourt(courtId, { 
        approvalStatus: 'rejected',
        rejectionReason: reason
      });
      
      if (response.success) {
        fetchPendingCourts();
      } else {
        alert(response.error || 'Failed to reject court');
      }
    } catch (error) {
      console.error('Error rejecting court:', error);
      alert('An error occurred while rejecting the court');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-qc-text mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading admin panel...</span>
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
            <h1 className="text-lg font-semibold text-qc-text">Admin Panel</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage the platform and approve court submissions</p>
            </div>
            <Button variant="outline" onClick={fetchPendingCourts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-qc-text">150</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courts</p>
                  <p className="text-2xl font-bold text-qc-text">25</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCourts.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-qc-accent">₹2.5L</p>
                </div>
                <div className="p-3 bg-qc-accent/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-qc-accent" />
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Approvals Section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-qc-text">Pending Court Approvals</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {pendingCourts.length} pending
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {pendingCourts.length > 0 ? (
              <div className="space-y-4">
                {pendingCourts.map((court) => (
                  <motion.div
                    key={court._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-qc-text mb-2">
                          {court.name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Sport:</span> {court.sportType}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {court.location.city}, {court.location.state}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Owner:</span> {court.owner.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {court.owner.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Submitted:</span> {formatDate(court.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveCourt(court._id)}
                          className="flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectCourt(court._id)}
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-qc-text mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending court approvals at the moment.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
