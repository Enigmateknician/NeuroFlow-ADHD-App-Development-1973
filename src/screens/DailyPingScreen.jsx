import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiUser, FiHeart, FiLoader, FiArrowRight, FiCheckCircle, FiSkipForward, FiMessageCircle, FiEdit3, FiClock, FiBookOpen, FiX, FiChevronDown } from 'react-icons/fi';
import confetti from '../utils/confetti';
import { createEcho } from '../lib/echoGenerator';
import { sendWebhook } from '../lib/webhook';
import { trackCheckInComplete, trackCheckInRoundComplete } from '../lib/analytics';

const DailyPingScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [circle, setCircle] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [showPastCheckIns, setShowPastCheckIns] = useState(false);
  const [pastCheckIns, setPastCheckIns] = useState([]);
  const [loadingPastCheckIns, setLoadingPastCheckIns] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Relationship type options for displaying labels
  const relationshipTypes = [
    { value: 'partner', label: '❤️ Partner' },
    { value: 'family', label: '👪 Family' },
    { value: 'friend', label: '🤝 Friend' },
    { value: 'mentor', label: '🧑‍🏫 Mentor' },
    { value: 'child', label: '👶 Child' },
    { value: 'colleague', label: '💼 Colleague' },
    { value: 'other', label: '✨ Other' }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          // Load circle relationships
          await loadCircle(authUser.id);
          // Set start time for tracking completion time
          setStartTime(Date.now());
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

  const loadCircle = async (userId) => {
    try {
      // Load the user's circle
      const { data: circleData, error: circleError } = await supabase
        .from('relationships_7fb42a5e9d')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (circleError) throw circleError;

      if (!circleData || circleData.length === 0) {
        // No relationships found, redirect to circle setup
        navigate('/circle-setup');
        return;
      }

      setCircle(circleData);
    } catch (error) {
      console.error('Error loading circle:', error);
    }
  };

  const loadPastCheckIns = async (relationshipId) => {
    if (!user || !relationshipId) return;
    setLoadingPastCheckIns(true);
    try {
      const { data, error } = await supabase
        .from('circle_checkins_8f3d72c1e4')
        .select('*')
        .eq('user_id', user.id)
        .eq('relationship_id', relationshipId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPastCheckIns(data || []);
    } catch (error) {
      console.error('Error loading past check-ins:', error);
    } finally {
      setLoadingPastCheckIns(false);
    }
  };

  const handleViewPastCheckIns = () => {
    const currentPerson = circle[currentIndex];
    if (currentPerson) {
      loadPastCheckIns(currentPerson.id);
      setShowPastCheckIns(true);
    }
  };

  const handleCheckIn = async (type) => {
    if (currentIndex >= circle.length) return;
    const person = circle[currentIndex];
    setSaving(true);
    try {
      // Save check-in to database
      const { data: checkInData, error } = await supabase
        .from('circle_checkins_8f3d72c1e4')
        .insert([
          {
            user_id: user.id,
            relationship_id: person.id,
            type: type,
            note: checkInNote.trim() || null
          }
        ])
        .select();

      if (error) throw error;

      // Generate an echo for this check-in
      await createEcho(supabase, user.id, 'checkin', {
        relationship_id: person.id,
        name: person.name,
        relationship_type: person.relationship_type,
        type: type
      });

      // Send webhook notification for the check-in
      sendWebhook('checkin', 'completed', {
        user_id: user.id,
        relationship_id: person.id,
        relationship_name: person.name,
        relationship_type: person.relationship_type,
        check_in_type: type,
        note: checkInNote.trim() || null
      });

      // Track check-in analytics
      trackCheckInComplete({
        relationship_id: person.id,
        relationship_name: person.name,
        relationship_type: person.relationship_type,
        check_in_type: type,
        has_note: !!checkInNote.trim()
      });

      // Show confetti animation
      setShowConfetti(true);
      confetti();

      // Wait a bit for the animation
      setTimeout(() => {
        setShowConfetti(false);
        // Clear note for next person
        setCheckInNote('');
        // Move to next person
        if (currentIndex < circle.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // All done, show completion message
          setCompletionMessage("You've connected with everyone in your circle! 🎉");
          
          // Calculate completion time
          const completionTime = Date.now() - startTime;
          
          // Send webhook for completed circle
          sendWebhook('checkin', 'circle_completed', {
            user_id: user.id,
            circle_size: circle.length,
            completion_time_ms: completionTime
          });

          // Track completion analytics
          trackCheckInRoundComplete({
            circle_size: circle.length,
            completionTimeMs: completionTime,
            completed_fully: true
          });
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Clear note for next person
    setCheckInNote('');
    // Move to next person without recording a check-in
    if (currentIndex < circle.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done, navigate to dashboard
      
      // Calculate completion time
      const completionTime = Date.now() - startTime;
      
      // Track partial completion analytics
      trackCheckInRoundComplete({
        circle_size: circle.length,
        completionTimeMs: completionTime,
        completed_fully: false,
        skipped_count: circle.length - currentIndex
      });
      
      navigate('/dashboard');
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // If the user has completed their circle check-ins
  if (completionMessage && currentIndex >= circle.length) {
    return (
      <motion.div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-green-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl mb-6"
          >
            🎉
          </motion.div>
          <h1 className="text-2xl font-bold text-green-700 mb-4">
            {completionMessage}
          </h1>
          <p className="text-gray-600 mb-8">
            Building consistent connections is key to maintaining strong relationships. You're doing great!
          </p>
          <motion.button
            onClick={handleComplete}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-full font-medium shadow-md hover:bg-green-700 transition-all flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiArrowRight} className="mr-2" />
            Continue to Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // If no people in circle
  if (circle.length === 0) {
    return (
      <motion.div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-purple-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            Your Circle Is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Let's add some important people to your circle so you can stay connected.
          </p>
          <motion.button
            onClick={() => navigate('/circle-setup')}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-full font-medium shadow-md hover:bg-purple-700 transition-all flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiUser} className="mr-2" />
            Set Up Your Circle
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const currentPerson = circle[currentIndex];
  const relationshipLabel = relationshipTypes.find(t => t.value === currentPerson?.relationship_type)?.label || currentPerson?.relationship_type;

  return (
    <motion.div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-purple-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Progress indicator */}
      <motion.div className="w-full max-w-md mb-4 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-purple-700 font-medium">
            Daily Connection
          </p>
          <p className="text-sm text-purple-700">
            {currentIndex + 1} of {circle.length}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <motion.div
            className="bg-purple-600 h-1.5 rounded-full"
            initial={{ width: `${(currentIndex / circle.length) * 100}%` }}
            animate={{ width: `${((currentIndex + 1) / circle.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </motion.div>

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPerson?.id}
          className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {/* Confetti overlay */}
          {showConfetti && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-5xl"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                {currentPerson.relationship_type === 'partner' ? '❤️' :
                  currentPerson.relationship_type === 'family' ? '👪' :
                    currentPerson.relationship_type === 'friend' ? '🤝' :
                      currentPerson.relationship_type === 'mentor' ? '🧑‍🏫' :
                        currentPerson.relationship_type === 'child' ? '👶' :
                          currentPerson.relationship_type === 'colleague' ? '💼' : '✨'}
              </motion.div>
            </motion.div>
          )}

          {/* Person details */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 mb-4">
              {currentPerson?.photo_url ? (
                <img
                  src={currentPerson.photo_url}
                  alt={currentPerson.name}
                  className="w-full h-full object-cover rounded-full border-2 border-purple-200 shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200 shadow-md">
                  <SafeIcon icon={FiUser} className="w-10 h-10 text-purple-500" />
                </div>
              )}
            </div>
            <motion.h2
              className="text-xl font-bold text-gray-800 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {currentPerson?.name}
            </motion.h2>
            <motion.span
              className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {relationshipLabel}
            </motion.span>
            {currentPerson?.notes && (
              <motion.p
                className="text-gray-600 text-center text-sm bg-gray-50 p-3 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {currentPerson.notes}
              </motion.p>
            )}
          </div>

          {/* Question prompt */}
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-lg text-purple-700 font-medium">
              Have you connected with {currentPerson?.name} today?
            </h3>
          </motion.div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.button
              onClick={() => handleCheckIn('pinged')}
              disabled={saving}
              className="py-3 px-4 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition-all flex flex-col items-center justify-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <SafeIcon icon={FiMessageCircle} className="mb-1 text-xl" />
              <span>Pinged Today</span>
            </motion.button>
            <motion.button
              onClick={() => handleCheckIn('thought')}
              disabled={saving}
              className="py-3 px-4 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition-all flex flex-col items-center justify-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <SafeIcon icon={FiHeart} className="mb-1 text-xl" />
              <span>Thought of Them</span>
            </motion.button>
          </div>

          {/* Note input */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute top-3 left-3 text-purple-400">
                <SafeIcon icon={FiEdit3} />
              </div>
              <textarea
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder="Optional: Add a quick note about your interaction, memory, or thoughts."
                maxLength={200}
                rows={2}
                disabled={saving}
                className="w-full pl-10 pr-3 py-2 bg-purple-50 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 resize-none text-sm text-gray-700"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {checkInNote.length}/200
              </div>
            </div>
          </motion.div>

          {/* Past check-ins button */}
          <motion.button
            onClick={handleViewPastCheckIns}
            className="w-full mb-4 py-1 text-sm text-center text-purple-600 hover:text-purple-800 transition-colors flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <SafeIcon icon={FiBookOpen} className="mr-1 text-xs" />
            <span>View past check-ins with this person</span>
          </motion.button>

          {/* Skip button */}
          <motion.button
            onClick={handleSkip}
            disabled={saving}
            className="w-full py-2 text-gray-500 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiSkipForward} className="mr-1" />
            Skip for Now
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Bottom text */}
      <motion.p
        className="mt-6 text-sm text-center text-purple-700 max-w-md px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Maintaining connections with your circle helps protect against isolation and builds lasting relationships.
      </motion.p>

      {/* Past check-ins bottom sheet */}
      <AnimatePresence>
        {showPastCheckIns && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPastCheckIns(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-lg pb-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Handle for swipe */}
              <div className="w-full flex justify-center pt-2 pb-4">
                <div className="w-12 h-1.5 rounded-full bg-gray-300"></div>
              </div>

              {/* Close button */}
              <motion.button
                onClick={() => setShowPastCheckIns(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </motion.button>

              {/* Content */}
              <div className="px-6">
                <div className="flex items-center mb-4">
                  <SafeIcon icon={FiClock} className="text-purple-600 mr-3 text-xl" />
                  <h3 className="text-lg font-semibold text-purple-800">
                    Past Check-ins with {currentPerson?.name}
                  </h3>
                </div>

                {loadingPastCheckIns ? (
                  <div className="py-8 flex justify-center">
                    <SafeIcon icon={FiLoader} className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                ) : pastCheckIns.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-600">
                      No past check-ins yet – you're just getting started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {pastCheckIns.map((checkIn) => (
                      <motion.div
                        key={checkIn.id}
                        className="p-4 bg-purple-50 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <SafeIcon
                              icon={checkIn.type === 'pinged' ? FiMessageCircle : FiHeart}
                              className={`mr-2 ${checkIn.type === 'pinged' ? 'text-purple-600' : 'text-blue-600'}`}
                            />
                            <span className="font-medium text-gray-800">
                              {checkIn.type === 'pinged' ? 'Pinged' : 'Thought of'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(checkIn.created_at)}
                          </span>
                        </div>
                        {checkIn.note && (
                          <p className="text-gray-700 text-sm pl-6 border-l-2 border-purple-200">
                            {checkIn.note}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.button
                  onClick={() => setShowPastCheckIns(false)}
                  className="mt-6 w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition-all flex justify-center items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiChevronDown} className="mr-2" />
                  Close
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyPingScreen;