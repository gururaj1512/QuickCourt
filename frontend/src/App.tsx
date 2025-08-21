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
import AddCourtPage from './pages/AddCourtPage';
import CourtsPage from './pages/CourtsPage';
import UserBookingsPage from './pages/UserBookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProtectedRoute from './components/ProtectedRoute';

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
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
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
            <ProtectedRoute>
              <AddCourtPage />
            </ProtectedRoute>
          } />
          
          <Route path="/owner/bookings" element={
            <ProtectedRoute>
              <OwnerBookingsPage />
            </ProtectedRoute>
          } />
          
          {/* Admin-specific Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
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
