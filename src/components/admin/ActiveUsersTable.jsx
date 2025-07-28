import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import { FiUser, FiActivity } from 'react-icons/fi';

/**
 * ActiveUsersTable Component - Shows most active users based on event count
 */
const ActiveUsersTable = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Active Users</h3>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiActivity} className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Most Active Users</h3>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <SafeIcon icon={FiUser} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No user activity data available</p>
        </div>
      ) : (
        <div className="space-y-1">
          {data.map((user, index) => (
            <motion.div
              key={user.user_id}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">
                    {(user.email || user.user_id).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {user.email ? user.email.split('@')[0] : `User ${user.user_id.slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last active {formatDistanceToNow(new Date(user.last_activity), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{user.event_count}</div>
                <div className="text-xs text-gray-500">events</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActiveUsersTable;