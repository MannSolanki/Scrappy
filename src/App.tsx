import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute, { getUserRole, isAuthenticated } from './components/ProtectedRoute';
import SupportChatWidget from './components/SupportChatWidget';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import Login from './pages/Login';
import PickupPartnerDashboard from './pages/PickupPartnerDashboard';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import './styles/ScrappyUI.css';

const getDefaultLoggedInRoute = () => {
  const role = getUserRole();
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'pickup_partner') return '/pickup-partner-dashboard';
  return '/home';
};

class AdminRouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep route alive and avoid full-blank render on admin page crashes.
    console.error('Admin dashboard render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <Navigate to="/home" replace />;
    }
    return this.props.children;
  }
}

const GuestOnlyRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? <Navigate to={getDefaultLoggedInRoute()} replace /> : children;
};

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.fade-on-scroll, .reveal-on-scroll'));
    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="site-shell">
      {!isAdminRoute && <Navbar />}
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated() ? getDefaultLoggedInRoute() : '/home'} replace />} />
          <Route
            path="/home"
            element={isAuthenticated() && getUserRole() !== 'user' ? <Navigate to={getDefaultLoggedInRoute()} replace /> : <Home />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
          <Route path="/signup" element={<GuestOnlyRoute><Signup /></GuestOnlyRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']} redirectTo={getDefaultLoggedInRoute()}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup-partner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['pickup_partner']} redirectTo="/home">
                <PickupPartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectTo="/home">
                <AdminRouteErrorBoundary>
                  <AdminDashboard />
                </AdminRouteErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="*" element={<Navigate to={getDefaultLoggedInRoute()} replace />} />
        </Routes>
      </main>
      <SupportChatWidget />
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
