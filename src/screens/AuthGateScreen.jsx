import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import { FiMail, FiAlertCircle, FiLoader } from 'react-icons/fi';

const AuthGateScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, ensure they exist in users table
        await ensureUserExists(session.user);
        navigate('/welcome');
      }
      
      setCheckingSession(false);
    };

    checkSession();
  }, [navigate]);

  const ensureUserExists = async (user) => {
    if (!user) return;

    // Check if user exists in users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // If user doesn't exist, create a new record
    if (error || !data) {
      await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
          }
        ]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/#/welcome',
        }
      });

      if (error) throw error;
      
      setMessage({
        text: 'Check your email for the login link!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message || 'An error occurred during login',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/#/welcome',
        }
      });

      if (error) throw error;
    } catch (error) {
      setMessage({
        text: error.message || 'An error occurred during login',
        type: 'error'
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
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
      <motion.div 
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h1 
          className="text-2xl font-bold text-blue-800 mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Welcome to NeuroFlow
        </motion.h1>
        
        <motion.p 
          className="text-md text-blue-700 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Sign in to begin your personalized focus journey.
        </motion.p>

        {message.text && (
          <motion.div 
            className={`p-3 rounded-lg mb-4 ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <SafeIcon 
                icon={message.type === 'error' ? FiAlertCircle : FiMail} 
                className="mr-2 flex-shrink-0"
              />
              <p>{message.text}</p>
            </div>
          </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiMail} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <motion.button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all flex justify-center items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
            ) : null}
            Send Login Link
          </motion.button>
        </form>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="mx-4 text-sm text-gray-500">OR</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        
        <motion.button
          onClick={handleGoogleLogin}
          className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all flex justify-center items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AuthGateScreen;