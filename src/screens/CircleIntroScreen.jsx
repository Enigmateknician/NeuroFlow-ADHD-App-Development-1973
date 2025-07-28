import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { FiUsers, FiArrowRight, FiUserPlus, FiMessageCircle, FiHeart, FiHelpCircle, FiX } from 'react-icons/fi';

const CircleIntroScreen = () => {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const handleContinue = () => {
    navigate('/circle-setup');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  const openInfoModal = () => setShowInfoModal(true);
  const closeInfoModal = () => setShowInfoModal(false);

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-purple-50 to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <SafeIcon icon={FiUsers} className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-purple-800">Your Circle</h1>
          </motion.div>
          
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
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          ADHD brains tend to focus on what's new over what's important. Your Circle helps you maintain connections with people who matter most, even when life gets chaotic.
        </motion.p>

        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <SafeIcon icon={FiUserPlus} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Add key people</h3>
              <p className="text-sm text-gray-500">Start with 3-5 people who matter most to you</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <SafeIcon icon={FiMessageCircle} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Simple daily check-ins</h3>
              <p className="text-sm text-gray-500">Quick ways to stay connected, designed for ADHD brains</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <SafeIcon icon={FiHeart} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Prevent relationship drift</h3>
              <p className="text-sm text-gray-500">Combat isolation and strengthen important connections</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.button 
            onClick={handleContinue}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-full font-medium shadow-md hover:bg-purple-700 transition-all flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Set Up My Circle <SafeIcon icon={FiArrowRight} className="ml-2" />
          </motion.button>

          <motion.button 
            onClick={handleSkip}
            className="w-full py-2 px-4 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-all flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            I'll Do This Later
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.p 
        className="text-sm text-center text-purple-600 mt-6 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        You can always update your circle later from your dashboard.
      </motion.p>
      
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
                <SafeIcon icon={FiUsers} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Why Your Circle Matters</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              ADHD brains are naturally drawn to novelty and stimulation, which can lead to unintentional relationship neglect.
            </p>
            
            <p className="text-gray-700 mb-4">
              People we love often fade into the background—not because we don't care, but because our attention is constantly pulled elsewhere.
            </p>
            
            <p className="text-gray-700 mb-4">
              Your Circle helps by:
            </p>
            
            <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
              <li>Creating gentle reminders to maintain important relationships</li>
              <li>Making connection easier with friction-free check-ins</li>
              <li>Providing structure to combat social isolation</li>
              <li>Building relationship consistency that others can count on</li>
              <li>Tracking your relationship maintenance to build confidence</li>
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

export default CircleIntroScreen;