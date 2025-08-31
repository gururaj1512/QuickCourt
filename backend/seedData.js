const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Court = require('./dist/models/Court').default;
const Booking = require('./dist/models/Booking').default;
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'User',
    isVerified: true,
    avatar: {
      public_id: 'default_avatar',
      url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'User',
    isVerified: true,
    avatar: {
      public_id: 'default_avatar',
      url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'User',
    isVerified: true,
    avatar: {
      public_id: 'default_avatar',
      url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'User',
    isVerified: true,
    avatar: {
      public_id: 'default_avatar',
      url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    password: 'password123',
    role: 'User',
    isVerified: true,
    avatar: {
      public_id: 'default_avatar',
      url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  }
];

const sampleCourts = [
  {
    name: 'Elite Badminton Center',
    sportType: 'Badminton',
    surfaceType: 'Synthetic',
    description: 'Professional badminton courts with international standards',
    location: {
      address: '123 Sports Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    pricing: {
      basePrice: 800,
      peakHourPrice: 1200,
      weekendPrice: 1000,
      currency: 'INR',
      hourlyRate: true
    },
    amenities: ['Parking', 'Shower', 'Changing Room', 'WiFi', 'Air Conditioning'],
    capacity: { minPlayers: 2, maxPlayers: 4 },
    dimensions: { length: 13.4, width: 6.1, unit: 'meters' },
    lighting: { available: true, type: 'LED', additionalCost: 200 },
    equipment: { provided: true, items: ['Rackets', 'Shuttles'], rentalCost: 100 },
    availability: { isAvailable: true, maintenanceMode: false },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    rules: ['Proper sports shoes required', 'No food or drinks on court'],
    status: 'active',
    approvalStatus: 'approved',
    ratings: {
      average: 4.5,
      totalReviews: 25,
      reviews: []
    },
    statistics: {
      totalBookings: 150,
      totalRevenue: 120000,
      averageBookingDuration: 2.5,
      peakHours: ['18:00', '19:00', '20:00'],
      popularDays: ['Saturday', 'Sunday']
    }
  },
  {
    name: 'Tennis Paradise',
    sportType: 'Tennis',
    surfaceType: 'Hard Court',
    description: 'Premium tennis courts with professional coaching available',
    location: {
      address: '456 Athletic Club',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    pricing: {
      basePrice: 1200,
      peakHourPrice: 1800,
      weekendPrice: 1500,
      currency: 'INR',
      hourlyRate: true
    },
    amenities: ['Parking', 'Shower', 'Changing Room', 'WiFi', 'Pro Shop', 'Coach Available'],
    capacity: { minPlayers: 2, maxPlayers: 4 },
    dimensions: { length: 23.77, width: 10.97, unit: 'meters' },
    lighting: { available: true, type: 'LED', additionalCost: 300 },
    equipment: { provided: true, items: ['Rackets', 'Balls'], rentalCost: 150 },
    availability: { isAvailable: true, maintenanceMode: false },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    rules: ['Tennis shoes mandatory', 'Booking confirmation required'],
    status: 'active',
    approvalStatus: 'approved',
    ratings: {
      average: 4.8,
      totalReviews: 18,
      reviews: []
    },
    statistics: {
      totalBookings: 95,
      totalRevenue: 114000,
      averageBookingDuration: 2.0,
      peakHours: ['17:00', '18:00', '19:00'],
      popularDays: ['Saturday', 'Sunday']
    }
  },
  {
    name: 'Cricket Ground Central',
    sportType: 'Cricket',
    surfaceType: 'Grass Court',
    description: 'Full-size cricket ground with practice nets',
    location: {
      address: '789 Sports Village',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    pricing: {
      basePrice: 2000,
      peakHourPrice: 3000,
      weekendPrice: 2500,
      currency: 'INR',
      hourlyRate: true
    },
    amenities: ['Parking', 'Shower', 'Changing Room', 'WiFi', 'Equipment Rental', 'Spectator Seating'],
    capacity: { minPlayers: 11, maxPlayers: 22 },
    dimensions: { length: 150, width: 150, unit: 'meters' },
    lighting: { available: true, type: 'LED', additionalCost: 500 },
    equipment: { provided: true, items: ['Bats', 'Balls', 'Stumps'], rentalCost: 200 },
    availability: { isAvailable: true, maintenanceMode: false },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    rules: ['Cricket gear required', 'Team booking preferred'],
    status: 'active',
    approvalStatus: 'approved',
    ratings: {
      average: 4.2,
      totalReviews: 32,
      reviews: []
    },
    statistics: {
      totalBookings: 45,
      totalRevenue: 90000,
      averageBookingDuration: 4.0,
      peakHours: ['16:00', '17:00', '18:00'],
      popularDays: ['Saturday', 'Sunday']
    }
  },
  {
    name: 'Basketball Arena',
    sportType: 'Basketball',
    surfaceType: 'Wooden',
    description: 'Indoor basketball court with professional flooring',
    location: {
      address: '321 Sports Complex',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    pricing: {
      basePrice: 600,
      peakHourPrice: 900,
      weekendPrice: 750,
      currency: 'INR',
      hourlyRate: true
    },
    amenities: ['Parking', 'Shower', 'Changing Room', 'WiFi', 'Air Conditioning'],
    capacity: { minPlayers: 6, maxPlayers: 12 },
    dimensions: { length: 28, width: 15, unit: 'meters' },
    lighting: { available: true, type: 'LED', additionalCost: 150 },
    equipment: { provided: true, items: ['Basketballs'], rentalCost: 50 },
    availability: { isAvailable: true, maintenanceMode: false },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '22:00', closed: false },
      sunday: { open: '06:00', close: '22:00', closed: false }
    },
    rules: ['Sports shoes required', 'Maximum 12 players'],
    status: 'active',
    approvalStatus: 'approved',
    ratings: {
      average: 4.6,
      totalReviews: 28,
      reviews: []
    },
    statistics: {
      totalBookings: 120,
      totalRevenue: 72000,
      averageBookingDuration: 2.0,
      peakHours: ['18:00', '19:00', '20:00'],
      popularDays: ['Friday', 'Saturday']
    }
  }
];

// Generate sample bookings
const generateBookings = (users, courts) => {
  const bookings = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'failed'];
  
  // Generate bookings for the last 30 days
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const court = courts[Math.floor(Math.random() * courts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    // Random date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Random time slots
    const startHour = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
    const duration = 1 + Math.floor(Math.random() * 3); // 1-3 hours
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endTime = `${(startHour + duration).toString().padStart(2, '0')}:00`;
    
    // Calculate amount based on court pricing
    let amount = court.pricing.basePrice * duration;
    if (date.getDay() === 0 || date.getDay() === 6) {
      amount = (court.pricing.weekendPrice || court.pricing.basePrice) * duration;
    } else if (startHour >= 18 && startHour <= 22) {
      amount = (court.pricing.peakHourPrice || court.pricing.basePrice) * duration;
    }
    
    bookings.push({
      user: user._id,
      court: court._id,
      owner: court.owner,
      date: date,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      totalAmount: amount,
      status: status,
      paymentStatus: paymentStatus,
      players: {
        count: Math.floor(Math.random() * (court.capacity.maxPlayers - court.capacity.minPlayers + 1)) + court.capacity.minPlayers,
        names: []
      },
      additionalServices: {
        equipment: Math.random() > 0.5,
        lighting: Math.random() > 0.7,
        coaching: Math.random() > 0.8,
        cleaning: Math.random() > 0.9
      },
      additionalCosts: {
        equipment: Math.random() > 0.5 ? court.equipment.rentalCost || 0 : 0,
        lighting: Math.random() > 0.7 ? court.lighting.additionalCost || 0 : 0,
        coaching: Math.random() > 0.8 ? 500 : 0,
        cleaning: Math.random() > 0.9 ? 200 : 0
      },
      createdAt: new Date(date.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  
  return bookings;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({ role: { $ne: 'Admin' } });
    await Court.deleteMany({});
    await Booking.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create courts (assign to first user as owner)
    const courtOwner = createdUsers[0];
    const courtsWithOwner = sampleCourts.map(court => ({
      ...court,
      owner: courtOwner._id
    }));
    
    const createdCourts = await Court.create(courtsWithOwner);
    console.log(`Created ${createdCourts.length} courts`);
    
    // Generate and create bookings
    const sampleBookings = generateBookings(createdUsers, createdCourts);
    const createdBookings = await Booking.create(sampleBookings);
    console.log(`Created ${createdBookings.length} bookings`);
    
    // Update court statistics based on actual bookings
    for (const court of createdCourts) {
      const courtBookings = createdBookings.filter(b => b.court.toString() === court._id.toString());
      const totalRevenue = courtBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalBookings = courtBookings.length;
      const averageDuration = courtBookings.length > 0 ? 
        courtBookings.reduce((sum, b) => sum + b.duration, 0) / courtBookings.length : 0;
      
      await Court.findByIdAndUpdate(court._id, {
        'statistics.totalBookings': totalBookings,
        'statistics.totalRevenue': totalRevenue,
        'statistics.averageBookingDuration': averageDuration
      });
    }
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdCourts.length} courts`);
    console.log(`- ${createdBookings.length} bookings`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
