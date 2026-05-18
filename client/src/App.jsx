import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Dashboard from './components/dashboard/Dashboard';
import EditorView from './components/editor/EditorView';
import ProfilePage from './components/profile/ProfilePage';
import PricingModal from './components/pricing/PricingModal';
import { useState } from 'react';

export default function App() {
  const { loading } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-surface-400 text-sm font-medium">Loading AI2Word...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      <Navbar onShowPricing={() => setShowPricing(true)} />

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard onShowPricing={() => setShowPricing(true)} /></ProtectedRoute>
          } />
          <Route path="/editor" element={
            <ProtectedRoute><EditorView /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  );
}
