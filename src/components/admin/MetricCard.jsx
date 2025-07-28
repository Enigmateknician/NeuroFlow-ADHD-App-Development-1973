import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * MetricCard Component - Reusable card for displaying analytics metrics
 */
const MetricCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  trend = null, 
  subtitle = null,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    red: 'bg-red-100 text-red-600 border-red-200'
  };

  const bgColors = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50'
  };

  return (
    <motion.div
      className={`${bgColors[color]} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <SafeIcon icon={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <SafeIcon 
              icon={trend.direction === 'up' ? FiTrendingUp : FiTrendingDown} 
              className="w-4 h-4 mr-1" 
            />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded w-24"></div>}
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;