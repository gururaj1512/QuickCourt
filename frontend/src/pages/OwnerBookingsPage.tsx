import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  X, 
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { bookingAPI } from '../services/bookingAPI';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DashboardSidebar from '../components/DashboardSidebar';
import type { RootState } from '../store';

interface Booking {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  court: {
    name: string;
    sportType: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  players: {
    count: number;
  };
  userNotes?: string;
  createdAt: string;
}

const OwnerBookingsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'Owner') {
      window.location.href = '/dashboard';
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bookingAPI.getOwnerBookings();
      
      if (response.success && response.bookings) {
        setBookings(response.bookings);
      } else {
        setError(response.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('An error occurred while fetching bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, {
        status: 'confirmed'
      });
      
      if (response.success) {
        fetchBookings();
      } else {
        alert(response.error || 'Failed to confirm booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('An error occurred while confirming the booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, {
        status: 'cancelled',
        cancellationReason: reason
      });
      
      if (response.success) {
        fetchBookings();
      } else {
        alert(response.error || 'Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('An error occurred while rejecting the booking');
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, {
        status: 'completed'
      });
      
      if (response.success) {
        fetchBookings();
      } else {
        alert(response.error || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('An error occurred while completing the booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      booking.court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  };

  if (user?.role !== 'Owner') {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-qc-text mb-2">Access Denied</h1>
          <p className="text-gray-600">Only court owners can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading bookings...</span>
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
            <h1 className="text-lg font-semibold text-qc-text">Court Bookings</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Court Bookings</h1>
              <p className="text-gray-600 mt-1">Manage booking requests for your courts</p>
            </div>
            <Button variant="outline" onClick={fetchBookings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-qc-text">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-qc-accent">{formatPrice(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by court name or user name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </Card>

          {error && (
            <Card className="mb-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </Card>
          )}

          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-qc-text">
                          {booking.court.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            {booking.user.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(booking.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {booking.startTime} - {booking.endTime} ({booking.duration}h)
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Amount:</span>
                            <span className="font-semibold text-qc-text">{formatPrice(booking.totalAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Players:</span>
                            <span className="font-medium text-qc-text">{booking.players.count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Sport:</span>
                            <span className="font-medium text-qc-text">{booking.court.sportType}</span>
                          </div>
                        </div>
                      </div>

                      {booking.userNotes && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">User Notes:</span> {booking.userNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmBooking(booking._id)}
                            className="flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectBooking(booking._id)}
                            className="flex items-center text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-qc-text mb-2">No Bookings Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedStatus !== 'all' 
                    ? 'Try adjusting your search criteria.'
                    : 'No bookings have been made for your courts yet.'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerBookingsPage;
