import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  MapPin, 
  Settings, 
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import LocationMap from './LocationMap';
import type { CourtData } from '../services/courtAPI';

const schema = yup.object({
  name: yup.string().min(2, 'Court name must be at least 2 characters').required('Court name is required'),
  sportType: yup.string().required('Sport type is required'),
  surfaceType: yup.string().required('Surface type is required'),
  description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  'location.address': yup.string().required('Address is required'),
  'location.city': yup.string().required('City is required'),
  'location.state': yup.string().required('State is required'),
  'location.zipCode': yup.string().required('ZIP code is required'),
  'location.coordinates.lat': yup.number().min(-90).max(90).required('Latitude is required'),
  'location.coordinates.lng': yup.number().min(-180).max(180).required('Longitude is required'),
  'pricing.basePrice': yup.number().min(0, 'Price must be positive').required('Base price is required'),
  'pricing.peakHourPrice': yup.number().min(0, 'Price must be positive').optional(),
  'pricing.weekendPrice': yup.number().min(0, 'Price must be positive').optional(),
  'capacity.minPlayers': yup.number().min(1, 'Minimum 1 player').required('Minimum players is required'),
  'capacity.maxPlayers': yup.number().min(1, 'Minimum 1 player').required('Maximum players is required'),
  'dimensions.length': yup.number().min(1, 'Length must be positive').required('Length is required'),
  'dimensions.width': yup.number().min(1, 'Width must be positive').required('Width is required'),
}).required();

type AddCourtFormData = yup.InferType<typeof schema>;

