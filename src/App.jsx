import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthGateScreen from './screens/AuthGateScreen';
import DreamSetupScreen from './screens/DreamSetupScreen';
import CircleSetupScreen from './screens/CircleSetupScreen';
import DailyPingScreen from './screens/DailyPingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminRoute from './components/AdminRoute';
import supabase from './lib/supabase';
import { trackSessionStart } from './lib/analytics';
import './App.css';

// Protected Route component to handle authenticated routes
function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // Track session start if user is authenticated
      if (session) {
        trackSessionStart();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Track new session if user signs in
      if (session && _event === 'SIGNED_IN') {
        trackSessionStart();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/welcome" replace /> : <AuthGateScreen />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute session={session}>
              <WelcomeScreen onBegin={() => window.location.hash = '#/dream-setup'} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dream-setup"
          element={
            <ProtectedRoute session={session}>
              <DreamSetupScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circle-setup"
          element={
            <ProtectedRoute session={session}>
              <CircleSetupScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-ping"
          element={
            <ProtectedRoute session={session}>
              <DailyPingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute session={session}>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute session={session}>
              <AdminRoute>
                <AdminDashboardScreen />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;