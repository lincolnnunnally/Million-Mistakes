import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './lib/context';
import { Toaster } from './components/ui/sonner';
import { Flame, Home, Trophy, BookOpen, TrendingUp, Shield } from 'lucide-react';
import './App.css';

// Pages
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ReflectionPage from './pages/ReflectionPage';
import VaultPage from './pages/VaultPage';
import MantrasPage from './pages/MantrasPage';
import ProgressPage from './pages/ProgressPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, requireAdmin = false, requireOnboarded = false }) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Flame className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/home" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;

  return children;
}

function BottomNav() {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show nav on welcome, auth, onboarding, admin pages
  const hideNavPaths = ['/', '/login', '/register', '/onboarding', '/admin'];
  if (!user || !user.onboarded || hideNavPaths.includes(location.pathname) || user.role === 'admin') {
    return null;
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/vault', icon: Trophy, label: 'Vault' },
    { path: '/mantras', icon: BookOpen, label: 'Mantras' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' }
  ];

  return (
    <div className="bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-[hsl(18,92%,52%)]'
                  : 'text-[hsl(22,12%,40%)] hover:text-[hsl(18,92%,52%)]'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={
          <ProtectedRoute><OnboardingPage /></ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute requireOnboarded><HomePage /></ProtectedRoute>
        } />
        <Route path="/reflect" element={
          <ProtectedRoute requireOnboarded><ReflectionPage /></ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute requireOnboarded><VaultPage /></ProtectedRoute>
        } />
        <Route path="/mantras" element={
          <ProtectedRoute requireOnboarded><MantrasPage /></ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute requireOnboarded><ProgressPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
        <Toaster richColors position="top-center" />
      </AppProvider>
    </Router>
  );
}

export default App;
