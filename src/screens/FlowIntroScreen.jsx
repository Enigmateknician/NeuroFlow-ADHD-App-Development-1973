import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { FiZap, FiDroplet, FiFilter, FiPlay, FiCheckCircle, FiArrowRight, FiUsers, FiX, FiHelpCircle } from 'react-icons/fi';

const FlowIntroScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const steps = [
    {
      icon: FiZap,
      title: "Capture Sparks",
      description: "ADHD brains are idea factories. We help you catch those sparks before they slip away, so you never lose a valuable thought.",
      color: "purple"
    },
    {
      icon: FiFilter,
      title: "Find Focus",
      description: "When everything feels important, nothing is. We help you filter the noise to find what truly matters right now.",
      color: "blue"
    },
    {
      icon: FiPlay,
      title: "Take Action",
      description: "Break down overwhelming tasks into small, dopamine-friendly steps that build momentum naturally.",
      color: "green"
    },
    {
      icon: FiCheckCircle,
      title: "Build Trust",
      description: "See your progress and celebrate small wins. Every completed action builds self-trust—the foundation of ADHD success.",
      color: "indigo"
    },
    {
      icon: FiUsers,
      title: "Your Circle",
      description: "ADHD can lead to isolation. We help you stay connected to your support network, even when life gets chaotic.",
      color: "pink"
    }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/circle-intro');
    }
  };

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  const openInfoModal = () => setShowInfoModal(true);
  const closeInfoModal = () => setShowInfoModal(false);

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo and tagline */}
      <motion.div 
        className="mb-4 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center">
          <SafeIcon icon={FiZap} className="text-purple-600 mr-2 text-3xl" />
          <SafeIcon icon={FiDroplet} className="text-blue-600 text-3xl" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 mt-2">Small sparks. Big flow.</h2>
      </motion.div>
      
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <h3 className="text-lg font-medium text-purple-800">How Sparqio Works</h3>
        <motion.button
          onClick={openInfoModal}
          className="p-2 rounded-full hover:bg-purple-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiHelpCircle} className="text-purple-600" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div 
            className="h-1.5 rounded-full bg-blue-600" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <motion.div 
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        key={`container-${currentStep}`}
      >
        <motion.div 
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-${currentStepData.color}-100`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`icon-${currentStep}`}
        >
          <SafeIcon icon={currentStepData.icon} className={`w-10 h-10 text-${currentStepData.color}-600`} />
        </motion.div>

        <motion.h1 
          className="text-2xl font-bold text-gray-800 mb-4"
          key={`title-${currentStep}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {currentStepData.title}
        </motion.h1>

        <motion.p 
          className="text-gray-600 mb-8"
          key={`desc-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {currentStepData.description}
        </motion.p>

        <motion.button 
          onClick={handleNextStep}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all flex justify-center items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentStep < steps.length - 1 ? (
            <>Continue</>
          ) : (
            <>
              Meet Your Circle <SafeIcon icon={FiArrowRight} className="ml-2" />
            </>
          )}
        </motion.button>
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <SafeIcon icon={FiDroplet} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Finding Your Flow</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              ADHD brains struggle with traditional productivity approaches that rely on willpower and consistency.
            </p>
            
            <p className="text-gray-700 mb-4">
              Sparqio is designed specifically for how ADHD brains actually work:
            </p>
            
            <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
              <li>Works with your natural energy cycles instead of fighting them</li>
              <li>Leverages hyperfocus rather than forcing sustained attention</li>
              <li>Creates dopamine rewards that build momentum</li>
              <li>Provides external structure to compensate for executive function challenges</li>
              <li>Reduces shame by celebrating small wins</li>
            </ul>
            
            <div className="flex justify-center">
              <motion.button
                className="py-2 px-6 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all"
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

export default FlowIntroScreen;