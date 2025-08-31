import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { getCurrentUser } from './store/authSlice';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddCourtPage from './pages/AddCourtPage';
import CourtsPage from './pages/CourtsPage';
import UserBookingsPage from './pages/UserBookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function AppContent() {
  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-qc-bg">
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <RoleProtectedRoute allowedRoles={['User']} fallbackPath="/dashboard">
              <DashboardPage />
            </RoleProtectedRoute>
          } />
          
          <Route path="/owner/dashboard" element={
            <RoleProtectedRoute allowedRoles={['Owner']} fallbackPath="/owner/dashboard">
              <OwnerDashboardPage />
            </RoleProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <RoleProtectedRoute allowedRoles={['Admin']} fallbackPath="/admin/dashboard">
              <AdminDashboardPage />
            </RoleProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <UserBookingsPage />
            </ProtectedRoute>
          } />
          
          {/* Owner-specific Routes */}
          <Route path="/owner/add-court" element={
            <RoleProtectedRoute allowedRoles={['Owner']} fallbackPath="/owner/dashboard">
              <AddCourtPage />
            </RoleProtectedRoute>
          } />
          
          <Route path="/owner/bookings" element={
            <RoleProtectedRoute allowedRoles={['Owner']} fallbackPath="/owner/dashboard">
              <OwnerBookingsPage />
            </RoleProtectedRoute>
          } />
          
          {/* Admin-specific Routes */}
          <Route path="/admin" element={
            <RoleProtectedRoute allowedRoles={['Admin']} fallbackPath="/admin/dashboard">
              <AdminPanelPage />
            </RoleProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
