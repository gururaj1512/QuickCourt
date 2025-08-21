import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  X
} from 'lucide-react';
import { courtAPI } from '../services/courtAPI';
import Button from '../components/ui/Button';
import CourtCard from '../components/CourtCard';
import CourtDetailModal from '../components/CourtDetailModal';
import DashboardSidebar from '../components/DashboardSidebar';
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

const CourtsPage = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sportTypes = [
    'All Sports',
    'Badminton',
    'Tennis',
    'Cricket',
    'Football',
    'Basketball',
    'Volleyball',
    'Squash',
    'Table Tennis'
  ];

  const cities = [
    'All Cities',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad'
  ];

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    filterAndSortCourts();
  }, [courts, searchQuery, selectedSport, selectedCity, priceRange, sortBy]);

  const fetchCourts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await courtAPI.getAllCourts();
      
      if (response.success && response.courts) {
        setCourts(response.courts);
      } else {
        setError(response.error || 'Failed to fetch courts');
      }
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError('An error occurred while fetching courts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCourts = () => {
    let filtered = [...courts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(court =>
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.location.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sport type filter
    if (selectedSport && selectedSport !== 'All Sports') {
      filtered = filtered.filter(court => court.sportType === selectedSport);
    }

    // City filter
    if (selectedCity && selectedCity !== 'All Cities') {
      filtered = filtered.filter(court => court.location.city === selectedCity);
    }

    // Price range filter
    filtered = filtered.filter(court => 
      court.pricing.basePrice >= priceRange.min && 
      court.pricing.basePrice <= priceRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.pricing.basePrice - b.pricing.basePrice;
        case 'price-high':
          return b.pricing.basePrice - a.pricing.basePrice;
        case 'rating':
          return (b.ratings?.average || 0) - (a.ratings?.average || 0);
        case 'reviews':
          return (b.ratings?.totalReviews || 0) - (a.ratings?.totalReviews || 0);
        default:
          return 0;
      }
    });

    setFilteredCourts(filtered);
  };

  const handleCourtClick = (court: Court) => {
    setSelectedCourt(court);
  };

  const handleCloseModal = () => {
    setSelectedCourt(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSport('');
    setSelectedCity('');
    setPriceRange({ min: 0, max: 5000 });
    setSortBy('name');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading courts...</span>
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
            <h1 className="text-lg font-semibold text-qc-text">Find Courts</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-qc-text mb-4">Find Your Perfect Court</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and book sports courts near you. From badminton to tennis, 
              find the perfect venue for your game.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courts by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-gray-50 rounded-qc-radius"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sport Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport Type</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
                  >
                    {sportTypes.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-qc-text">
              {filteredCourts.length} {filteredCourts.length === 1 ? 'Court' : 'Courts'} Found
            </h2>
            {error && (
              <p className="text-red-600 mt-2">{error}</p>
            )}
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
            >
              {sportTypes.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courts Grid */}
        {filteredCourts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCourts.map((court, index) => (
              <motion.div
                key={court._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CourtCard
                  court={court}
                  onClick={() => handleCourtClick(court)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-qc-text mb-2">No Courts Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find more courts.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Court Detail Modal */}
      {selectedCourt && (
        <CourtDetailModal
          court={selectedCourt}
          onClose={handleCloseModal}
        />
      )}
    </div>
    </div>
  );
};

export default CourtsPage;
