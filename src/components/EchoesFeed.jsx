import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { 
  FiMessageCircle, FiStar, FiHeart, 
  FiLoader, FiChevronRight, FiClock,
  FiSettings, FiRefreshCw
} from 'react-icons/fi';

/**
 * EchoesFeed Component
 * Displays a feed of automatically generated "echoes" that reinforce the user's positive actions
 */
const EchoesFeed = ({ limit = 7, compact = false }) => {
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Load user and echoes data
  useEffect(() => {
    const loadUserAndEchoes = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('User not authenticated');
        }
        setUser(authUser);

        // Check if echoes are enabled for this user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('echoes_enabled')
          .eq('id', authUser.id)
          .single();
        
        if (userError) throw userError;
        
        // If echoes are disabled, don't load any
        if (userData?.echoes_enabled === false) {
          setEchoes([]);
          return;
        }

        // Load echoes
        const { data, error } = await supabase
          .from('echoes_6e82a3a1')
          .select('*, relationships_7fb42a5e9d(name, relationship_type)')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(showAll ? 20 : limit);

        if (error) throw error;
        
        setEchoes(data || []);
      } catch (err) {
        console.error('Error loading echoes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndEchoes();
  }, [limit, showAll]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Check if it's within the last 7 days
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 7) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMMM d');
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Get icon based on echo source
  const getEchoIcon = (source) => {
    switch (source) {
      case 'checkin':
        return FiMessageCircle;
      case 'dream':
        return FiStar;
      case 'gratitude':
        return FiHeart;
      default:
        return FiMessageCircle;
    }
  };

  // Get color based on echo source
  const getEchoColor = (source) => {
    switch (source) {
      case 'checkin':
        return 'text-purple-600 bg-purple-100';
      case 'dream':
        return 'text-blue-600 bg-blue-100';
      case 'gratitude':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Toggle between showing limited and all echoes
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Re-trigger the effect to reload echoes
    setShowAll(showAll);
  };

  if (loading) {
    return (
      <div className={`w-full ${compact ? 'py-4' : 'py-8'} flex justify-center items-center`}>
        <SafeIcon icon={FiLoader} className="w-6 h-6 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${compact ? 'py-2' : 'py-4'} text-center text-red-500`}>
        <p>Failed to load echoes. Please try again later.</p>
      </div>
    );
  }

  if (echoes.length === 0) {
    return (
      <div className={`w-full ${compact ? 'py-4' : 'py-8'} text-center text-gray-500`}>
        <p>No echoes yet. Your actions will appear here as you use the app.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={`${compact ? 'text-md' : 'text-lg'} font-medium text-gray-700`}>
          Your Echoes
        </h3>
        <button
          onClick={handleRefresh}
          className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </button>
      </div>

      {/* Echoes list */}
      <div className="space-y-3">
        <AnimatePresence>
          {echoes.map((echo) => (
            <motion.div
              key={echo.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="flex items-start">
                <div className={`${getEchoColor(echo.source)} p-2 rounded-full mr-3 flex-shrink-0`}>
                  <SafeIcon icon={getEchoIcon(echo.source)} className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{echo.text}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <SafeIcon icon={FiClock} className="mr-1" />
                    <span>{formatDate(echo.created_at)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more/less button */}
      {!compact && (
        <motion.button
          onClick={toggleShowAll}
          className="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showAll ? (
            <>Show less</>
          ) : (
            <>Show more echoes <SafeIcon icon={FiChevronRight} className="ml-1" /></>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default EchoesFeed;