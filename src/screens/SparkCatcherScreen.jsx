import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiZap, FiSend, FiLoader, FiArrowRight, FiCheck, FiList, FiHelpCircle, FiX, FiCpu } from 'react-icons/fi';
import { trackSparkCreated } from '../lib/analytics';

const SparkCatcherScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sparkText, setSparkText] = useState('');
  const [sparks, setSparks] = useState([]);
  const [showTip, setShowTip] = useState(true);
  const [sparkSaved, setSparkSaved] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Ensure all tables exist
        try {
          await supabase.rpc('create_all_tables_if_not_exists');
          console.log("Ensured all required tables exist");
        } catch (rpcError) {
          console.error("Error creating tables:", rpcError);
          // Continue anyway - tables might already exist
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          // Try to fetch recent sparks
          try {
            const { data, error } = await supabase
              .from('sparks')
              .select('*')
              .eq('user_id', authUser.id)
              .order('created_at', { ascending: false })
              .limit(3);

            if (!error && data) {
              setSparks(data);
            }
          } catch (error) {
            console.error('Error fetching sparks:', error);
            // Continue even if sparks table doesn't exist yet
          }
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

  const handleSaveSpark = async () => {
    if (!sparkText.trim()) return;
    setLoading(true);
    try {
      // Try to create the sparks table if it doesn't exist
      try {
        await supabase.rpc('create_sparks_table_if_not_exists');
      } catch (error) {
        console.error('Error checking/creating sparks table:', error);
        // Continue anyway, table might already exist
      }

      // Save the spark
      const { data, error } = await supabase
        .from('sparks')
        .insert([{
          user_id: user.id,
          content: sparkText.trim(),
          status: 'new'
        }])
        .select();

      if (error) throw error;

      // Track the event
      trackSparkCreated({
        content_length: sparkText.length,
        type: 'manual_entry'
      });

      // Add to local state
      if (data && data.length > 0) {
        setSparks([data[0], ...sparks.slice(0, 2)]);
      }

      // Show success animation
      setSparkSaved(true);
      setTimeout(() => {
        setSparkSaved(false);
        setSparkText('');
      }, 1500);
    } catch (error) {
      console.error('Error saving spark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/flow-intro');
  };
  
  const openInfoModal = () => setShowInfoModal(true);
  const closeInfoModal = () => setShowInfoModal(false);

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-purple-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="w-full max-w-md flex flex-col"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-2">
          <motion.h1 
            className="text-2xl font-bold text-purple-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Catch a Spark
          </motion.h1>
          
          <motion.button
            onClick={openInfoModal}
            className="p-2 rounded-full hover:bg-purple-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiHelpCircle} className="text-purple-600" />
          </motion.button>
        </div>
        
        <motion.p 
          className="text-sm text-purple-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          ADHD brains are idea factories, but thoughts often disappear before you can act on them.
        </motion.p>

        {/* Tip Card */}
        <AnimatePresence>
          {showTip && (
            <motion.div 
              className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <div className="flex items-start">
                <SafeIcon icon={FiCpu} className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-yellow-800 text-sm">
                    What's on your mind right now? A task, worry, or idea? Get it out of your head before it disappears. Don't organize yet—just capture.
                  </p>
                </div>
                <button 
                  onClick={() => setShowTip(false)} 
                  className="text-yellow-500 hover:text-yellow-700 ml-2"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <SafeIcon icon={FiZap} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-800">New Spark</h2>
          </div>

          <div className="relative">
            <textarea 
              value={sparkText} 
              onChange={(e) => setSparkText(e.target.value)}
              placeholder="I need to... I'm worried about... I want to try..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
              disabled={loading || sparkSaved}
            />

            <AnimatePresence>
              {sparkSaved && (
                <motion.div 
                  className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="bg-green-100 rounded-full p-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <SafeIcon icon={FiCheck} className="text-green-600 text-xl" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end mt-3">
            <motion.button 
              onClick={handleSaveSpark}
              disabled={loading || !sparkText.trim() || sparkSaved}
              className={`py-2 px-4 rounded-lg font-medium shadow-sm flex items-center ${
                sparkText.trim() ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-500'
              }`}
              whileHover={{ scale: sparkText.trim() && !loading ? 1.02 : 1 }}
              whileTap={{ scale: sparkText.trim() && !loading ? 0.98 : 1 }}
            >
              {loading ? (
                <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
              ) : (
                <SafeIcon icon={FiSend} className="mr-2" />
              )}
              Save Spark
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Sparks */}
        {sparks.length > 0 && (
          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <SafeIcon icon={FiList} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-800">Recent Sparks</h2>
            </div>

            <div className="space-y-2">
              {sparks.map((spark) => (
                <motion.div 
                  key={spark.id}
                  className="p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-gray-700">{spark.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button 
          onClick={handleContinue}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all flex justify-center items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Flow <SafeIcon icon={FiArrowRight} className="ml-2" />
        </motion.button>

        <motion.p 
          className="text-sm text-center text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          You can always come back to capture more sparks later.
        </motion.p>
      </motion.div>
      
      {/* Info Modal */}
      {showInfoModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeInfoModal}
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
            
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <SafeIcon icon={FiZap} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Why Catch Sparks?</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              ADHD brains are constantly generating ideas, thoughts, and worries that disappear as quickly as they appear.
            </p>
            
            <p className="text-gray-700 mb-4">
              The Spark Catcher gives you a frictionless way to:
            </p>
            
            <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
              <li>Capture fleeting thoughts before they vanish</li>
              <li>Free up mental space by getting ideas out of your head</li>
              <li>Reduce anxiety about forgetting important things</li>
              <li>Create a collection of ideas you can organize later</li>
            </ul>
            
            <div className="flex justify-center">
              <motion.button
                className="py-2 px-6 bg-purple-600 text-white rounded-full font-medium shadow-md hover:bg-purple-700 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeInfoModal}
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SparkCatcherScreen;