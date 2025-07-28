import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiUser, FiUpload, FiTrash2, FiEdit2, FiPlus, FiSave, FiArrowRight, FiLoader, FiInfo, FiX, FiCheck } from 'react-icons/fi';
import { trackCircleUpdated } from '../lib/analytics';

const CircleSetupScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [people, setPeople] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Form state for adding/editing a person
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPerson, setCurrentPerson] = useState({
    name: '',
    relationship_type: '',
    photo_url: null,
    notes: '',
    photoFile: null,
    photoPreview: null
  });

  // Relationship type options
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
          // Load existing relationships
          await loadRelationships(authUser.id);
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

  const loadRelationships = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('relationships_7fb42a5e9d')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error loading relationships:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentPerson(prev => ({
          ...prev,
          photoFile: file,
          photoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoToStorage = async (file) => {
    if (!file || !user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('circle-photos')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('circle-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const resetForm = () => {
    setCurrentPerson({
      name: '',
      relationship_type: '',
      photo_url: null,
      notes: '',
      photoFile: null,
      photoPreview: null
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();

    if (!currentPerson.name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!currentPerson.relationship_type) {
      alert('Please select a relationship type');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = currentPerson.photo_url;

      // Upload photo if there's a new one
      if (currentPerson.photoFile) {
        photoUrl = await uploadPhotoToStorage(currentPerson.photoFile);
      }

      if (isEditing && editingId) {
        // Update existing person
        const { error } = await supabase
          .from('relationships_7fb42a5e9d')
          .update({
            name: currentPerson.name.trim(),
            relationship_type: currentPerson.relationship_type,
            photo_url: photoUrl,
            notes: currentPerson.notes.trim(),
            updated_at: new Date()
          })
          .eq('id', editingId);

        if (error) throw error;

        // Track circle update - edit
        trackCircleUpdated({
          actionType: 'edit',
          size: people.length,
          relationship_type: currentPerson.relationship_type,
          relationship_id: editingId
        });
      } else {
        // Add new person
        const { error, data } = await supabase
          .from('relationships_7fb42a5e9d')
          .insert([{
            user_id: user.id,
            name: currentPerson.name.trim(),
            relationship_type: currentPerson.relationship_type,
            photo_url: photoUrl,
            notes: currentPerson.notes.trim()
          }])
          .select();

        if (error) throw error;

        // Track circle update - add
        trackCircleUpdated({
          actionType: 'add',
          size: people.length + 1,
          relationship_type: currentPerson.relationship_type,
          relationship_id: data?.[0]?.id
        });
      }

      // Reload relationships
      await loadRelationships(user.id);
      resetForm();
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPerson = (person) => {
    setCurrentPerson({
      name: person.name,
      relationship_type: person.relationship_type,
      photo_url: person.photo_url,
      notes: person.notes || '',
      photoFile: null,
      photoPreview: person.photo_url
    });
    setIsEditing(true);
    setEditingId(person.id);
  };

  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Are you sure you want to remove this person from your circle?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('relationships_7fb42a5e9d')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      // Update the local state
      setPeople(people.filter(person => person.id !== personId));

      // Track circle update - remove
      trackCircleUpdated({
        actionType: 'remove',
        size: people.length - 1,
        relationship_id: personId
      });
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Failed to remove person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (people.length === 0) {
      if (!window.confirm('You haven\'t added anyone to your circle. Are you sure you want to continue?')) {
        return;
      }
    }

    setSaving(true);
    try {
      // In the future, we might want to save additional data or preferences

      // Track circle save event
      trackCircleUpdated({
        actionType: 'save_and_continue',
        size: people.length
      });

      // For now, we just navigate to the next screen
      navigate('/dashboard'); // Update this to your next screen path
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Track skip event
    trackCircleUpdated({
      actionType: 'skip',
      size: people.length
    });
    
    navigate('/dashboard'); // Update this to your next screen path
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-purple-50 to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <motion.h1
              className="text-2xl font-bold text-purple-800 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your Circle of Support
            </motion.h1>
            <motion.p
              className="text-sm text-purple-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              These are the people you want to stay connected to—even when life gets chaotic.
            </motion.p>
          </div>
          <motion.button
            className="text-purple-600 p-2 rounded-full hover:bg-purple-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfoModal(true)}
          >
            <SafeIcon icon={FiInfo} className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Form to add/edit person */}
        <motion.form
          onSubmit={handleAddPerson}
          className="mb-8 p-5 border border-purple-100 rounded-xl bg-purple-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-purple-700 mb-4">
            {isEditing ? 'Edit Person' : 'Add Person to Your Circle'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentPerson.name}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Who do you want to stay connected with?"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="relationship_type" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <select
                id="relationship_type"
                name="relationship_type"
                value={currentPerson.relationship_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select relationship</option>
                {relationshipTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={currentPerson.notes}
              onChange={handleInputChange}
              placeholder="E.g., Call weekly, Ask about their new job..."
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optional)
            </label>
            {currentPerson.photoPreview ? (
              <div className="relative w-20 h-20 mb-2">
                <img
                  src={currentPerson.photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-2 border-purple-200"
                />
                <button
                  type="button"
                  onClick={() => setCurrentPerson(prev => ({ ...prev, photoFile: null, photoPreview: null, photo_url: null }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <SafeIcon icon={FiX} className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="flex items-center justify-center py-2 px-4 border border-dashed border-purple-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="mr-2 text-purple-600" />
                  <span className="text-purple-600 font-medium">Upload Photo</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              type="submit"
              className="py-2 px-4 bg-purple-600 text-white rounded-lg font-medium shadow-md hover:bg-purple-700 transition-all flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
              ) : (
                <SafeIcon icon={isEditing ? FiCheck : FiPlus} className="mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Add to Circle'}
            </motion.button>

            {isEditing && (
              <motion.button
                type="button"
                onClick={resetForm}
                className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </motion.form>

        {/* List of people in circle */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-purple-700">
              Your Circle ({people.length})
            </h3>
            {people.length > 0 && (
              <p className="text-sm text-purple-600">
                {people.length < 3 ? `${3 - people.length} more recommended` : '✨ Great circle!'}
              </p>
            )}
          </div>

          {people.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500">
                No one added to your circle yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {people.map((person) => (
                  <motion.div
                    key={person.id}
                    className="flex items-center p-4 bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <div className="w-12 h-12 flex-shrink-0 mr-4">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.name}
                          className="w-full h-full object-cover rounded-full border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center">
                          <SafeIcon icon={FiUser} className="text-purple-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-800 truncate">
                        {person.name}
                      </h4>
                      <div className="flex items-center">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {relationshipTypes.find(t => t.value === person.relationship_type)?.label || person.relationship_type}
                        </span>
                        {person.notes && (
                          <span className="ml-2 text-xs text-gray-500 truncate">
                            {person.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <motion.button
                        onClick={() => handleEditPerson(person)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeletePerson(person.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            onClick={handleSaveAndContinue}
            disabled={saving}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-full font-medium shadow-md hover:bg-purple-700 transition-all flex justify-center items-center"
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
            className="w-full py-2 px-4 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-all flex justify-center items-center"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            <SafeIcon icon={FiArrowRight} className="mr-2" />
            Skip for Now
          </motion.button>
        </motion.div>
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
              onClick={() => setShowInfoModal(false)}
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-purple-800 mb-4">About Your Circle</h2>
            <p className="text-gray-700 mb-4">
              People we love often fade into the background—not because we don't care, but because ADHD makes new things louder than important things.
            </p>
            <p className="text-gray-700 mb-4">
              Your Circle helps bring these people forward again, protecting you from isolation and helping you be more consistent in your relationships.
            </p>
            <p className="text-gray-700 mb-4">
              We recommend adding at least 3 people who matter most to you. You can always edit or update your circle later.
            </p>
            <div className="flex justify-center">
              <motion.button
                className="py-2 px-6 bg-purple-600 text-white rounded-full font-medium shadow-md hover:bg-purple-700 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInfoModal(false)}
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

export default CircleSetupScreen;