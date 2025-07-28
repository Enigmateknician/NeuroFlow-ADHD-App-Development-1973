/**
 * Webhook Service - Sends app events to external systems for automation
 * 
 * This module handles sending event data to configured webhook endpoints
 * while ensuring the main app experience is never affected by webhook failures
 */

/**
 * Send an event to the configured webhook endpoint
 * 
 * @param {string} eventClass - Category of the event (e.g., 'checkin', 'dream')
 * @param {string} eventName - Name of the specific event (e.g., 'completed', 'created')
 * @param {object} data - Event payload data
 * @returns {Promise<void>} - Promise that resolves when webhook is sent (or fails silently)
 */
export const sendWebhook = async (eventClass, eventName, data = {}) => {
  try {
    // Webhook configuration
    const WEBHOOK_URL = 'https://enigmatek-secureflow-u9065.vm.elestio.app/api/v1/webhooks/nnMgP8m63bv0EGYJnbdXj';
    const WEBHOOK_ENABLED = true; // Centralized flag to easily disable all webhooks
    
    // Skip if webhooks are disabled
    if (!WEBHOOK_ENABLED) return;
    
    // Prepare the payload with standardized format
    const payload = {
      class: eventClass,
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // Send the webhook with a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
    
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Optional: Log successful webhook (only in development)
    if (import.meta.env.DEV) {
      console.log('Webhook sent:', eventClass, eventName);
    }
  } catch (error) {
    // Silently handle errors - never disrupt the user experience
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('Webhook error (safely handled):', error);
    }
  }
};

export default { sendWebhook };