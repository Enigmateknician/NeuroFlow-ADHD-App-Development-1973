import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiLoader, FiShield, FiAlertCircle } from 'react-icons/fi';

/**
 * AdminRoute Component - Protects admin-only routes
 * Checks if the current user has admin role in Supabase
 */
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate('/');
          return;
        }

        setUser(authUser);

        // Check if user has admin role
        // First, check if there's a user_roles table or similar
        // If not, we'll check user metadata or a custom field
        try {
          // Option 1: Check user metadata
          const userRole = authUser.user_metadata?.role || authUser.app_metadata?.role;
          
          // Option 2: Check a custom users table field
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, is_admin')
            .eq('id', authUser.id)
            .single();

          const hasAdminRole = userRole === 'admin' || 
                              userData?.role === 'admin' || 
                              userData?.is_admin === true;

          if (hasAdminRole) {
            setIsAdmin(true);
          } else {
            // Not an admin, redirect after a brief delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }

        } catch (roleError) {
          console.error('Error checking admin role:', roleError);
          // If there's an error checking roles, assume not admin
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }

      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <motion.div 
          className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiShield} className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. This area is restricted to administrators only.
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
            <SafeIcon icon={FiAlertCircle} className="mr-2" />
            <span>Redirecting to dashboard...</span>
          </div>
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;