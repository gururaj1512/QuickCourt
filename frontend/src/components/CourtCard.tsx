import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  Zap
} from 'lucide-react';
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
}

interface CourtCardProps {
  court: Court;
  onClick: () => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onClick }) => {
  const getSportIcon = (sportType: string) => {
    const icons: Record<string, string> = {
      'Badminton': '🏸',
      'Tennis': '🎾',
      'Cricket': '🏏',
      'Football': '⚽',
      'Basketball': '🏀',
      'Volleyball': '🏐',
      'Squash': '🥎',
      'Table Tennis': '🏓'
    };
    return icons[sportType] || '🏟️';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    return time.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Court Image */}
      <div className="relative h-48 bg-gradient-to-br from-qc-primary to-qc-accent overflow-hidden">
        {court.images && court.images.length > 0 ? (
          <img
            src={court.images[0].url}
            alt={court.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">{getSportIcon(court.sportType)}</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(court.status)}`}>
            {court.status}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-qc-text">
              {formatPrice(court.pricing.basePrice)}/hr
            </span>
          </div>
        </div>

        {/* Sport Type Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-white">
              {getSportIcon(court.sportType)} {court.sportType}
            </span>
          </div>
        </div>
      </div>

      {/* Court Info */}
      <div className="p-6">
        {/* Court Name and Rating */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-qc-text mb-2 line-clamp-1">
            {court.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-qc-text">
                {court.ratings?.average?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-500">
                ({court.ratings?.totalReviews || 0})
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{court.location.city}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {court.description}
        </p>

        {/* Court Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>Capacity</span>
            </div>
            <span className="font-medium text-qc-text">
              {court.capacity.minPlayers}-{court.capacity.maxPlayers} players
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-4 h-4" />
              <span>Surface</span>
            </div>
            <span className="font-medium text-qc-text">
              {court.surfaceType}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Hours</span>
            </div>
            <span className="font-medium text-qc-text">
              {formatTime(court.operatingHours.monday.open)} - {formatTime(court.operatingHours.monday.close)}
            </span>
          </div>
        </div>

        {/* Amenities Preview */}
        {court.amenities && court.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {court.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {court.amenities.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{court.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-qc-accent text-white py-3 rounded-qc-radius font-semibold hover:bg-qc-accent/90 transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>View Details & Book</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CourtCard;
