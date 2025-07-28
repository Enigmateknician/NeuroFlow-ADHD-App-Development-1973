import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { FiArrowRight, FiZap, FiStar, FiDroplet, FiCheck } from 'react-icons/fi';

const CelebrationScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      icon: FiStar,
      title: "Dream captured!",
      description: "You've just planted a seed for your future by visualizing your dream. This visual anchor helps your ADHD brain stay connected to what matters most.",
      color: "blue"
    },
    {
      icon: FiZap,
      title: "Small sparks. Big flow.",
      description: "ADHD brains are full of ideas, but they often slip away. Next, we'll help you capture those sparks before they're gone.",
      color: "purple"
    },
    {
      icon: FiDroplet,
      title: "Find your flow",
      description: "Instead of drowning in overwhelm, you'll learn to build momentum through small, consistent actions that fit how your brain works.",
      color: "green"
    }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/spark-catcher');
    }
  };

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-8 flex items-center">
        {steps.map((_, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center ${index === currentStep ? `bg-${currentStepData.color}-500` : index < currentStep ? 'bg-gray-300' : 'bg-gray-200'}`}
            >
              {index < currentStep ? (
                <SafeIcon icon={FiCheck} className="text-white text-xs" />
              ) : index === currentStep ? (
                <span className="text-white text-xs">{index + 1}</span>
              ) : (
                <span className="text-gray-500 text-xs">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-1">
                <div className="bg-gray-200 h-full">
                  <motion.div 
                    className={index < currentStep ? `bg-${steps[index].color}-500 h-full` : "h-full"}
                    initial={{ width: "0%" }}
                    animate={{ width: index < currentStep ? "100%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
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
              Let's Catch Some Sparks <SafeIcon icon={FiArrowRight} className="ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CelebrationScreen;