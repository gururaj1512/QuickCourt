import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Home,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Plus,
  Building,
  User,
  LogOut,
  Star,
  HelpCircle,
  Shield
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RootState } from '../store';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Common navigation items for all users
  const commonNavItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview and analytics'
    },
    {
      label: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Manage your account'
    }
  ];

  // User-specific navigation items (for regular users)
  const userNavItems = [
    {
      label: 'My Bookings',
      icon: Calendar,
      path: '/bookings',
      description: 'View and manage bookings'
    },
    {
      label: 'Find Courts',
      icon: MapPin,
      path: '/courts',
      description: 'Discover nearby courts'
    }
  ];

  // Owner-specific navigation items
  const ownerNavItems = [
    {
      label: 'My Courts',
      icon: Building,
      path: '/owner/courts',
      description: 'Manage your courts'
    },
    {
      label: 'Add Court',
      icon: Plus,
      path: '/owner/add-court',
      description: 'Create new court listing'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/owner/analytics',
      description: 'Performance insights'
    },
    {
      label: 'Bookings',
      icon: Calendar,
      path: '/owner/bookings',
      description: 'Court reservations'
    }
  ];

  // Admin-specific navigation items
  const adminNavItems = [
    {
      label: 'Admin Panel',
      icon: Shield,
      path: '/admin',
      description: 'Manage platform and approvals'
    },
    {
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      description: 'Manage all users'
    },
    {
      label: 'Court Approvals',
      icon: Shield,
      path: '/admin/approvals',
      description: 'Review court submissions'
    },
    {
      label: 'System Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      description: 'Platform statistics'
    }
  ];


  const getNavItems = () => {
    let items = [...commonNavItems];
    
    if (user?.role === 'User') {
      items = [...items, ...userNavItems];
    } else if (user?.role === 'Owner') {
      items = [...items, ...ownerNavItems];
    } else if (user?.role === 'Admin') {
      items = [...items, ...adminNavItems];
    }
    
    return items;
  };

  const NavItem = ({ item }: { item: { label: string; icon: LucideIcon; path: string; description: string } }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-4 py-3 rounded-qc-radius transition-all duration-300 group ${
        isActive(item.path)
          ? 'bg-qc-primary text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100 hover:text-qc-primary'
      }`}
    >
      <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-qc-primary'}`} />
      <div className="flex-1">
        <span className="font-medium">{item.label}</span>
        <p className={`text-xs ${isActive(item.path) ? 'text-white/80' : 'text-gray-500'}`}>
          {item.description}
        </p>
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: isDesktop ? 0 : -300 }}
        animate={{ x: isDesktop ? 0 : (isOpen ? 0 : -300) }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:block lg:opacity-100 lg:visible`}
      >
        <div className="flex flex-col h-full">

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-qc-primary rounded-full flex items-center justify-center">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-qc-text">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.role === 'Owner' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'Admin' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                  {user?.isVerified && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-qc-radius p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-qc-primary" />
                  <span className="text-xs text-gray-600">Bookings</span>
                </div>
                <p className="text-lg font-bold text-qc-text">12</p>
              </div>
              <div className="bg-gray-50 rounded-qc-radius p-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-qc-accent" />
                  <span className="text-xs text-gray-600">Rating</span>
                </div>
                <p className="text-lg font-bold text-qc-text">4.8</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Navigation</h3>
              <nav className="space-y-2">
                {getNavItems().map((item, index) => (
                  <NavItem key={index} item={item} />
                ))}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-3">
              <Link
                to="/help"
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-qc-radius transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help & Support</span>
              </Link>
              <button
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-qc-radius transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DashboardSidebar;
