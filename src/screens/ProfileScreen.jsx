import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import EchoesSettings from '../components/EchoesSettings';
import EchoesFeed from '../components/EchoesFeed';
import { 
  FiUser, FiSettings, FiLogOut, 
  FiLoader, FiEdit2, FiArrowLeft,
  FiChevronRight, FiMail
} from 'react-icons/fi';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'settings', 'echoes'

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          
          // Load user profile data
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (error) throw error;
          setProfile(data);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderProfileContent = () => (
    <div>
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <SafeIcon icon={FiUser} className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-800">
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </h3>
            <p className="text-gray-500 text-sm flex items-center">
              <SafeIcon icon={FiMail} className="mr-1" />
              {user?.email}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={() => navigate('/edit-profile')} // Create this route if needed
          className="w-full py-2 px-4 border border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-all flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiEdit2} className="mr-2" />
          Edit Profile
        </motion.button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Quick Actions</h3>
        
        <div className="space-y-2">
          <motion.button
            onClick={() => navigate('/circle-setup')}
            className="w-full py-3 px-4 flex items-center justify-between text-left border-b border-gray-100"
            whileHover={{ x: 4 }}
          >
            <span className="text-gray-700">Manage Your Circle</span>
            <SafeIcon icon={FiChevronRight} className="text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/dream-setup')}
            className="w-full py-3 px-4 flex items-center justify-between text-left border-b border-gray-100"
            whileHover={{ x: 4 }}
          >
            <span className="text-gray-700">Update Your Dream</span>
            <SafeIcon icon={FiChevronRight} className="text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('settings')}
            className="w-full py-3 px-4 flex items-center justify-between text-left"
            whileHover={{ x: 4 }}
          >
            <span className="text-gray-700">Settings</span>
            <SafeIcon icon={FiChevronRight} className="text-gray-400" />
          </motion.button>
        </div>
      </div>
      
      {/* Compact version of Echoes for the profile tab */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-800">Recent Echoes</h3>
          <motion.button
            onClick={() => setActiveTab('echoes')}
            className="text-purple-600 text-sm hover:text-purple-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
          </motion.button>
        </div>
        
        <EchoesFeed limit={3} compact={true} />
      </div>
      
      <motion.button
        onClick={handleSignOut}
        className="w-full py-3 px-4 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <SafeIcon icon={FiLogOut} className="mr-2" />
        Sign Out
      </motion.button>
    </div>
  );

  const renderSettingsContent = () => (
    <div>
      <motion.button
        onClick={() => setActiveTab('profile')}
        className="mb-4 py-2 px-4 text-purple-600 hover:text-purple-800 transition-colors flex items-center"
        whileHover={{ x: -4 }}
      >
        <SafeIcon icon={FiArrowLeft} className="mr-2" />
        Back to Profile
      </motion.button>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
      
      <EchoesSettings />
      
      {/* Add other settings sections here */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Notification Preferences</h3>
        <p className="text-gray-500 text-sm">
          Coming soon: Customize how and when you receive notifications.
        </p>
      </div>
    </div>
  );

  const renderEchoesContent = () => (
    <div>
      <motion.button
        onClick={() => setActiveTab('profile')}
        className="mb-4 py-2 px-4 text-purple-600 hover:text-purple-800 transition-colors flex items-center"
        whileHover={{ x: -4 }}
      >
        <SafeIcon icon={FiArrowLeft} className="mr-2" />
        Back to Profile
      </motion.button>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Self-Trust Echoes</h2>
      
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <p className="text-gray-600 mb-4">
          Echoes highlight your consistent actions, helping build self-trust over time. 
          They're automatically created when you interact with the app.
        </p>
        
        <EchoesFeed limit={10} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-blue-50 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          {activeTab === 'profile' ? 'Your Profile' : 
           activeTab === 'settings' ? 'Settings' : 
           'Self-Trust Echoes'}
        </h1>
        
        {activeTab === 'profile' && renderProfileContent()}
        {activeTab === 'settings' && renderSettingsContent()}
        {activeTab === 'echoes' && renderEchoesContent()}
      </div>
    </motion.div>
  );
};

export default ProfileScreen;