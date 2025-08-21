import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Search, Loader2 } from 'lucide-react';
import Button from './ui/Button';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface LocationMapProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: { lat: number; lng: number };
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMwQjZCNjMiLz4KPHBhdGggZD0iTTEyIDEzQzEzLjY2IDEzIDE1IDExLjY2IDE1IDEwQzE1IDguMzQgMTMuNjYgNyAxMiA3QzEwLjM0IDcgOSA4LjM0IDkgMTBDOSAxMS42NiAxMC4zNCAxMyAxMiAxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Map click handler component
const MapClickHandler: React.FC<{
  onLocationSelect: (location: Location) => void;
  setIsLoading: (loading: boolean) => void;
}> = ({ onLocationSelect, setIsLoading }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setIsLoading(true);
      
      try {
        // Use OpenStreetMap Nominatim for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.address) {
            const location: Location = {
              lat,
              lng,
              address: data.display_name.split(',')[0] || '',
              city: data.address.city || data.address.town || data.address.village || data.address.county || '',
              state: data.address.state || '',
              zipCode: data.address.postcode || '',
            };
            
            onLocationSelect(location);
          }
        }
      } catch (error) {
        console.error('Error fetching location details:', error);
        // Fallback to coordinates only
        const location: Location = {
          lat,
          lng,
          address: '',
          city: '',
          state: '',
          zipCode: '',
        };
        onLocationSelect(location);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation ? {
      lat: initialLocation.lat,
      lng: initialLocation.lng,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter = initialLocation || { lat: 20.5937, lng: 78.9629 }; // India center

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length > 0) {
          const result = data[0];
          const location: Location = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name.split(',')[0] || '',
            city: result.address?.city || result.address?.town || result.address?.village || result.address?.county || '',
            state: result.address?.state || '',
            zipCode: result.address?.postcode || '',
          };
          
          handleLocationSelect(location);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.address) {
                const location: Location = {
                  lat: latitude,
                  lng: longitude,
                  address: data.display_name.split(',')[0] || '',
                  city: data.address.city || data.address.town || data.address.village || data.address.county || '',
                  state: data.address.state || '',
                  zipCode: data.address.postcode || '',
                };
                
                handleLocationSelect(location);
              }
            }
          } catch (error) {
            console.error('Error fetching current location details:', error);
            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: '',
              city: '',
              state: '',
              zipCode: '',
            };
            handleLocationSelect(location);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          variant="outline"
          size="sm"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
        <Button
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Current'}
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-qc-radius p-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Select Location</h4>
            <p className="text-sm text-blue-700">
              Click anywhere on the map to select your court location. The address details will be automatically filled in.
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={[selectedLocation?.lat || defaultCenter.lat, selectedLocation?.lng || defaultCenter.lng]}
          zoom={13}
          className="h-96 w-full rounded-qc-radius border border-gray-200"
          style={{ zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} setIsLoading={setIsLoading} />
          
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={customIcon}
            />
          )}
        </MapContainer>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-qc-radius">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-qc-primary" />
              <span className="text-qc-primary font-medium">Getting location details...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-qc-radius p-4"
        >
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">Selected Location</h4>
              <p className="text-sm text-green-700">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
              {selectedLocation.address && (
                <p className="text-sm text-green-700 mt-1">
                  Address: {selectedLocation.address}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationMap;
