import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthGateScreen from './screens/AuthGateScreen';
import DreamSetupScreen from './screens/DreamSetupScreen';
import CircleSetupScreen from './screens/CircleSetupScreen';
import DailyPingScreen from './screens/DailyPingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminRoute from './components/AdminRoute';
// New screens for revised onboarding
import CelebrationScreen from './screens/CelebrationScreen';
import SparkCatcherScreen from './screens/SparkCatcherScreen';
import FlowIntroScreen from './screens/FlowIntroScreen';
import CircleIntroScreen from './screens/CircleIntroScreen';
import supabase from './lib/supabase';
import { trackSessionStart } from './lib/analytics';
import './App.css';

// Auth handler component to process URL hash tokens and Supabase magic links
function AuthHandler() {
  const location = useLocation();

  useEffect(() => {
    // Handle URL hash for Supabase auth (magic link redirects)
    const handleAuthRedirect = async () => {
      // Check for magic link tokens in the URL
      // Supabase magic links add #access_token=... to the URL
      const hashParams = location.hash.substring(location.hash.indexOf('#') + 1);
      
      // Look for access_token in the URL
      if (hashParams.includes('access_token')) {
        try {
          // Extract the tokens from the URL
          const params = new URLSearchParams(hashParams);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const tokenType = params.get('token_type');
          
          if (accessToken) {
            console.log("Found auth tokens in URL, setting session...");
            // Set the session with the tokens
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
              token_type: tokenType || 'bearer',
            });
            
            // Clean up the URL by removing the hash params
            window.location.replace(window.location.pathname + window.location.search);
          }
        } catch (error) {
          console.error('Error handling authentication redirect:', error);
        }
      }
    };
    
    // Also look for Supabase magic link token in the URL query
    const handleMagicLink = async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      
      if (token && type === 'magiclink') {
        try {
          console.log("Found magic link token in URL, verifying...");
          // Process the magic link token
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'magiclink'
          });
          
          if (error) {
            console.error('Error verifying magic link:', error);
          }
        } catch (error) {
          console.error('Error processing magic link:', error);
        }
      }
    };
    
    // Run both handlers to catch either format
    handleAuthRedirect();
    handleMagicLink();
  }, [location]);
  
  return null;
}

// Protected Route component to handle authenticated routes
function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/" replace />;
  return children;
}

// Smart redirect component that determines where to send authenticated users
function SmartRedirect({ session }) {
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState('/welcome');

  useEffect(() => {
    const determineRedirectPath = async () => {
      if (!session?.user) {
        setRedirectPath('/welcome');
        setLoading(false);
        return;
      }

      try {
        console.log("Determining redirect path for user:", session.user.id);
        
        // First, ensure all tables exist
        try {
          await supabase.rpc('create_all_tables_if_not_exist');
          console.log("Ensured all tables exist");
        } catch (rpcError) {
          console.error("Error with RPC function:", rpcError);
          // Continue anyway - we'll handle individual table creation later
        }
        
        // Check if user exists in users table
        let userData = null;
        try {
          const { data: userCheckData, error: userCheckError } = await supabase
            .from('users')
            .select('id, dream_text, dream_image_url')
            .eq('id', session.user.id)
            .single();
          
          if (userCheckError && userCheckError.code === 'PGRST116') {
            // User doesn't exist, create them
            console.log("User doesn't exist in database, creating record");
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
              
            if (insertError) {
              console.error("Error creating user record:", insertError);
              // Even with error, continue to welcome screen
            }
            // New user, send to welcome
            setRedirectPath('/welcome');
          } else if (userCheckError) {
            // Other error checking user
            console.error("Error checking user record:", userCheckError);
            setRedirectPath('/welcome');
          } else {
            userData = userCheckData;
          }
        } catch (userTableError) {
          console.error("Error with users table:", userTableError);
          // If users table doesn't exist, default to welcome
          setRedirectPath('/welcome');
          setLoading(false);
          return;
        }

        // If we have user data, check their setup status
        if (userData) {
          if (!userData.dream_text && !userData.dream_image_url) {
            // User exists but hasn't set up their dream
            console.log("User has no dream set up, redirecting to welcome");
            setRedirectPath('/welcome');
          } else {
            // User has dream, check if they have a circle
            console.log("User has dream, checking circle");
            try {
              const { data: circleData, error: circleError } = await supabase
                .from('relationships_7fb42a5e9d')
                .select('id')
                .eq('user_id', session.user.id)
                .limit(1);

              if (circleError) {
                console.error("Error checking circle:", circleError);
                // If error checking circle, go to dashboard anyway
                setRedirectPath('/dashboard');
              } else if (!circleData || circleData.length === 0) {
                // User has dream but no circle
                console.log("User has no circle members, redirecting to circle intro");
                setRedirectPath('/circle-intro');
              } else {
                // User has both dream and circle
                console.log("User is fully set up, redirecting to dashboard");
                setRedirectPath('/dashboard');
              }
            } catch (circleError) {
              console.error("Error in circle check:", circleError);
              setRedirectPath('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error("Error in SmartRedirect:", error);
        setRedirectPath('/welcome');
      } finally {
        setLoading(false);
      }
    };

    determineRedirectPath();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={redirectPath} replace />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setAuthError(error);
        }
        
        setSession(data?.session);
        setLoading(false);
        
        // Track session start if user is authenticated
        if (data?.session) {
          trackSessionStart();
        }
      } catch (e) {
        console.error("Exception getting session:", e);
        setLoading(false);
        setAuthError(e);
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "User authenticated" : "No session");
      setSession(session);
      
      // Track new session if user signs in
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        trackSessionStart();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Loading Sparqio...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-pink-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700 mb-6">There was a problem connecting to the authentication service. Please try refreshing the page or contact support if the issue persists.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthHandler />
      <Routes>
        <Route path="/" element={session ? <SmartRedirect session={session} /> : <AuthGateScreen />} />
        <Route path="/welcome" element={
          <ProtectedRoute session={session}>
            <WelcomeScreen onBegin={() => window.location.hash='#/dream-setup'} />
          </ProtectedRoute>
        } />
        <Route path="/dream-setup" element={
          <ProtectedRoute session={session}>
            <DreamSetupScreen />
          </ProtectedRoute>
        } />
        {/* New Onboarding Flow Routes */}
        <Route path="/celebration" element={
          <ProtectedRoute session={session}>
            <CelebrationScreen />
          </ProtectedRoute>
        } />
        <Route path="/spark-catcher" element={
          <ProtectedRoute session={session}>
            <SparkCatcherScreen />
          </ProtectedRoute>
        } />
        <Route path="/flow-intro" element={
          <ProtectedRoute session={session}>
            <FlowIntroScreen />
          </ProtectedRoute>
        } />
        <Route path="/circle-intro" element={
          <ProtectedRoute session={session}>
            <CircleIntroScreen />
          </ProtectedRoute>
        } />
        {/* Original Routes */}
        <Route path="/circle-setup" element={
          <ProtectedRoute session={session}>
            <CircleSetupScreen />
          </ProtectedRoute>
        } />
        <Route path="/daily-ping" element={
          <ProtectedRoute session={session}>
            <DailyPingScreen />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute session={session}>
            <DashboardScreen />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute session={session}>
            <ProfileScreen />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute session={session}>
            <AdminRoute>
              <AdminDashboardScreen />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;