import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  Zap,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  BookOpen,
  Award,
  Wifi,
  Car,
  Coffee,
  Wrench,
  Lightbulb,
  Dumbbell,
  Droplets
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { bookingAPI } from '../services/bookingAPI';
import Button from './ui/Button';
import Input from './ui/Input';
import type { RootState } from '../store';
import type { CourtData } from '../services/courtAPI';

interface Court extends CourtData {
  _id: string;
  images?: Array<{
    public_id: string;
    url: string;
  }>;
  ratings: {
    average: number;
    totalReviews: number;
    reviews: Array<{
      user: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  status: string;
  approvalStatus: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface CourtDetailModalProps {
  court: Court;
  onClose: () => void;
}

const CourtDetailModal: React.FC<CourtDetailModalProps> = ({ court, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    players: { count: 2, names: [] },
    additionalServices: {
      equipment: false,
      lighting: false,
      coaching: false,
      cleaning: false,
    },
    userNotes: '',
    paymentMethod: 'online' as 'online' | 'cash' | 'card' | 'upi',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  useEffect(() => {
    if (showBookingForm && bookingData.date) {
      // Fetch availability if needed
      console.log('Fetching availability for date:', bookingData.date);
    }
  }, [bookingData.date, showBookingForm]);

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'Parking': Car,
      'WiFi': Wifi,
      'Shower': Droplets,
      'Cafeteria': Coffee,
      'Equipment Rental': Dumbbell,
      'Lighting': Lightbulb,
      'Maintenance': Wrench,
      'Coach Available': Award,
      'Spectator Seating': Users,
      'Restroom': Shield,
      'Changing Room': Shield,
      'Water Dispenser': Coffee,
      'First Aid Kit': Shield,
      'Vending Machine': Coffee,
      'Pro Shop': BookOpen,
      'Lockers': Shield,
      'Security': Shield,
      'Covered Court': Shield,
      'Air Conditioning': Zap,
      'Heating': Zap,
    };
    return icons[amenity] || Shield;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      setBookingError('Please log in to book a court');
      return;
    }

    try {
      setIsLoading(true);
      setBookingError(null);

      const response = await bookingAPI.createBooking({
        courtId: court._id,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        players: bookingData.players,
        additionalServices: bookingData.additionalServices,
        userNotes: bookingData.userNotes,
        paymentMethod: bookingData.paymentMethod,
      });

      if (response.success) {
        setBookingSuccess('Booking created successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setBookingError(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('An error occurred while creating the booking');
    } finally {
      setIsLoading(false);
    }
  };



  const nextImage = () => {
    if (court.images && court.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === (court.images?.length || 0) - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (court.images && court.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? (court.images?.length || 0) - 1 : prev - 1
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-qc-text">{court.name}</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Images and Basic Info */}
              <div className="space-y-6">
                {/* Image Gallery */}
                <div className="relative">
                  {court.images && court.images.length > 0 ? (
                    <div className="relative h-80 rounded-xl overflow-hidden">
                      <img
                        src={court.images[currentImageIndex].url}
                        alt={court.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {court.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {court.images.length}
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 bg-gradient-to-br from-qc-primary to-qc-accent rounded-xl flex items-center justify-center">
                      <div className="text-8xl">🏟️</div>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold">
                        {court.ratings?.average?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-500">
                        ({court.ratings?.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-qc-accent">
                      {formatPrice(court.pricing.basePrice)}/hr
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{court.location.address}, {court.location.city}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{court.capacity.minPlayers}-{court.capacity.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>{court.surfaceType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(court.operatingHours.monday.open)} - {formatTime(court.operatingHours.monday.close)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-qc-text mb-2">Description</h3>
                  <p className="text-gray-600">{court.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold text-qc-text mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {court.amenities.map((amenity, index) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Icon className="w-4 h-4 text-qc-primary" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Form and Details */}
              <div className="space-y-6">
                {!showBookingForm ? (
                  <>
                    {/* Court Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-qc-text">Court Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-qc-text mb-2">Dimensions</h4>
                          <p className="text-sm text-gray-600">
                            {court.dimensions.length}m × {court.dimensions.width}m
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-qc-text mb-2">Pricing</h4>
                          <p className="text-sm text-gray-600">
                            Base: {formatPrice(court.pricing.basePrice)}/hr
                          </p>
                          {court.pricing.peakHourPrice && (
                            <p className="text-sm text-gray-600">
                              Peak: {formatPrice(court.pricing.peakHourPrice)}/hr
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-qc-text mb-3">Operating Hours</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(court.operatingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}</span>
                              <span className="text-gray-600">
                                {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rules */}
                      {court.rules && court.rules.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-qc-text mb-3">Court Rules</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {court.rules.map((rule, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Reviews */}
                    {court.ratings?.reviews && court.ratings.reviews.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-qc-text mb-3">Recent Reviews</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {court.ratings.reviews.slice(0, 5).map((review, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium">{review.user}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(review.date)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Book Now Button */}
                    <Button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full"
                      size="lg"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                  </>
                ) : (
                  /* Booking Form */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-qc-text">Book This Court</h3>
                      <button
                        onClick={() => setShowBookingForm(false)}
                        className="text-qc-primary hover:text-qc-primary/80"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {bookingSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                        {bookingSuccess}
                      </div>
                    )}

                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {bookingError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <Input
                        label="Date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Start Time"
                          type="time"
                          value={bookingData.startTime}
                          onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                        <Input
                          label="End Time"
                          type="time"
                          value={bookingData.endTime}
                          onChange={(e) => setBookingData(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>

                      <Input
                        label="Number of Players"
                        type="number"
                        min={court.capacity.minPlayers}
                        max={court.capacity.maxPlayers}
                        value={bookingData.players.count}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          players: { ...prev.players, count: Number(e.target.value) }
                        }))}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Services
                        </label>
                        <div className="space-y-2">
                          {Object.entries(bookingData.additionalServices).map(([service, enabled]) => (
                            <label key={service} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setBookingData(prev => ({
                                  ...prev,
                                  additionalServices: {
                                    ...prev.additionalServices,
                                    [service]: e.target.checked
                                  }
                                }))}
                                className="rounded border-gray-300 text-qc-primary focus:ring-qc-primary"
                              />
                              <span className="text-sm capitalize">{service}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Input
                        label="Notes (Optional)"
                        type="text"
                        value={bookingData.userNotes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, userNotes: e.target.value }))}
                        placeholder="Any special requests or notes..."
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={bookingData.paymentMethod}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            paymentMethod: e.target.value as 'online' | 'cash' | 'card' | 'upi'
                          }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-qc-accent/50"
                        >
                          <option value="online">Online Payment</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                        </select>
                      </div>

                      <Button
                        onClick={handleBookingSubmit}
                        loading={isLoading}
                        className="w-full"
                        size="lg"
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourtDetailModal;
