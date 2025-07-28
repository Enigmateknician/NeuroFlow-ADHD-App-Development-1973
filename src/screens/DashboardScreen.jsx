import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import EchoesFeed from '../components/EchoesFeed';
import FeedbackButton from '../components/FeedbackButton';
import { FiUser, FiUsers, FiMessageCircle, FiLoader, FiArrowRight, FiEdit3, FiStar, FiAlertCircle } from 'react-icons/fi';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [circleStats, setCircleStats] = useState({ total: 0, connected: 0 });
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/');
          return;
        }
        setUser(authUser);

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Load circle stats
        const { data: circleData, error: circleError } = await supabase
          .from('relationships_7fb42a5e9d')
          .select('id')
          .eq('user_id', authUser.id);

        if (circleError) throw circleError;

        // Get current date minus 3 days for "recent" connections
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Get recent check-ins
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('circle_checkins_8f3d72c1e4')
          .select('*, relationships_7fb42a5e9d(name, relationship_type)')
          .eq('user_id', authUser.id)
          .gte('created_at', threeDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (checkInsError) throw checkInsError;

        // Calculate stats
        const totalPeople = circleData?.length || 0;
        const connectedPeopleIds = [...new Set(checkInsData?.map(c => c.relationship_id) || [])];
        const recentlyConnected = connectedPeopleIds.length;

        setCircleStats({
          total: totalPeople,
          connected: recentlyConnected
        });

        setRecentCheckIns(checkInsData || []);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleDailyPing = () => {
    navigate('/daily-ping');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-purple-50 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            {userProfile?.display_name ? `Hi, ${userProfile.display_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <motion.button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiUser} className="text-blue-600" />
          </motion.button>
        </div>

        {/* Daily connection prompt */}
        <motion.div
          className="bg-white rounded-lg shadow-md border border-blue-100 p-5 mb-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-blue-800">Daily Connection</h2>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {circleStats.connected}/{circleStats.total} Connected
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            {circleStats.connected === 0
              ? "You haven't connected with anyone in your circle recently."
              : `You've connected with ${circleStats.connected} people in your circle recently.`}
          </p>
          <motion.button
            onClick={handleDailyPing}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiMessageCircle} className="mr-2" />
            Connect with Your Circle
          </motion.button>
        </motion.div>

        {/* Dream reminder */}
        {userProfile?.dream_text && (
          <motion.div
            className="bg-white rounded-lg shadow-md border border-purple-100 p-5 mb-6"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-start mb-3">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <SafeIcon icon={FiStar} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-purple-800 mb-1">Your Dream</h2>
                <p className="text-gray-700">{userProfile.dream_text}</p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/dream-setup')}
              className="w-full py-2 text-purple-600 hover:text-purple-800 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiEdit3} className="mr-2" />
              Edit Your Dream
            </motion.button>
          </motion.div>
        )}

        {/* Circle management */}
        <motion.div
          className="bg-white rounded-lg shadow-md border border-green-100 p-5 mb-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center mb-3">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <SafeIcon icon={FiUsers} className="text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-green-800">Your Circle</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            {circleStats.total === 0
              ? "You haven't added anyone to your circle yet."
              : `You have ${circleStats.total} people in your circle.`}
          </p>
          <motion.button
            onClick={() => navigate('/circle-setup')}
            className="w-full py-2 px-4 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiUsers} className="mr-2" />
            Manage Your Circle
          </motion.button>
        </motion.div>

        {/* Echoes feed */}
        <motion.div
          className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <EchoesFeed limit={5} />
          <motion.button
            onClick={() => navigate('/profile')}
            className="mt-2 w-full py-2 text-purple-600 hover:text-purple-800 transition-colors flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View all echoes</span>
            <SafeIcon icon={FiArrowRight} className="ml-2" />
          </motion.button>
        </motion.div>
      </div>

      {/* Feedback button */}
      <FeedbackButton />
    </motion.div>
  );
};

export default DashboardScreen;