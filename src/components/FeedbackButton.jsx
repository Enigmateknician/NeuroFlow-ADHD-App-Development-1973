import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { trackFeedbackOpened } from '../lib/analytics';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    // Track feedback form opened
    trackFeedbackOpened();
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form state
    setFeedback('');
    setSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setSending(true);
    
    try {
      // Here you would typically send the feedback to your backend
      // For this example, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success state
      setSent(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setIsOpen(false);
        setFeedback('');
        setSent(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SafeIcon icon={FiMessageSquare} className="w-5 h-5" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed bottom-20 right-6 w-full max-w-xs bg-white rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-purple-800">Share Feedback</h3>
                  <motion.button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiX} className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-4">
                {sent ? (
                  <div className="py-6 text-center">
                    <motion.div
                      className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h4 className="text-lg font-medium text-green-700 mb-2">Thank You!</h4>
                    <p className="text-sm text-gray-600">Your feedback helps us improve the app.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                        What's on your mind?
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder="Share your thoughts, ideas, or report an issue..."
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:bg-purple-700 transition-all flex justify-center items-center"
                      whileHover={{ scale: sending ? 1 : 1.02 }}
                      whileTap={{ scale: sending ? 1 : 0.98 }}
                      disabled={sending || !feedback.trim()}
                    >
                      {sending ? (
                        <>
                          <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <SafeIcon icon={FiSend} className="mr-2" />
                          Send Feedback
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackButton;