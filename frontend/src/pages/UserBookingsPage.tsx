import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  X, 
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { bookingAPI } from '../services/bookingAPI';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DashboardSidebar from '../components/DashboardSidebar';

interface Booking {
  _id: string;
  court: {
    _id: string;
    name: string;
    sportType: string;
    location: {
      address: string;
      city: string;
      state: string;
    };
    images?: Array<{
      public_id: string;
      url: string;
    }>;
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
    names?: string[];
  };
  additionalServices?: {
    equipment: boolean;
    lighting: boolean;
    coaching: boolean;
    cleaning: boolean;
  };
  rating?: number;
  review?: string;
  createdAt: string;
}

const UserBookingsPage = () => {

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await bookingAPI.getUserBookings();
      
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingAPI.cancelBooking(bookingId, {
        cancellationReason: 'Cancelled by user'
      });
      
      if (response.success) {
        fetchBookings();
      } else {
        alert(response.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('An error occurred while cancelling the booking');
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
      booking.court.sportType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <h1 className="text-lg font-semibold text-qc-text">My Bookings</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">My Bookings</h1>
              <p className="text-gray-600 mt-1">Manage your court reservations</p>
            </div>
            <Button variant="outline" onClick={fetchBookings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
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
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {booking.court.images && booking.court.images.length > 0 ? (
                        <img
                          src={booking.court.images[0].url}
                          alt={booking.court.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-qc-primary to-qc-accent">
                          <span className="text-white text-2xl">🏟️</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-qc-text mb-2">
                            {booking.court.name}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {booking.court.location.address}, {booking.court.location.city}
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
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Amount:</span>
                                <span className="font-semibold text-qc-text">{formatPrice(booking.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          {booking.rating && (
                            <div className="flex items-center">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= booking.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {booking.review && (
                                <p className="text-sm text-gray-600 ml-2">"{booking.review}"</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
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
                    : 'You haven\'t made any bookings yet.'
                  }
                </p>
                <Button variant="primary" onClick={() => window.location.href = '/courts'}>
                  Find Courts
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBookingsPage;
