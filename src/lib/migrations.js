import supabase from './supabase';

/**
 * Create the sparks table if it doesn't exist.
 * This function is called by the SparkCatcherScreen component when needed.
 */
export const createSparksTable = async () => {
  try {
    await supabase.rpc('create_sparks_table_if_not_exists');
    console.log('Sparks table created or verified');
    return { success: true };
  } catch (error) {
    console.error('Error creating sparks table:', error);
    return { success: false, error };
  }
};

/**
 * Register RPC functions with Supabase.
 * This should be called once during app initialization.
 */
export const registerRpcFunctions = async () => {
  try {
    // Create function to create users table if it doesn't exist
    await supabase.rpc('create_rpc_functions');
    console.log('RPC functions registered');
    return { success: true };
  } catch (error) {
    console.error('Error registering RPC functions:', error);
    return { success: false, error };
  }
};

export default {
  createSparksTable,
  registerRpcFunctions
};