interface AddCourtFormProps {
  onSubmit: (data: CourtData, images: File[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AddCourtForm: React.FC<AddCourtFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>(['']);
  const [currentRule, setCurrentRule] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddCourtFormData>({
    resolver: yupResolver(schema),
  });

  const sportTypes = [
    'Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Squash', 'Table Tennis', 'Other'
  ];

  const surfaceTypes = [
    'Hard Court', 'Clay Court', 'Grass Court', 'Synthetic', 'Wooden', 'Concrete', 'Asphalt', 'Other'
  ];

  const availableAmenities = [
    'Parking', 'Shower', 'Changing Room', 'Water Dispenser', 'First Aid Kit',
    'Equipment Rental', 'Coach Available', 'Spectator Seating', 'Restroom',
    'WiFi', 'Air Conditioning', 'Heating', 'Vending Machine', 'Cafeteria',
    'Pro Shop', 'Lockers', 'Security', 'Lighting', 'Covered Court'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addRule = () => {
    if (currentRule.trim()) {
      setRules(prev => [...prev, currentRule.trim()]);
      setCurrentRule('');
    }
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setSelectedLocation(location);
    // Update form values using setValue
    setValue('location.address', location.address);
    setValue('location.city', location.city);
    setValue('location.state', location.state);
    setValue('location.zipCode', location.zipCode);
    setValue('location.coordinates.lat', location.lat);
    setValue('location.coordinates.lng', location.lng);
  };

  const handleFormSubmit = (data: AddCourtFormData) => {
    // Transform form data to match CourtData interface
    const courtData: CourtData = {
      name: data.name,
      sportType: data.sportType,
      surfaceType: data.surfaceType,
      description: data.description,
      location: {
        address: data['location.address'],
        city: data['location.city'],
        state: data['location.state'],
        zipCode: data['location.zipCode'],
        country: 'India',
        coordinates: {
          lat: data['location.coordinates.lat'],
          lng: data['location.coordinates.lng'],
        },
      },
      pricing: {
        basePrice: data['pricing.basePrice'],
        peakHourPrice: data['pricing.peakHourPrice'],
        weekendPrice: data['pricing.weekendPrice'],
        currency: 'INR',
        hourlyRate: true,
      },
      amenities,
      capacity: {
        minPlayers: data['capacity.minPlayers'],
        maxPlayers: data['capacity.maxPlayers'],
      },
      dimensions: {
        length: data['dimensions.length'],
        width: data['dimensions.width'],
        unit: 'meters',
      },
      lighting: {
        available: false,
      },
      equipment: {
        provided: false,
      },
      availability: {
        isAvailable: true,
        maintenanceMode: false,
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '06:00', close: '22:00', closed: false },
        sunday: { open: '06:00', close: '22:00', closed: false },
      },
      rules: rules.filter(rule => rule.trim()),
    };
    
    onSubmit(courtData, images);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-qc-text mb-2">Add New Court</h1>
        <p className="text-gray-600">Create a new court listing for your facility</p>
      </motion.div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-qc-primary mr-3" />
            <h2 className="text-xl font-semibold text-qc-text">Basic Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Court Name"
              error={errors.name?.message}
              placeholder="e.g., Center Court 1"
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-qc-text mb-2">Sport Type</label>
              <select
                {...register('sportType')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select sport type</option>
                {sportTypes.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              {errors.sportType && (
                <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-qc-text mb-2">Surface Type</label>
              <select
                {...register('surfaceType')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select surface type</option>
                {surfaceTypes.map(surface => (
                  <option key={surface} value={surface}>{surface}</option>
                ))}
              </select>
              {errors.surfaceType && (
                <p className="mt-1 text-sm text-red-600">{errors.surfaceType.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-qc-text mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
                placeholder="Describe your court, its features, and what makes it special..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-qc-primary mr-3" />
              <h2 className="text-xl font-semibold text-qc-text">Location</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>

          {showMap && (
            <div className="mb-6">
              <LocationMap
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : undefined}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Address"
                error={errors['location.address']?.message}
                placeholder="Street address"
                {...register('location.address')}
              />
            </div>

            <Input
              label="City"
              error={errors['location.city']?.message}
              placeholder="City name"
              {...register('location.city')}
            />

            <Input
              label="State"
              error={errors['location.state']?.message}
              placeholder="State name"
              {...register('location.state')}
            />

            <Input
              label="ZIP Code"
              error={errors['location.zipCode']?.message}
              placeholder="ZIP code"
              {...register('location.zipCode')}
            />

            <Input
              label="Latitude"
              type="number"
              step="any"
              error={errors['location.coordinates.lat']?.message}
              placeholder="e.g., 12.9716"
              {...register('location.coordinates.lat', { valueAsNumber: true })}
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              error={errors['location.coordinates.lng']?.message}
              placeholder="e.g., 77.5946"
              {...register('location.coordinates.lng', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">₹</span>
            <h2 className="text-xl font-semibold text-qc-text">Pricing</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Base Price (per hour)"
              type="number"
              error={errors['pricing.basePrice']?.message}
              placeholder="500"
              {...register('pricing.basePrice', { valueAsNumber: true })}
            />

            <Input
              label="Peak Hour Price (optional)"
              type="number"
              error={errors['pricing.peakHourPrice']?.message}
              placeholder="750"
              {...register('pricing.peakHourPrice', { valueAsNumber: true })}
            />

            <Input
              label="Weekend Price (optional)"
              type="number"
              error={errors['pricing.weekendPrice']?.message}
              placeholder="600"
              {...register('pricing.weekendPrice', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Court Specifications */}
        <Card>
          <h2 className="text-xl font-semibold text-qc-text mb-6">Court Specifications</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Minimum Players"
              type="number"
              error={errors['capacity.minPlayers']?.message}
              placeholder="2"
              {...register('capacity.minPlayers', { valueAsNumber: true })}
            />

            <Input
              label="Maximum Players"
              type="number"
              error={errors['capacity.maxPlayers']?.message}
              placeholder="4"
              {...register('capacity.maxPlayers', { valueAsNumber: true })}
            />

            <Input
              label="Length (meters)"
              type="number"
              step="0.1"
              error={errors['dimensions.length']?.message}
              placeholder="13.4"
              {...register('dimensions.length', { valueAsNumber: true })}
            />

            <Input
              label="Width (meters)"
              type="number"
              step="0.1"
              error={errors['dimensions.width']?.message}
              placeholder="6.1"
              {...register('dimensions.width', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <h2 className="text-xl font-semibold text-qc-text mb-6">Amenities</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {availableAmenities.map(amenity => (
              <motion.button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`p-3 rounded-qc-radius border-2 transition-all duration-300 text-sm font-medium ${
                  amenities.includes(amenity)
                    ? 'border-qc-accent bg-qc-accent/10 text-qc-accent'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-qc-primary hover:text-qc-primary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {amenity}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Rules */}
        <Card>
          <h2 className="text-xl font-semibold text-qc-text mb-6">Court Rules</h2>
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[index] = e.target.value;
                    setRules(newRules);
                  }}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter court rule..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeRule(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={currentRule}
                onChange={(e) => setCurrentRule(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-qc-radius focus:outline-none focus:ring-2 focus:ring-qc-accent/50 focus:border-transparent transition-all duration-300"
                placeholder="Add a new rule..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={addRule}
                disabled={!currentRule.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Images */}
        <Card>
          <div className="flex items-center mb-6">
            <ImageIcon className="w-6 h-6 text-qc-primary mr-3" />
            <h2 className="text-xl font-semibold text-qc-text">Court Images</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-qc-radius cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB each (max 10 images)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-qc-radius"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-qc-radius text-red-600 flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button">
            Save as Draft
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Create Court
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCourtForm;
