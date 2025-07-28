import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { FiX } from 'react-icons/fi';

const WelcomeScreen = ({ onBegin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 to-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="w-full max-w-md flex flex-col items-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-blue-800 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Welcome to NeuroFlow
        </motion.h1>
        
        <motion.p 
          className="text-lg text-blue-700 mb-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          This is your space to take back your day, your dreams, and your focus—one breath at a time.
        </motion.p>
        
        <motion.div 
          className="w-full flex flex-col gap-4 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            className="w-full max-w-xs py-3 px-6 bg-blue-600 text-white rounded-full font-medium text-lg shadow-md hover:bg-blue-700 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBegin}
          >
            Let's Begin
          </motion.button>
          
          <motion.button
            className="py-2 px-4 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
          >
            What is this?
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
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
              onClick={closeModal}
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-semibold text-blue-800 mb-4">About NeuroFlow</h2>
            
            <p className="text-gray-700 mb-6">
              NeuroFlow is built for ADHD entrepreneurs. It helps you collect your thoughts, 
              focus on your goals, and reconnect with what matters most—without stress or shame.
            </p>
            
            <div className="flex justify-center">
              <motion.button
                className="py-2 px-6 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeModal}
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

export default WelcomeScreen;