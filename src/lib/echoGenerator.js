/**
 * Echo Generator - Creates meaningful self-reflection messages based on user actions
 * This helps users build self-trust by highlighting their positive behaviors
 */
import { trackEchoGenerated } from './analytics';

/**
 * Generates an echo message based on the type of action and related data
 *
 * @param {string} source - Type of action (checkin, dream, gratitude)
 * @param {object} data - Additional data related to the action
 * @returns {string} - Generated echo message
 */
const generateEchoText = (source, data = {}) => {
  const { name, relationship_type, type } = data;

  const messages = {
    // Check-in related messages
    checkin: [
      name ? `You reached out to ${name} today. That counts.` : 'You maintained a connection today. That matters.',
      name ? `You made time for ${name}. That's relationship building.` : 'You prioritized a relationship today.',
      type === 'pinged' ? 'You initiated connection. That takes courage.' : 'You held someone in your thoughts. That\'s care.',
      relationship_type === 'family' ? 'You invested in family. That builds roots.' : 
      relationship_type === 'friend' ? 'You nurtured a friendship. That creates support.' : 
      relationship_type === 'partner' ? 'You strengthened your partnership. That\'s love in action.' : 
      'You showed up for your relationship. That builds trust.'
    ],

    // Dream related messages
    dream: [
      'You clarified your vision. That\'s rare and powerful.',
      'You reconnected with your purpose. That\'s grounding.',
      'You made your dream visible. That brings it closer.',
      'You articulated what matters. That creates direction.'
    ],

    // Gratitude related messages (for future implementation)
    gratitude: [
      'You found a bright spot. That matters.',
      'You noticed what\'s good. That shifts perspective.',
      'You practiced gratitude. That builds resilience.',
      'You appreciated a moment. That\'s mindfulness.'
    ]
  };

  // Select a random message from the appropriate category
  const categoryMessages = messages[source] || messages.checkin;
  const randomIndex = Math.floor(Math.random() * categoryMessages.length);
  return categoryMessages[randomIndex];
};

/**
 * Creates an echo record in the database
 *
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} source - Type of action
 * @param {object} data - Additional data related to the action
 * @returns {Promise<object>} - Result of the database insertion
 */
export const createEcho = async (supabase, userId, source, data = {}) => {
  try {
    // Check if echoes are enabled for this user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('echoes_enabled')
      .eq('id', userId)
      .single();

    // If there's an error or echoes are disabled, don't create an echo
    if (userError || userData?.echoes_enabled === false) {
      return { error: userError || new Error('Echoes disabled for user') };
    }

    // Generate the echo text
    const text = generateEchoText(source, data);

    // Prepare the echo record
    const echoRecord = {
      user_id: userId,
      relationship_id: data.relationship_id || null,
      source,
      text,
      importance_score: data.importance_score || 1
    };

    // Insert the echo record
    const { data: echo, error } = await supabase
      .from('echoes_6e82a3a1')
      .insert([echoRecord])
      .select();

    if (error) throw error;

    // Track the echo generation for analytics
    trackEchoGenerated({
      source,
      relationship_id: data.relationship_id,
      relationship_type: data.relationship_type,
      echo_text: text
    });

    return { data: echo };
  } catch (error) {
    console.error('Error creating echo:', error);
    return { error };
  }
};

export default { createEcho, generateEchoText };