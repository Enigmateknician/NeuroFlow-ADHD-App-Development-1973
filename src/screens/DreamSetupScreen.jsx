import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiUpload, FiImage, FiSave, FiArrowRight, FiLoader, FiCheck, FiAlertCircle, FiX, FiAlertTriangle } from 'react-icons/fi';
import { createEcho } from '../lib/echoGenerator';
import { sendWebhook } from '../lib/webhook';
import { trackDreamSaved } from '../lib/analytics';

const DreamSetupScreen = () => {
  const [dreamText, setDreamText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [setupStatus, setSetupStatus] = useState('checking'); // checking, ready, error
  const navigate = useNavigate();

  // Default lifestyle aspiration images
  const defaultImages = [
    {
      id: 'ski-trip',
      url: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&h=600&fit=crop&crop=center',
      alt: 'Friends on a ski trip'
    },
    {
      id: 'lake-house',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
      alt: 'House on a lake'
    },
    {
      id: 'creative-studio',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      alt: 'Creative studio apartment'
    }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);
      setSetupStatus('checking');

      try {
        console.log("Loading user data for DreamSetupScreen");
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting authenticated user:', userError);
          throw userError;
        }
        
        if (authUser) {
          setUser(authUser);
          console.log("User authenticated:", authUser.id);
          
          // Ensure all tables exist first
          try {
            await supabase.rpc('create_all_tables_if_not_exist');
            console.log("Ensured all tables exist");
          } catch (rpcError) {
            console.error("Error with RPC function:", rpcError);
            // Continue anyway - we'll handle individual errors
          }
          
          // Check if user exists and load their dream data
          try {
            const { data: userData, error: userDataError } = await supabase
              .from('users')
              .select('dream_text, dream_image_url')
              .eq('id', authUser.id)
              .single();

            // If user doesn't exist in users table, create them
            if (userDataError && userDataError.code === 'PGRST116') {
              console.log("User doesn't exist in database, creating record");
              const { error: insertError } = await supabase
                .from('users')
                .insert([{
                  id: authUser.id,
                  email: authUser.email,
                  dream_text: null,
                  dream_image_url: null
                }]);

              if (insertError) {
                console.error('Error creating new user record:', insertError);
                throw insertError;
              }
              
              console.log("Created new user record successfully");
            } else if (userDataError) {
              console.error('Error checking user data:', userDataError);
              throw userDataError;
            } else if (userData) {
              // Load existing dream data
              console.log("Found existing user data:", userData);
              setDreamText(userData.dream_text || '');
              if (userData.dream_image_url) {
                setImagePreview(userData.dream_image_url);
                setSelectedImage({
                  type: 'existing',
                  url: userData.dream_image_url
                });
              }
            }
            
            setSetupStatus('ready');
          } catch (userFetchError) {
            console.error('Error managing user record:', userFetchError);
            setError('There was an issue loading your profile. Please try refreshing the page.');
            setSetupStatus('error');
          }
        } else {
          console.error('No authenticated user found');
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
        setError('Failed to load your data. Please refresh the page or try again later.');
        setSetupStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // Toast management
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
      }
      
      setSelectedImage({ type: 'upload', file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const handleDefaultImageSelect = (image) => {
    setSelectedImage({ type: 'default', ...image });
    setImagePreview(image.url);
    setError(null);
  };

  const uploadImageToSupabase = async (file) => {
    try {
      // First, check if the storage bucket exists
      try {
        // Try to get bucket info to see if it exists
        const { error: bucketCheckError } = await supabase.storage
          .getBucket('dream-images');

        if (bucketCheckError) {
          console.error('Error checking storage bucket:', bucketCheckError);
          // If bucket doesn't exist, try to create it
          const { error: createBucketError } = await supabase.storage
            .createBucket('dream-images', { public: true });
            
          if (createBucketError) {
            console.error('Error creating storage bucket:', createBucketError);
            throw createBucketError;
          }
        }
      } catch (bucketError) {
        console.error('Error checking/creating storage bucket:', bucketError);
        throw new Error('Failed to set up image storage. Please try again later.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('dream-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.error('Error uploading image to dream-images storage:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dream-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Return a default image instead
      return defaultImages[0].url;
    }
  };

  const handleSave = async () => {
    if (!dreamText.trim() && !selectedImage) {
      setError('Please add either a dream description or select an image');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      let imageUrl = null;

      // Handle image upload if there's a new one
      if (selectedImage) {
        if (selectedImage.type === 'upload') {
          try {
            imageUrl = await uploadImageToSupabase(selectedImage.file);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            // Use the first default image as a fallback
            imageUrl = defaultImages[0].url;
            showToast("Image upload didn't complete. Your dream was saved with a default image.", 'warning');
          }
        } else if (selectedImage.type === 'default') {
          imageUrl = selectedImage.url;
        } else if (selectedImage.type === 'existing') {
          imageUrl = selectedImage.url;
        }
      }

      // Check if this is a new dream or an update
      const { data: existingDream, error: checkError } = await supabase
        .from('users')
        .select('dream_text')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // User doesn't exist, insert new record
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            dream_text: dreamText.trim() || null,
            dream_image_url: imageUrl,
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error inserting new user record:', insertError);
          throw insertError;
        }
        
        // It's a new dream since we just created the user
        const isNewDream = true;
        
        // Try to generate an echo
        try {
          await createEcho(supabase, user.id, 'dream');
          
          // Send webhook for dream saved event
          sendWebhook('dream', 'created', {
            user_id: user.id,
            dream_text: dreamText.trim(),
            has_image: !!imageUrl,
            image_type: selectedImage?.type || null
          });
          
          // Track dream saved analytics
          trackDreamSaved(true, {
            text: dreamText.trim(),
            imageUrl,
            image_type: selectedImage?.type || null
          });
        } catch (echoError) {
          console.error('Error creating echo:', echoError);
          // Don't fail the save if echo creation fails
        }
      } else if (checkError) {
        console.error('Error checking for existing dream:', checkError);
        throw checkError;
      } else {
        // User exists, update record
        const isNewDream = !existingDream?.dream_text && dreamText.trim();
        const isUpdatedDream = existingDream?.dream_text !== dreamText.trim() && dreamText.trim();
        
        // Save to database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            dream_text: dreamText.trim() || null,
            dream_image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user dream:', updateError);
          throw updateError;
        }
        
        // Generate an echo for dream creation/update
        if (isNewDream || isUpdatedDream) {
          try {
            await createEcho(supabase, user.id, 'dream');
            
            // Send webhook for dream saved event
            sendWebhook('dream', isNewDream ? 'created' : 'updated', {
              user_id: user.id,
              dream_text: dreamText.trim(),
              has_image: !!imageUrl,
              image_type: selectedImage?.type || null
            });
            
            // Track dream saved analytics
            trackDreamSaved(isNewDream, {
              text: dreamText.trim(),
              imageUrl,
              image_type: selectedImage?.type || null
            });
          } catch (echoError) {
            console.error('Error creating echo:', echoError);
            // Don't fail the save if echo creation fails
          }
        }
      }

      // Navigate to the celebration screen instead of circle setup
      navigate('/celebration');
    } catch (error) {
      console.error('Error saving dream:', error);
      setError('Something went wrong while saving your dream. Please try again or check your internet.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Track skip event
    trackDreamSaved(false, { skipped: true });
    navigate('/celebration');
  };

  if (loading || setupStatus === 'checking') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-600">Loading your dream space...</p>
        </div>
      </div>
    );
  }
  
  if (setupStatus === 'error') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 text-center">Setup Issue</h1>
          <p className="text-gray-700 mb-6 text-center">{error || 'There was a problem setting up your profile. Please try again.'}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 to-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : toast.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center">
              <SafeIcon
                icon={
                  toast.type === 'error'
                    ? FiAlertCircle
                    : toast.type === 'success'
                    ? FiCheck
                    : FiAlertTriangle
                }
                className={`mr-2 ${
                  toast.type === 'error'
                    ? 'text-red-500'
                    : toast.type === 'success'
                    ? 'text-green-500'
                    : 'text-yellow-500'
                } flex-shrink-0`}
              />
              <p
                className={`${
                  toast.type === 'error'
                    ? 'text-red-700'
                    : toast.type === 'success'
                    ? 'text-green-700'
                    : 'text-yellow-700'
                } text-sm pr-6`}
              >
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className={`absolute top-2 right-2 p-1 rounded-full ${
                  toast.type === 'error'
                    ? 'text-red-400 hover:bg-red-100'
                    : toast.type === 'success'
                    ? 'text-green-400 hover:bg-green-100'
                    : 'text-yellow-400 hover:bg-yellow-100'
                }`}
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1
          className="text-2xl font-bold text-blue-800 mb-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Visualize Your Dream
        </motion.h1>

        <motion.p
          className="text-sm text-blue-700 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          This vision will guide and motivate you every day.
        </motion.p>

        {/* Error message */}
        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertCircle} className="mr-2 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100"
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Image Selection Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-gray-700 mb-3">Choose Your Vision</h3>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Dream vision"
                className="w-full h-32 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  // Fallback for broken images
                  e.target.onerror = null;
                  e.target.src = defaultImages[0].url;
                  showToast("We couldn't load your selected image. A default image has been used instead.", 'warning');
                }}
              />
            </div>
          )}

          {/* Upload Button */}
          <div className="mb-4">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="w-full flex items-center justify-center py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
            >
              <SafeIcon icon={FiUpload} className="mr-2 text-blue-600" />
              <span className="text-blue-600 font-medium">Upload Your Own Image</span>
            </label>
          </div>

          {/* Default Images */}
          <div className="grid grid-cols-3 gap-2">
            {defaultImages.map((image) => (
              <motion.button
                key={image.id}
                onClick={() => handleDefaultImageSelect(image)}
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.id === image.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for broken default images
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML = `<div class="w-full h-full bg-blue-100 flex items-center justify-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>`;
                  }}
                />
                {selectedImage?.id === image.id && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <SafeIcon icon={FiCheck} className="text-white text-lg" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Text Input Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <label htmlFor="dream-text" className="block text-lg font-medium text-gray-700 mb-2">
            Describe Your Dream
          </label>
          <textarea
            id="dream-text"
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="What does your dream look like in words?"
            maxLength={150}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {dreamText.length}/150
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all flex justify-center items-center"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            {saving ? (
              <>
                <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="mr-2" />
                Save and Continue
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleSkip}
            disabled={saving}
            className="w-full py-2 px-4 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-all flex justify-center items-center"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            <SafeIcon icon={FiArrowRight} className="mr-2" />
            Skip for Now
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DreamSetupScreen;