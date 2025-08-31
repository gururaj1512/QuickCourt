import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  X, 
  AlertCircle,
  Users,
  Building,
  DollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Eye,
  Settings,
  Award,
  Clock
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

interface AdminStats {
  totalUsers: number;
  totalCourts: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeCourts: number;
  averageRating: number;
  userGrowth: number;
  courtGrowth: number;
  revenueGrowth: number;
}

interface Court {
  _id: string;
  name: string;
  sportType: string;
  location: {
    city: string;
    state: string;
  };
  owner: {
    name: string;
    email: string;
  };
  status: string;
  approvalStatus: string;
  createdAt: string;
  statistics: {
    totalBookings: number;
    totalRevenue: number;
  };
  ratings: {
    average: number;
    totalReviews: number;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

const AdminDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCourts, setPendingCourts] = useState<Court[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user, timeRange]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch pending courts
      const courtsResponse = await courtAPI.getCourtsForApproval();
      if (courtsResponse.success) {
        setPendingCourts(courtsResponse.courts as Court[] || []);
      }

      // Fetch admin statistics (we'll create this endpoint)
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        if (data.success) {
          setStats(data.stats);
        }
      }

      // Fetch recent users
      const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users?limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        if (data.success) {
          setRecentUsers(data.users || []);
        }
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCourt = async (courtId: string) => {
    try {
      const response = await courtAPI.approveRejectCourt(courtId, { 
        approvalStatus: 'approved',
        status: 'active'
      });
      
      if (response.success) {
        fetchAdminData();
      } else {
        alert(response.error || 'Failed to approve court');
      }
    } catch (error) {
      console.error('Error approving court:', error);
      alert('An error occurred while approving the court');
    }
  };

  const handleRejectCourt = async (courtId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await courtAPI.approveRejectCourt(courtId, { 
        approvalStatus: 'rejected',
        status: 'inactive',
        rejectionReason: reason
      });
      
      if (response.success) {
        fetchAdminData();
      } else {
        alert(response.error || 'Failed to reject court');
      }
    } catch (error) {
      console.error('Error rejecting court:', error);
      alert('An error occurred while rejecting the court');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Mock data for charts (replace with real data from API)
  const userGrowthData = [
    { month: 'Jan', users: 120, courts: 15 },
    { month: 'Feb', users: 150, courts: 18 },
    { month: 'Mar', users: 180, courts: 22 },
    { month: 'Apr', users: 220, courts: 25 },
    { month: 'May', users: 280, courts: 30 },
    { month: 'Jun', users: 320, courts: 35 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 61000 },
    { month: 'Apr', revenue: 68000 },
    { month: 'May', revenue: 75000 },
    { month: 'Jun', revenue: 82000 },
  ];

  const sportTypeData = [
    { name: 'Badminton', value: 35 },
    { name: 'Tennis', value: 25 },
    { name: 'Cricket', value: 20 },
    { name: 'Basketball', value: 15 },
    { name: 'Football', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-qc-text mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-qc-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-qc-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-qc-text">Loading admin dashboard...</span>
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
            <h1 className="text-lg font-semibold text-qc-text">Admin Dashboard</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-qc-text">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform overview and management</p>
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
              <Button variant="outline" onClick={fetchAdminData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={formatNumber(stats?.totalUsers || 320)}
                icon={Users}
                color="bg-blue-500"
                change={stats?.userGrowth || 15}
                subtitle="Registered users"
              />
              
              <StatCard
                title="Total Courts"
                value={formatNumber(stats?.totalCourts || 35)}
                icon={Building}
                color="bg-green-500"
                change={stats?.courtGrowth || 8}
                subtitle="Active courts"
              />
              
              <StatCard
                title="Pending Approvals"
                value={pendingCourts.length}
                icon={AlertCircle}
                color="bg-yellow-500"
                change={-2}
                subtitle="Courts awaiting approval"
              />
              
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats?.totalRevenue || 820000)}
                icon={DollarSign}
                color="bg-qc-accent"
                change={stats?.revenueGrowth || 22}
                subtitle="Platform revenue"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* User & Court Growth */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Platform Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="courts" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Courts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue Trend */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sport Type Distribution */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Courts by Sport Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sportTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sportTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Recent Activity */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">New user registered</p>
                      <p className="text-xs text-gray-500">John Doe joined the platform</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Building className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">Court approved</p>
                      <p className="text-xs text-gray-500">Tennis Paradise was approved</p>
                    </div>
                    <span className="text-xs text-gray-500">15 min ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">New court pending</p>
                      <p className="text-xs text-gray-500">Basketball Arena needs approval</p>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-qc-text">Revenue milestone</p>
                      <p className="text-xs text-gray-500">Platform reached ₹8L revenue</p>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pending Approvals Section */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-qc-text">Pending Court Approvals</h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {pendingCourts.length} pending
                </span>
              </div>

              {pendingCourts.length > 0 ? (
                <div className="space-y-4">
                  {pendingCourts.map((court) => (
                    <motion.div
                      key={court._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-qc-text mb-2">
                            {court.name}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Sport:</span> {court.sportType}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {court.location.city}, {court.location.state}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Owner:</span> {court.owner.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span> {court.owner.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Submitted:</span> {formatDate(court.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveCourt(court._id)}
                            className="flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectCourt(court._id)}
                            className="flex items-center text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-qc-text mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">No pending court approvals at the moment.</p>
                </div>
              )}
            </Card>

            {/* Recent Users & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-qc-text">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Owner' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <h3 className="text-lg font-semibold text-qc-text mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/users'}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/courts'}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    View All Courts
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/bookings'}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Bookings
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/settings'}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Platform Settings
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
