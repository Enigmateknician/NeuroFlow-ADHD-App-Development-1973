/**
 * Analytics Service - Silent event logging for product analytics
 * 
 * This module handles tracking key user interactions and app events
 * while ensuring the main app experience is never affected by logging failures
 */
import supabase from './supabase';
import { sendWebhook } from './webhook';

// Global toggle to easily disable analytics in emergencies
const ENABLE_ANALYTICS_LOGGING = true;

// Cache for session tracking to avoid duplicate events
let sessionTracked = false;

/**
 * Log an analytics event to the database and optionally to webhook
 * 
 * @param {string} eventName - Name of the event to log
 * @param {object} metadata - Additional data related to the event
 * @param {boolean} mirrorToWebhook - Whether to also send the event to webhook
 * @returns {Promise<void>} - Promise that resolves when logging completes (or fails silently)
 */
export const logEvent = async (eventName, metadata = {}, mirrorToWebhook = true) => {
  try {
    if (!ENABLE_ANALYTICS_LOGGING) return;

    // Special handling for session_start to prevent duplicates
    if (eventName === 'session_start' && sessionTracked) return;
    if (eventName === 'session_start') sessionTracked = true;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Skip logging if no authenticated user

    // Log to database
    await supabase
      .from('event_logs_analytics_admin')
      .insert([
        {
          user_id: user.id,
          event_name: eventName,
          metadata
        }
      ]);

    // Optionally mirror to webhook
    if (mirrorToWebhook) {
      sendWebhook('analytics', eventName, {
        user_id: user.id,
        ...metadata
      });
    }

    // Optional development logging
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event logged: ${eventName}`, metadata);
    }
  } catch (error) {
    // Silently handle errors - never disrupt user experience
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('[Analytics] Error (safely handled):', error);
    }
  }
};

/**
 * Convenience method to track when a user starts a new session
 */
export const trackSessionStart = () => {
  logEvent('session_start', { 
    timestamp: new Date().toISOString(),
    referrer: document.referrer || null,
    userAgent: navigator.userAgent
  });
};

/**
 * Track when a dream is created or updated
 * 
 * @param {boolean} isNew - Whether this is a new dream or an update
 * @param {object} dreamData - Data about the dream
 */
export const trackDreamSaved = (isNew, dreamData = {}) => {
  logEvent('dream_saved', {
    is_new: isNew,
    has_image: !!dreamData.imageUrl,
    text_length: dreamData.text?.length || 0,
    ...dreamData
  });
};

/**
 * Track when a user completes a check-in with someone
 * 
 * @param {object} checkInData - Data about the check-in
 */
export const trackCheckInComplete = (checkInData = {}) => {
  logEvent('checkin_complete', checkInData);
};

/**
 * Track when a user completes their entire check-in round
 * 
 * @param {object} data - Data about the check-in round
 */
export const trackCheckInRoundComplete = (data = {}) => {
  logEvent('checkin_round_complete', {
    circle_size: data.circleSize || 0,
    completion_time_ms: data.completionTimeMs || 0,
    ...data
  });
};

/**
 * Track when an echo is generated for a user
 * 
 * @param {object} echoData - Data about the echo
 */
export const trackEchoGenerated = (echoData = {}) => {
  logEvent('echo_generated', echoData);
};

/**
 * Track when a user's circle is updated
 * 
 * @param {object} circleData - Data about the circle update
 */
export const trackCircleUpdated = (circleData = {}) => {
  logEvent('circle_updated', {
    circle_size: circleData.size || 0,
    action_type: circleData.actionType || 'unknown',
    ...circleData
  });
};

/**
 * Track when a user opens the feedback form
 * 
 * @param {object} data - Data about the feedback form
 */
export const trackFeedbackOpened = (data = {}) => {
  logEvent('feedback_opened', data);
};

export default {
  logEvent,
  trackSessionStart,
  trackDreamSaved,
  trackCheckInComplete,
  trackCheckInRoundComplete,
  trackEchoGenerated,
  trackCircleUpdated,
  trackFeedbackOpened
};