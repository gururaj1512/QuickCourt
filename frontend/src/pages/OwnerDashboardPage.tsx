import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  DollarSign,
  Building,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  BookOpen,
  Award,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { RootState } from '../store';
import DashboardSidebar from '../components/DashboardSidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { courtAPI } from '../services/courtAPI';
import { bookingAPI } from '../services/bookingAPI';

interface DashboardStats {
  totalCourts: number;
  activeCourts: number;
  pendingApproval: number;
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  recentCourts: number;
  sportTypeStats: Record<string, number>;
  statusStats: Record<string, number>;
  topCourts: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
    rating: number;
  }>;
}

interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  paidBookings: number;
  pendingPayments: number;
  failedPayments: number;
  sportTypeStats: Record<string, number>;
  dailyStats: Record<string, number>;
  hourStats: Record<string, number>;
  recentBookings: any[];
  period: number;
}

interface Court {
  _id: string;
  name: string;
  sportType: string;
  status: string;
  approvalStatus: string;
  statistics: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingDuration: number;
  };
  ratings: {
    average: number;
    totalReviews: number;
  };
}

const OwnerDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch court statistics
      const courtStatsResponse = await courtAPI.getCourtStatistics({ period: timeRange });
      if (courtStatsResponse.success) {
        setStats(courtStatsResponse.statistics);
      }

      // Fetch booking analytics
      const bookingResponse = await bookingAPI.getBookingAnalytics({ period: timeRange, type: 'owner' });
      if (bookingResponse.success) {
        setBookingAnalytics(bookingResponse.analytics);
      }

      // Fetch owner's courts
      const courtsResponse = await courtAPI.getCourtsByOwner();
      if (courtsResponse.success) {
        setCourts(courtsResponse.courts || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    change?: number; 
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-qc-text">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}% from last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color }: { 
    title: string; 
    description: string; 
    icon: any; 
    action: () => void; 
    color: string; 
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card>
        <div className="text-center cursor-pointer" onClick={action}>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-qc-text mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <Button variant="primary" size="sm">
            Get Started
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Prepare chart data
  const revenueChartData = bookingAnalytics?.dailyStats ? 
    Object.entries(bookingAnalytics.dailyStats).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: value * 1000, // Assuming average booking value
      bookings: value
    })).slice(-7) : [];

  const sportTypeChartData = stats?.sportTypeStats ? 
    Object.entries(stats.sportTypeStats).map(([sport, count]) => ({
      name: sport,
      value: count
    })) : [];

  const hourChartData = bookingAnalytics?.hourStats ? 
    Object.entries(bookingAnalytics.hourStats).map(([hour, count]) => ({
      hour: `${hour}:00`,
      bookings: count
    })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading dashboard...</span>
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
            <h1 className="text-lg font-semibold text-qc-text">Owner Dashboard</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Owner Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your court performance and revenue</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qc-primary"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Court
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats?.totalRevenue || 0)}
                icon={DollarSign}
                color="bg-green-500"
                change={15}
                subtitle={`${formatNumber(stats?.totalBookings || 0)} bookings`}
              />
              <StatCard
                title="Active Courts"
                value={stats?.activeCourts || 0}
                icon={Building}
                color="bg-qc-accent"
                change={8}
                subtitle={`${stats?.totalCourts || 0} total courts`}
              />
              <StatCard
                title="Average Rating"
                value={(stats?.averageRating || 0).toFixed(1)}
                icon={Star}
                color="bg-qc-lilac"
                change={5}
                subtitle="Based on reviews"
              />
              <StatCard
                title="Pending Approvals"
                value={stats?.pendingApproval || 0}
                icon={Clock}
                color="bg-yellow-500"
                change={-2}
                subtitle="Courts awaiting approval"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Trend */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Sport Type Distribution */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Courts by Sport Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sportTypeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sportTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Peak Hours */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Peak Booking Hours</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Top Performing Courts */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Top Performing Courts</h3>
                <div className="space-y-4">
                  {stats?.topCourts?.slice(0, 5).map((court, index) => (
                    <div key={court.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-qc-text">{court.name}</p>
                          <p className="text-sm text-gray-500">{court.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(court.revenue)}</p>
                        <p className="text-sm text-gray-500">⭐ {court.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <QuickActionCard
                title="Add New Court"
                description="Create a new court listing to attract more players"
                icon={Plus}
                color="bg-qc-accent"
                action={() => window.location.href = '/owner/add-court'}
              />
              <QuickActionCard
                title="View Bookings"
                description="Manage and track all your court bookings"
                icon={BookOpen}
                color="bg-qc-primary"
                action={() => window.location.href = '/owner/bookings'}
              />
              <QuickActionCard
                title="Analytics"
                description="Detailed insights and performance metrics"
                icon={BarChart3}
                color="bg-green-500"
                action={() => window.location.href = '/owner/analytics'}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {bookingAnalytics?.recentBookings?.slice(0, 5).map((booking, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-qc-text">{booking.courtName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(booking.totalAmount)}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Court Status */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Court Status Overview</h3>
                <div className="space-y-4">
                  {courts.map((court) => (
                    <div key={court._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-qc-text">{court.name}</p>
                        <p className="text-sm text-gray-500">{court.sportType}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          court.status === 'active' ? 'bg-green-100 text-green-800' :
                          court.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {court.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCurrency(court.statistics.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;

