import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

/**
 * EchoesSettings Component
 * Allows users to toggle the Echoes feature on/off
 */
const EchoesSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Get the current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          throw new Error('User not authenticated');
        }
        setUser(authUser);

        // Get the user's echoes settings
        const { data, error } = await supabase
          .from('users')
          .select('echoes_enabled')
          .eq('id', authUser.id)
          .single();

        if (error) throw error;
        
        // If the setting exists, use it; otherwise default to true
        setEnabled(data.echoes_enabled !== false);
      } catch (err) {
        console.error('Error loading echoes settings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ echoes_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;
      
      setSuccess(true);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving echoes settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle the setting
  const handleToggle = () => {
    setEnabled(!enabled);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <SafeIcon icon={FiLoader} className="w-5 h-5 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Self-Trust Echoes</h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        Echoes highlight your consistent actions to help build self-trust. 
        When enabled, we'll automatically create positive reflections based on your activities.
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700">Enable Self-Trust Echoes</span>
        
        <button 
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
          disabled={saving}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
      
      <div className="flex justify-end">
        <motion.button
          onClick={saveSettings}
          disabled={saving}
          className="py-2 px-4 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:bg-purple-700 transition-all flex items-center"
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          {saving ? (
            <>
              <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>Save</>
          )}
        </motion.button>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
          <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
          <SafeIcon icon={FiCheck} className="mr-2 flex-shrink-0" />
          <p>Settings saved successfully!</p>
        </div>
      )}
    </div>
  );
};

export default EchoesSettings;