import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfDay } from 'date-fns';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import MetricCard from '../components/admin/MetricCard';
import CheckInsChart from '../components/admin/CheckInsChart';
import ActiveUsersTable from '../components/admin/ActiveUsersTable';
import { 
  FiBarChart2, 
  FiUsers, 
  FiMessageSquare, 
  FiStar, 
  FiRefreshCw, 
  FiArrowLeft,
  FiActivity,
  FiCalendar,
  FiTrendingUp
} from 'react-icons/fi';

const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalDreams: 0,
    totalCheckIns: 0,
    totalFeedback: 0,
    totalUsers: 0,
    dailyCheckIns: [],
    activeUsers: [],
    recentActivity: []
  });

  const loadAnalyticsData = async () => {
    try {
      // Get total dreams created
      const { count: dreamsCount } = await supabase
        .from('event_logs_analytics_admin')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'dream_saved');

      // Get total check-ins completed
      const { count: checkInsCount } = await supabase
        .from('event_logs_analytics_admin')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'checkin_complete');

      // Get total feedback entries
      const { count: feedbackCount } = await supabase
        .from('event_logs_analytics_admin')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'feedback_opened');

      // Get total unique users
      const { data: uniqueUsers } = await supabase
        .from('event_logs_analytics_admin')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const totalUsers = [...new Set(uniqueUsers?.map(u => u.user_id) || [])].length;

      // Get daily check-ins for the last 7 days
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data: dailyCheckInsData } = await supabase
        .from('event_logs_analytics_admin')
        .select('timestamp')
        .eq('event_name', 'checkin_complete')
        .gte('timestamp', sevenDaysAgo.toISOString());

      // Group by day
      const dailyCheckInsGrouped = {};
      dailyCheckInsData?.forEach(item => {
        const day = format(startOfDay(new Date(item.timestamp)), 'yyyy-MM-dd');
        dailyCheckInsGrouped[day] = (dailyCheckInsGrouped[day] || 0) + 1;
      });

      const dailyCheckIns = Object.entries(dailyCheckInsGrouped).map(([date, count]) => ({
        date,
        count
      }));

      // Get most active users (by event count)
      const { data: userActivityData } = await supabase
        .from('event_logs_analytics_admin')
        .select('user_id, timestamp')
        .not('user_id', 'is', null)
        .order('timestamp', { ascending: false });

      // Group by user and count events
      const userActivity = {};
      userActivityData?.forEach(item => {
        if (!userActivity[item.user_id]) {
          userActivity[item.user_id] = {
            user_id: item.user_id,
            event_count: 0,
            last_activity: item.timestamp
          };
        }
        userActivity[item.user_id].event_count++;
        // Keep the most recent activity (since data is ordered by timestamp desc)
        if (!userActivity[item.user_id].last_activity || 
            new Date(item.timestamp) > new Date(userActivity[item.user_id].last_activity)) {
          userActivity[item.user_id].last_activity = item.timestamp;
        }
      });

      // Get user emails for the most active users
      const activeUsersArray = Object.values(userActivity)
        .sort((a, b) => b.event_count - a.event_count)
        .slice(0, 10);

      // Fetch user emails
      const userIds = activeUsersArray.map(u => u.user_id);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      // Merge email data
      const activeUsersWithEmails = activeUsersArray.map(user => ({
        ...user,
        email: usersData?.find(u => u.id === user.user_id)?.email
      }));

      // Get recent activity for timeline
      const { data: recentActivityData } = await supabase
        .from('event_logs_analytics_admin')
        .select('event_name, timestamp, metadata')
        .order('timestamp', { ascending: false })
        .limit(10);

      setMetrics({
        totalDreams: dreamsCount || 0,
        totalCheckIns: checkInsCount || 0,
        totalFeedback: feedbackCount || 0,
        totalUsers,
        dailyCheckIns,
        activeUsers: activeUsersWithEmails,
        recentActivity: recentActivityData || []
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadAnalyticsData();
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <SafeIcon icon={FiBarChart2} className="mr-3 text-blue-600" />
                Admin Analytics
              </h1>
              <p className="text-gray-600 mt-1">Real-time insights into app usage and user engagement</p>
            </div>
          </div>
          
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
            whileHover={{ scale: refreshing ? 1 : 1.02 }}
            whileTap={{ scale: refreshing ? 1 : 0.98 }}
          >
            <SafeIcon 
              icon={FiRefreshCw} 
              className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
            />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </motion.button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Dreams Created"
            value={metrics.totalDreams.toLocaleString()}
            icon={FiStar}
            color="purple"
            loading={loading}
            subtitle="User visions captured"
          />
          
          <MetricCard
            title="Daily Check-ins"
            value={metrics.totalCheckIns.toLocaleString()}
            icon={FiMessageSquare}
            color="blue"
            loading={loading}
            subtitle="Connection moments"
          />
          
          <MetricCard
            title="Feedback Entries"
            value={metrics.totalFeedback.toLocaleString()}
            icon={FiActivity}
            color="green"
            loading={loading}
            subtitle="User insights shared"
          />
          
          <MetricCard
            title="Active Users"
            value={metrics.totalUsers.toLocaleString()}
            icon={FiUsers}
            color="orange"
            loading={loading}
            subtitle="Engaged community"
          />
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Check-ins Chart */}
          <CheckInsChart 
            data={metrics.dailyCheckIns} 
            loading={loading}
          />
          
          {/* Active Users Table */}
          <ActiveUsersTable 
            data={metrics.activeUsers} 
            loading={loading}
          />
        </div>

        {/* Recent Activity Timeline */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-4">
            <SafeIcon icon={FiCalendar} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center py-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : metrics.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiTrendingUp} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity to display</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <SafeIcon 
                      icon={
                        activity.event_name === 'dream_saved' ? FiStar :
                        activity.event_name === 'checkin_complete' ? FiMessageSquare :
                        activity.event_name === 'feedback_opened' ? FiActivity :
                        FiTrendingUp
                      } 
                      className="w-4 h-4 text-blue-600" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 capitalize">
                      {activity.event_name.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy at h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Analytics data is updated in real-time • Last refreshed: {format(new Date(), 'h:mm a')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboardScreen;