import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  DollarSign,
  Building,
  Plus,
  BarChart3,
  Clock
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RootState } from '../store';
import DashboardSidebar from '../components/DashboardSidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalCourts: 0,
    totalRevenue: 0,
    averageRating: 0,
    recentBookings: [],
    upcomingBookings: []
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      if (user?.role === 'Owner') {
        // Fetch owner-specific stats
        const response = await fetch(`${import.meta.env.VITE_API_URL}/courts/owner/statistics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.statistics);
          }
        }
      } else {
        // Fetch user-specific stats
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/analytics/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              totalBookings: data.analytics?.totalBookings || 0,
              totalCourts: 0, // Users don't have courts
              totalRevenue: data.analytics?.totalRevenue || 0,
              averageRating: data.analytics?.averageBookingValue || 0,
              recentBookings: data.analytics?.recentBookings || [],
              upcomingBookings: data.analytics?.upcomingBookings || []
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: { 
    title: string; 
    value: string | number; 
    icon: LucideIcon; 
    color: string; 
    change?: number; 
  }) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-qc-text">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color }: { 
    title: string; 
    description: string; 
    icon: LucideIcon; 
    action: () => void; 
    color: string; 
  }) => (
    <Card>
      <div className="text-center">
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-qc-text mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button onClick={action} variant="primary" size="sm">
          Get Started
        </Button>
      </div>
    </Card>
  );

  const RecentActivityCard = ({ title, activities }: { 
    title: string; 
    activities: Array<{ title: string; time: string; status: string }>; 
  }) => (
    <Card>
      <h3 className="text-lg font-semibold text-qc-text mb-4">{title}</h3>
      <div className="space-y-3">
        {activities.map((activity, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-qc-radius">
            <div className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-qc-text">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );

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
            <h1 className="text-lg font-semibold text-qc-text">Dashboard</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Welcome back, {user?.name}!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              {user?.role === 'Owner' && (
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Court
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                icon={Calendar}
                color="bg-qc-primary"
                change={15}
              />
              {user?.role === 'Owner' && (
                <StatCard
                  title="Total Courts"
                  value={stats.totalCourts}
                  icon={Building}
                  color="bg-qc-accent"
                  change={8}
                />
              )}
              <StatCard
                title={user?.role === 'Owner' ? "Total Revenue" : "Total Spent"}
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="bg-green-500"
                change={22}
              />
              <StatCard
                title="Average Rating"
                value={stats.averageRating.toFixed(1)}
                icon={Star}
                color="bg-qc-lilac"
                change={5}
              />
            </div>

            {/* Role-based Content */}
            {user?.role === 'Owner' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Owner-specific content */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <QuickActionCard
                      title="Add New Court"
                      description="Create a new court listing to attract more players"
                      icon={Plus}
                      color="bg-qc-accent"
                      action={() => window.location.href = '/owner/add-court'}
                    />
                    <QuickActionCard
                      title="View Analytics"
                      description="Track your court performance and revenue"
                      icon={BarChart3}
                      color="bg-qc-primary"
                      action={() => window.location.href = '/owner/analytics'}
                    />
                  </div>

                  <RecentActivityCard
                    title="Recent Bookings"
                    activities={[
                      { title: 'Badminton Court 1 - 2 hours', time: '2 hours ago', status: 'completed' },
                      { title: 'Tennis Court - 1 hour', time: '4 hours ago', status: 'pending' },
                      { title: 'Cricket Ground - 3 hours', time: '1 day ago', status: 'completed' },
                    ]}
                  />
                </div>

                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-qc-text mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Courts</span>
                        <span className="font-semibold text-qc-text">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending Approvals</span>
                        <span className="font-semibold text-yellow-600">1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">This Month Revenue</span>
                        <span className="font-semibold text-green-600">₹45,000</span>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-qc-text mb-4">Top Performing Courts</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Badminton Court 1', revenue: '₹15,000', bookings: 45 },
                        { name: 'Tennis Court', revenue: '₹12,000', bookings: 32 },
                        { name: 'Cricket Ground', revenue: '₹18,000', bookings: 28 },
                      ].map((court, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-qc-radius">
                          <div>
                            <p className="font-medium text-qc-text">{court.name}</p>
                            <p className="text-sm text-gray-500">{court.bookings} bookings</p>
                          </div>
                          <span className="font-semibold text-green-600">{court.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User-specific content */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <QuickActionCard
                      title="Book a Court"
                      description="Find and book your favorite sports courts"
                      icon={MapPin}
                      color="bg-qc-accent"
                      action={() => window.location.href = '/courts'}
                    />
                    <QuickActionCard
                      title="Find Players"
                      description="Connect with players of similar skill level"
                      icon={Users}
                      color="bg-qc-primary"
                      action={() => window.location.href = '/players'}
                    />
                  </div>

                  <RecentActivityCard
                    title="Recent Bookings"
                    activities={[
                      { title: 'Badminton Court - 2 hours', time: 'Yesterday', status: 'completed' },
                      { title: 'Tennis Court - 1 hour', time: '3 days ago', status: 'completed' },
                      { title: 'Cricket Ground - 3 hours', time: '1 week ago', status: 'completed' },
                    ]}
                  />
                </div>

                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-qc-text mb-4">Upcoming Bookings</h3>
                    <div className="space-y-3">
                      {[
                        { sport: 'Badminton', time: 'Today, 6:00 PM', court: 'Court 1' },
                        { sport: 'Tennis', time: 'Tomorrow, 4:00 PM', court: 'Center Court' },
                      ].map((booking, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-qc-radius">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-qc-text">{booking.sport}</p>
                            <p className="text-sm text-gray-600">{booking.court} • {booking.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-qc-text mb-4">Your Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Bookings</span>
                        <span className="font-semibold text-qc-text">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Favorite Sport</span>
                        <span className="font-semibold text-qc-text">Badminton</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Member Since</span>
                        <span className="font-semibold text-qc-text">3 months</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
