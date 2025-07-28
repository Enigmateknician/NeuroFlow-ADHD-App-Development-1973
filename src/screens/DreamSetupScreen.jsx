import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiUpload, FiImage, FiSave, FiArrowRight, FiLoader, FiCheck } from 'react-icons/fi';
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
  const navigate = useNavigate();

  // Default calming images
  const defaultImages = [
    { id: 'mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center', alt: 'Mountain sunrise' },
    { id: 'ocean', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop&crop=center', alt: 'Ocean waves' },
    { id: 'forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center', alt: 'Peaceful forest' }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);

          // Load existing dream data
          const { data, error } = await supabase
            .from('users')
            .select('dream_text, dream_image_url')
            .eq('id', authUser.id)
            .single();

          if (data) {
            setDreamText(data.dream_text || '');
            if (data.dream_image_url) {
              setImagePreview(data.dream_image_url);
              setSelectedImage({ type: 'existing', url: data.dream_image_url });
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage({ type: 'upload', file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultImageSelect = (image) => {
    setSelectedImage({ type: 'default', ...image });
    setImagePreview(image.url);
  };

  const uploadImageToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('dream-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('dream-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!dreamText.trim() && !selectedImage) {
      alert('Please add either a dream description or select an image');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = null;

      // Handle image upload if there's a new one
      if (selectedImage) {
        if (selectedImage.type === 'upload') {
          imageUrl = await uploadImageToSupabase(selectedImage.file);
        } else if (selectedImage.type === 'default') {
          imageUrl = selectedImage.url;
        } else if (selectedImage.type === 'existing') {
          imageUrl = selectedImage.url;
        }
      }

      // Check if this is a new dream or an update
      const { data: existingDream } = await supabase
        .from('users')
        .select('dream_text')
        .eq('id', user.id)
        .single();

      const isNewDream = !existingDream?.dream_text && dreamText.trim();
      const isUpdatedDream = existingDream?.dream_text !== dreamText.trim() && dreamText.trim();

      // Save to database
      const { error } = await supabase
        .from('users')
        .update({
          dream_text: dreamText.trim() || null,
          dream_image_url: imageUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      // Generate an echo for dream creation/update
      if (isNewDream || isUpdatedDream) {
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
      }

      // Navigate to next screen
      navigate('/circle-setup');
    } catch (error) {
      console.error('Error saving dream:', error);
      alert('Failed to save dream. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Track skip event
    trackDreamSaved(false, { skipped: true });
    navigate('/circle-setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 to-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1 className="text-2xl font-bold text-blue-800 mb-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Visualize Your Dream
        </motion.h1>
        <motion.p className="text-sm text-blue-700 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          This vision will guide and motivate you every day.
        </motion.p>

        {/* Image Selection Section */}
        <motion.div className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-gray-700 mb-3">Choose Your Vision</h3>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img src={imagePreview} alt="Dream vision" className="w-full h-32 object-cover rounded-lg shadow-md" />
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
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage?.id === image.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
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
        <motion.div className="mb-6"
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
          <div className="text-right text-sm text-gray-500 mt-1">{dreamText.length}/150</div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="flex flex-col gap-3"
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