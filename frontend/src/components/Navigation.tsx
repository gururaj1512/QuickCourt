import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Wallet, 
  User, 
  Menu, 
  X, 
  LogOut,
  Settings,
  UserCircle
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import Button from './ui/Button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
  };



  return (
    <nav className="bg-qc-glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              className="w-8 h-8 bg-qc-primary rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white font-bold text-sm">QC</span>
            </motion.div>
            <span className="text-qc-text font-bold text-xl">QuickCourt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sport + location..."
                className="w-80 px-4 py-2 pl-10 bg-white/80 backdrop-blur-sm rounded-qc-radius border border-gray-200 focus:outline-none focus:ring-2 focus:ring-qc-accent/50"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center space-x-4">
              <motion.button 
                className="relative p-2 text-qc-text hover:text-qc-primary transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-qc-accent rounded-full"></span>
              </motion.button>

              <motion.button 
                className="flex items-center space-x-2 px-3 py-2 bg-white/80 rounded-qc-radius hover:bg-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4 text-qc-primary" />
                <span className="text-qc-text font-medium">₹250</span>
              </motion.button>

              {isAuthenticated ? (
                <div className="relative">
                  <motion.button 
                    className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-qc-radius shadow-qc-lg border border-gray-100 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-qc-text">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <UserCircle className="w-4 h-4 mr-2" />
                            Profile Settings
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-qc-text"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 border-t border-white/20"
            >
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sport + location..."
                    className="w-full px-4 py-2 pl-10 bg-white/80 backdrop-blur-sm rounded-qc-radius border border-gray-200 focus:outline-none focus:ring-2 focus:ring-qc-accent/50"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <motion.button 
                    className="relative p-2 text-qc-text"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-qc-accent rounded-full"></span>
                  </motion.button>
                  
                  <motion.button 
                    className="flex items-center space-x-2 px-3 py-2 bg-white/80 rounded-qc-radius"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wallet className="w-4 h-4 text-qc-primary" />
                    <span className="text-qc-text font-medium">₹250</span>
                  </motion.button>
                  
                  {isAuthenticated ? (
                    <motion.button 
                      className="w-8 h-8 bg-qc-primary rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </motion.button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link to="/login">
                        <Button variant="ghost" size="sm">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button variant="primary" size="sm">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
