/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';

// Public Pages
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import BookingSuccessPage from './pages/public/BookingSuccessPage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import OverviewPage from './pages/admin/OverviewPage';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import ServicesPage from './pages/admin/ServicesPage';
import HoursPage from './pages/admin/HoursPage';
import BlockedDatesPage from './pages/admin/BlockedDatesPage';
import SettingsPage from './pages/admin/SettingsPage';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spa-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spa-olive"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // They are authenticated but not an admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spa-bg p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-spa-cream max-w-md w-full">
          <h2 className="text-xl text-spa-charcoal mb-4">Access Denied</h2>
          <p className="text-spa-text-light mb-6">You are signed in, but you are not authorized as an admin.</p>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full bg-spa-sage text-white py-3 rounded-lg hover:bg-spa-olive transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/book/success" element={<BookingSuccessPage />} />
          </Route>
          
          {/* Admin Auth */}
          <Route path="/admin/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="hours" element={<HoursPage />} />
            <Route path="blocked-dates" element={<BlockedDatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
