import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaClock,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar,
  FaUserTie,
  FaHistory,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaPercent,
  FaMoneyBillWave,
  FaChartBar,
  FaFilter,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaTimes,
  FaInfoCircle,
  FaCrown,
  FaChartPie,
  FaFire,
  FaStar
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Color scheme
const colors = {
  primary: "#2B1B3F",      // Deep purple
  secondary: "#C9A24D",    // Antique gold
  accent: "#9B7EDE",       // Light purple
  bgLight: "#3A2B4F",      // Lighter purple
  textLight: "#E8D9B0",    // Light gold text
  success: "#10B981",      // Green
  warning: "#F59E0B",      // Yellow
  danger: "#EF4444",       // Red
  background: "#F5F3EB",   // Soft ivory
};

// Stat Card Component - Updated
const StatCard = ({ title, value, icon: Icon, color, change = null, loading = false, onClick = null }) => (
  <div 
    className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border ${
      loading ? 'animate-pulse' : 'border-gray-100'
    } hover:scale-[1.02] hover:border-${color.split('-')[1]}-200`}
    onClick={onClick}
    style={{ 
      borderColor: colors.primary + '10',
      background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: colors.primary + '80' }}>{title}</p>
        <h3 className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>
          {loading ? "..." : value}
        </h3>
        {change !== null && !loading && (
          <div className={`flex items-center mt-2 text-sm font-medium ${
            change > 0 ? 'text-green-600' : 
            change < 0 ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {change > 0 ? <FaArrowUp className="mr-1" /> : 
             change < 0 ? <FaArrowDown className="mr-1" /> : 
             <span className="mr-1">→</span>}
            <span>{Math.abs(change)}%</span>
            <span className="ml-1" style={{ color: colors.primary + '70' }}>from last period</span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-full" style={{ 
        backgroundColor: color + '10',
        color: color
      }}>
        <Icon className="text-2xl" style={{ color: color }} />
      </div>
    </div>
  </div>
);

// Period Card Component - Updated
const PeriodCard = ({ period, data, loading = false, active = false, onClick }) => {
  const getPeriodIcon = (period) => {
    switch (period) {
      case 'today': return FaCalendarDay;
      case 'week': return FaCalendarWeek;
      case 'month': return FaCalendarAlt;
      case 'year': return FaCalendar;
      default: return FaCalendar;
    }
  };
  
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return period;
    }
  };
  
  const getPeriodData = () => {
    if (!data) return {};
    
    if (typeof data === 'object') {
      if (data.earnings !== undefined) {
        return {
          revenue: data.earnings,
          sessions: data.sessions || data.totalSessions || 0,
          users: data.users || data.totalUsers || 0,
          timeMinutes: data.timeMinutes || data.totalTimeMinutes || 0
        };
      }
      
      if (data.revenue !== undefined) {
        return {
          revenue: data.revenue,
          sessions: data.sessions || 0,
          users: data.users || 0,
          timeMinutes: data.timeMinutes || 0
        };
      }
    }
    
    return {};
  };
  
  const periodData = getPeriodData();
  const PeriodIcon = getPeriodIcon(period);

  return (
    <div 
      className={`rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 border ${
        active ? 'border-2 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:scale-[1.01]'
      }`}
      onClick={onClick}
      style={{
        backgroundColor: active ? colors.primary + '08' : 'white',
        borderColor: active ? colors.secondary : colors.primary + '10',
        background: active ? `linear-gradient(135deg, ${colors.primary}05 0%, ${colors.primary}15 100%)` : 'white'
      }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${active ? '' : ''}`}
          style={{
            backgroundColor: active ? colors.secondary + '20' : colors.primary + '10',
            color: active ? colors.secondary : colors.primary + '70'
          }}>
          <PeriodIcon className="text-lg" />
        </div>
        <h4 className={`text-lg font-semibold ${active ? '' : ''}`}
          style={{
            color: active ? colors.primary : colors.primary + '90'
          }}>
          {getPeriodLabel(period)}
        </h4>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Revenue</span>
          <span className="font-bold"
            style={{ color: active ? colors.secondary : colors.success }}>
            {loading ? "..." : formatCurrency(periodData.revenue || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sessions</span>
          <span className="font-semibold" style={{ color: colors.primary }}>
            {loading ? "..." : periodData.sessions || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Users</span>
          <span className="font-semibold" style={{ color: colors.accent }}>
            {loading ? "..." : periodData.users || 0}
          </span>
        </div>
        {(periodData.timeMinutes || 0) > 0 && (
          <div className="flex justify-between items-center pt-2 border-t"
            style={{ borderColor: colors.primary + '20' }}>
            <span className="text-gray-600">Chat Time</span>
            <span className="font-semibold" style={{ color: colors.warning }}>
              {loading ? "..." : `${periodData.timeMinutes || 0} min`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// User Earnings Card Component - Updated
const UserEarningsCard = ({ user, rank, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 group">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
          rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg' : 
          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-200' : 
          rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 border-2 border-orange-200' : 
          'bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-blue-200'
        }`}>
          <span className={`font-bold ${rank <= 3 ? 'text-white' : 'text-white'}`}>
            {rank}
          </span>
          {rank === 1 && (
            <FaCrown className="absolute -top-1 -right-1 text-yellow-300 text-xs" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg truncate" style={{ color: colors.primary }}>
            {user.user?.firstName ? `${user.user.firstName} ${user.user.lastName || ''}`.trim() : 
             user.userName || "Anonymous User"}
          </p>
          <p className="text-sm truncate" style={{ color: colors.primary + '70' }}>
            {user.user?.email || user.userEmail || "No email"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold" style={{ color: colors.success }}>
          {formatCurrency(user.totalEarnings)}
        </p>
        <p className="text-sm mt-1" style={{ color: colors.primary + '60' }}>
          {user.totalSessions || 0} sessions
        </p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
      <div className="text-center p-2 rounded-lg bg-gray-50">
        <p className="font-semibold mb-1" style={{ color: colors.primary + '80' }}>Time</p>
        <p className="font-bold" style={{ color: colors.primary }}>
          {user.totalTimeMinutes || 0} min
        </p>
      </div>
      <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.accent + '10' }}>
        <p className="font-semibold mb-1" style={{ color: colors.accent }}>Avg/Session</p>
        <p className="font-bold" style={{ color: colors.accent }}>
          {formatCurrency(user.avgEarningsPerSession || 0)}
        </p>
      </div>
      <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.secondary + '10' }}>
        <p className="font-semibold mb-1" style={{ color: colors.secondary }}>Frequency</p>
        <p className="font-bold" style={{ color: colors.secondary }}>
          {user.sessionFrequency?.toFixed(1) || 0}/wk
        </p>
      </div>
    </div>
    
    <button
      onClick={() => onViewDetails(user.user?._id)}
      className="w-full px-4 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] group-hover:shadow-md flex items-center justify-center"
      style={{
        backgroundColor: colors.secondary,
        color: colors.primary
      }}
    >
      <FaEye className="mr-2" /> View Details
    </button>
  </div>
);

// Filter Component - Updated
const FilterComponent = ({ filters, onFilterChange, onReset }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-8 p-6 rounded-xl border" 
      style={{ 
        backgroundColor: colors.primary + '05',
        borderColor: colors.primary + '20'
      }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center"
          style={{ color: colors.primary }}>
          <FaFilter className="mr-2" style={{ color: colors.secondary }} />
          Filters & Search
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.secondary + '10',
              color: colors.secondary,
              borderColor: colors.secondary
            }}
          >
            {showFilters ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.danger + '10',
              color: colors.danger,
              borderColor: colors.danger
            }}
          >
            <FaTimes className="mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'white',
              borderColor: colors.primary + '30',
              color: colors.primary,
              focusRingColor: colors.secondary
            }}
          />
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t"
          style={{ borderColor: colors.primary + '20' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primary + '80' }}>
              Date Range
            </label>
            <div className="space-y-2">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => onFilterChange('startDate', date)}
                placeholderText="Start Date"
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'white',
                  borderColor: colors.primary + '30',
                  color: colors.primary,
                  focusRingColor: colors.secondary
                }}
              />
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => onFilterChange('endDate', date)}
                placeholderText="End Date"
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'white',
                  borderColor: colors.primary + '30',
                  color: colors.primary,
                  focusRingColor: colors.secondary
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primary + '80' }}>
              Min Earnings
            </label>
            <input
              type="number"
              placeholder="$ Minimum"
              value={filters.minAmount}
              onChange={(e) => onFilterChange('minAmount', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'white',
                borderColor: colors.primary + '30',
                color: colors.primary,
                focusRingColor: colors.secondary
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primary + '80' }}>
              Min Sessions
            </label>
            <input
              type="number"
              placeholder="Minimum sessions"
              value={filters.minSessions}
              onChange={(e) => onFilterChange('minSessions', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'white',
                borderColor: colors.primary + '30',
                color: colors.primary,
                focusRingColor: colors.secondary
              }}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={onReset}
              className="w-full px-4 py-3 rounded-lg font-medium transition-colors hover:shadow-md"
              style={{
                backgroundColor: colors.secondary,
                color: colors.primary
              }}
            >
              <FaSearch className="mr-2 inline" />
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Format currency helper
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PsychicEarnings = () => {
  const navigate = useNavigate();
  
  // State variables
  const [earningsData, setEarningsData] = useState(null);
  const [userEarnings, setUserEarnings] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('month');
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    minAmount: '',
    minSessions: '',
    searchQuery: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'totalEarnings', direction: 'desc' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Create API instance
  const api = useRef(
    axios.create({
      baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );

  // Add request interceptor to include token
  useEffect(() => {
    const requestInterceptor = api.current.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('psychicToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.current.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('psychicToken');
    if (!token) {
      setError('Please login to view earnings');
      setLoading(false);
      navigate('/psychic/login');
      return;
    }
  }, [navigate]);

  // Fetch earnings data
  const fetchEarningsData = async () => {
    try {
      setError(null);
      const response = await api.current.get('/api/chatrequest/psychic/earnings');
      
      const processedData = processEarningsData(response.data);
      setEarningsData(processedData);
      return { success: true, data: processedData };
    } catch (err) {
      console.error('Error fetching earnings:', err);
      let errorMessage = 'Failed to fetch earnings data';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('psychicToken');
          localStorage.removeItem('psychicData');
          setTimeout(() => navigate('/psychic/login'), 2000);
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Process earnings data
  const processEarningsData = (data) => {
    if (!data) return null;
    
    const processed = { ...data };
    
    if (processed.data) {
      processed.data = {
        ...processed.data,
        summary: processed.data.summary || {
          daily: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          weekly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          monthly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          allTime: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0, totalUsers: 0 }
        }
      };
    } else {
      processed.data = {
        summary: {
          daily: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          weekly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          monthly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
          allTime: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0, totalUsers: 0 }
        },
        userBreakdown: [],
        recentSessions: []
      };
    }
    
    return processed;
  };

  // Fetch user-specific earnings
  const fetchUserEarnings = async (userId) => {
    try {
      setLoading(true);
      const response = await api.current.get(`/api/chatrequest/psychic/earnings/user/${userId}`);
      setUserEarnings(response.data);
      setSelectedUser(response.data.user);
      setShowUserModal(true);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error fetching user earnings:', err);
      setError('Failed to fetch user earnings data');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchEarningsData();
      if (result.success && result.data) {
        console.log('API Response Structure:', result.data);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchEarningsData();
    setRefreshing(false);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      minAmount: '',
      minSessions: '',
      searchQuery: ''
    });
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      console.log('Exporting data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvData = [
        ['Date', 'User', 'Amount', 'Duration', 'Sessions'],
        ...(earningsData?.data?.recentSessions || []).map(session => [
          new Date(session.endedAt).toLocaleDateString(),
          session.user?.firstName || 'Unknown',
          session.amount,
          `${session.durationMinutes} min`,
          1
        ])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Close user modal
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserEarnings(null);
  };

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get data for active period
  const getActivePeriodData = () => {
    if (!earningsData?.data?.summary) return null;
    
    const summary = earningsData.data.summary;
    
    switch (activePeriod) {
      case 'today': 
        return summary.daily || summary.today || { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 };
      case 'week': 
        return summary.weekly || summary.week || { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 };
      case 'month': 
        return summary.monthly || summary.month || { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 };
      case 'year': 
        return summary.allTime || summary.year || summary || { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 };
      default: 
        return summary.monthly || { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 };
    }
  };

  // Filter and sort users
  const getFilteredSortedUsers = () => {
    if (!earningsData?.data?.userBreakdown) return [];
    
    let users = [...earningsData.data.userBreakdown];
    
    if (filters.minAmount) {
      users = users.filter(user => user.totalEarnings >= parseFloat(filters.minAmount));
    }
    
    if (filters.minSessions) {
      users = users.filter(user => (user.totalSessions || 0) >= parseInt(filters.minSessions));
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      users = users.filter(user => 
        user.user?.firstName?.toLowerCase().includes(query) ||
        user.user?.lastName?.toLowerCase().includes(query) ||
        user.user?.email?.toLowerCase().includes(query) ||
        user.userName?.toLowerCase().includes(query)
      );
    }
    
    users.sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
    
    return users;
  };

  // Summary data - with fallback values
  const summary = earningsData?.data?.summary || {
    daily: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
    weekly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
    monthly: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0 },
    allTime: { earnings: 0, sessions: 0, users: 0, timeMinutes: 0, totalUsers: 0 }
  };

  // Ensure allTime has earnings property
  if (summary.allTime && summary.allTime.earnings === undefined) {
    summary.allTime.earnings = summary.allTime.revenue || 0;
  }

  // For backward compatibility
  if (summary.daily && summary.daily.earnings === undefined) {
    summary.daily.earnings = summary.daily.revenue || 0;
  }

  if (summary.weekly && summary.weekly.earnings === undefined) {
    summary.weekly.earnings = summary.weekly.revenue || 0;
  }

  if (summary.monthly && summary.monthly.earnings === undefined) {
    summary.monthly.earnings = summary.monthly.revenue || 0;
  }

  // Active period data
  const activePeriodData = getActivePeriodData();
  const filteredUsers = getFilteredSortedUsers();

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>Earnings Dashboard</h1>
            <p className="text-lg" style={{ color: colors.primary + '80' }}>Track your earnings, analyze trends, and understand your performance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting || !earningsData}
              className="px-4 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: colors.success,
                color: 'white'
              }}
            >
              {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: colors.secondary,
                color: colors.primary
              }}
            >
              {refreshing ? <FaSpinner className="animate-spin" /> : <FaChartBar />}
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg flex justify-between items-center border"
            style={{ 
              backgroundColor: colors.danger + '10',
              borderColor: colors.danger + '30',
              color: colors.danger
            }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:opacity-80">
              ✕
            </button>
          </div>
        )}
      </div>

      {loading && !earningsData ? (
        <div className="text-center py-12">
          <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: colors.secondary }} />
          <p style={{ color: colors.primary + '70' }}>Loading earnings data...</p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Earnings"
              value={formatCurrency(summary.allTime.earnings)}
              icon={FaDollarSign}
              color={colors.success}
              change={calculateGrowth(summary.monthly.earnings, summary.weekly.earnings)}
              loading={loading}
              onClick={() => handlePeriodChange('year')}
            />
            <StatCard
              title="Active Users"
              value={summary.allTime.totalUsers}
              icon={FaUsers}
              color={colors.accent}
              change={calculateGrowth(summary.monthly.users, summary.weekly.users)}
              loading={loading}
            />
            <StatCard
              title="Total Sessions"
              value={summary.allTime.sessions}
              icon={FaChartLine}
              color={colors.secondary}
              change={calculateGrowth(summary.monthly.sessions, summary.weekly.sessions)}
              loading={loading}
            />
            <StatCard
              title="Chat Time"
              value={`${summary.allTime.timeMinutes} min`}
              icon={FaClock}
              color={colors.warning}
              change={calculateGrowth(summary.monthly.timeMinutes, summary.weekly.timeMinutes)}
              loading={loading}
            />
          </div>

          {/* Period Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>Select Period</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['today', 'week', 'month', 'year'].map((period) => (
                <PeriodCard
                  key={period}
                  period={period}
                  data={summary[period === 'today' ? 'daily' : 
                               period === 'week' ? 'weekly' : 
                               period === 'month' ? 'monthly' : 'allTime']}
                  loading={loading}
                  active={activePeriod === period}
                  onClick={() => handlePeriodChange(period)}
                />
              ))}
            </div>
          </div>

          {/* Filters */}
          <FilterComponent 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* User Earnings Table */}
          <div className="rounded-xl shadow-md overflow-hidden mb-8 border"
            style={{ 
              backgroundColor: 'white',
              borderColor: colors.primary + '20'
            }}>
            <div className="p-6 border-b" style={{ borderColor: colors.primary + '20' }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                  <FaUserTie className="inline mr-2" style={{ color: colors.secondary }} />
                  User Earnings
                </h2>
                <div className="text-sm" style={{ color: colors.primary + '70' }}>
                  Showing {filteredUsers.length} of {earningsData?.data?.userBreakdown?.length || 0} users
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary + '20' }}>
                <thead style={{ backgroundColor: colors.primary + '05' }}>
                  <tr>
                    {['rank', 'userName', 'totalEarnings', 'totalSessions', 'totalTimeMinutes', 'avgEarningsPerSession', 'actions'].map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.primary + '70' }}>
                        <button 
                          onClick={() => handleSort(key)}
                          className="flex items-center space-x-1 hover:opacity-80"
                        >
                          <span>{
                            key === 'rank' ? 'Rank' :
                            key === 'userName' ? 'User' :
                            key === 'totalEarnings' ? 'Total Spent' :
                            key === 'totalSessions' ? 'Sessions' :
                            key === 'totalTimeMinutes' ? 'Chat Time' :
                            key === 'avgEarningsPerSession' ? 'Avg/Session' :
                            'Actions'
                          }</span>
                          {sortConfig.key === key && (
                            sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: colors.primary + '10' }}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.user?._id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 
                            index === 1 ? 'bg-gray-100 text-gray-700 border border-gray-300' : 
                            index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 
                            'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-300'
                          }`}>
                            <span className="font-bold">{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)` }}>
                              <span className="font-bold text-white">
                                {user.user?.firstName?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-bold" style={{ color: colors.primary }}>
                                {user.user?.firstName ? `${user.user.firstName} ${user.user.lastName || ''}`.trim() : 'Anonymous User'}
                              </div>
                              <div className="text-sm" style={{ color: colors.primary + '70' }}>
                                {user.user?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold" style={{ color: colors.success }}>
                            {formatCurrency(user.totalEarnings)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold" style={{ color: colors.primary }}>{user.totalSessions}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium" style={{ color: colors.primary }}>
                            {user.totalTimeMinutes || 0} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold" style={{ color: colors.accent }}>
                            {formatCurrency(user.avgEarningsPerSession || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchUserEarnings(user.user?._id)}
                              className="px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                              style={{
                                backgroundColor: colors.secondary + '20',
                                color: colors.secondary
                              }}
                            >
                              Details
                            </button>
                            <button className="px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                              style={{
                                backgroundColor: colors.primary + '10',
                                color: colors.primary
                              }}
                            >
                              Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <FaUserTie className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                        <p style={{ color: colors.primary + '70' }}>No users found</p>
                        <p className="text-sm mt-1" style={{ color: colors.primary + '50' }}>Try adjusting your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Users Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
              <FaCrown className="inline mr-2" style={{ color: colors.secondary }} />
              Top Earning Users
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.slice(0, 6).map((user, index) => (
                <UserEarningsCard
                  key={user.user?._id || index}
                  user={user}
                  rank={index + 1}
                  onViewDetails={(userId) => fetchUserEarnings(userId)}
                />
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          {earningsData?.data?.recentSessions?.length > 0 && (
            <div className="rounded-xl shadow-md p-6 mb-8 border"
              style={{ 
                backgroundColor: 'white',
                borderColor: colors.primary + '20'
              }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                  <FaHistory className="inline mr-2" style={{ color: colors.secondary }} />
                  Recent Sessions
                </h2>
                <button className="font-bold hover:opacity-80 transition-colors"
                  style={{ color: colors.secondary }}>
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {earningsData.data.recentSessions.slice(0, 5).map((session, index) => (
                  <div key={session._id || index} className="pl-4 py-3 rounded-r-lg hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderLeft: `4px solid ${colors.accent}`,
                      backgroundColor: index % 2 === 0 ? colors.primary + '03' : 'transparent'
                    }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold" style={{ color: colors.primary }}>
                          {session.user?.firstName || 'User'} {session.user?.lastName || ''}
                        </p>
                        <p className="text-sm" style={{ color: colors.primary + '70' }}>
                          {session.user?.email || 'No email'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg" style={{ color: colors.success }}>
                          {formatCurrency(session.amount || 0)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm" style={{ color: colors.primary + '60' }}>
                          <span>{session.durationMinutes || 0} min</span>
                          <span>{formatDate(session.endedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Score</h3>
                <FaChartPie className="text-2xl" />
              </div>
              <p className="text-3xl font-bold">Excellent</p>
              <p className="opacity-90 mt-2">Based on your earning trends</p>
            </div>
            
            <div className="rounded-xl p-6 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.success} 0%, #047857 100%)` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Avg Session Value</h3>
                <FaMoneyBillWave className="text-2xl" />
              </div>
              <p className="text-3xl font-bold">
                {summary.allTime.sessions > 0 
                  ? formatCurrency(summary.allTime.earnings / summary.allTime.sessions)
                  : '$0.00'
                }
              </p>
              <p className="opacity-90 mt-2">Per session average</p>
            </div>
            
            <div className="rounded-xl p-6 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, #7C3AED 100%)` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">User Retention</h3>
                <FaUsers className="text-2xl" />
              </div>
              <p className="text-3xl font-bold">
                {filteredUsers.filter(u => (u.totalSessions || 0) > 1).length > 0 
                  ? `${Math.round((filteredUsers.filter(u => (u.totalSessions || 0) > 1).length / filteredUsers.length) * 100)}%`
                  : '0%'
                }
              </p>
              <p className="opacity-90 mt-2">Users with multiple sessions</p>
            </div>
          </div>
        </>
      )}

      {/* User Earnings Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {selectedUser.firstName} {selectedUser.lastName || ''}'s Details
                  </h2>
                  <p style={{ color: colors.primary + '70' }}>{selectedUser.email}</p>
                </div>
                <button
                  onClick={handleCloseUserModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  &times;
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: colors.secondary }} />
                  <p style={{ color: colors.primary + '70' }}>Loading user details...</p>
                </div>
              ) : userEarnings ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="p-6 rounded-lg" style={{ backgroundColor: colors.primary + '05' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)` }}>
                        <span className="text-3xl font-bold text-white">
                          {selectedUser.firstName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.primary }}>
                          {selectedUser.firstName} {selectedUser.lastName || ''}
                        </h3>
                        <p style={{ color: colors.primary + '70' }}>{selectedUser.email}</p>
                        <p className="text-sm mt-1" style={{ color: colors.primary + '60' }}>
                          Member since: {formatDate(selectedUser.joinedDate || selectedUser.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['daily', 'weekly', 'monthly', 'allTime'].map((period) => {
                      const periodData = userEarnings.earnings?.[period];
                      if (!periodData) return null;
                      
                      return (
                        <div key={period} className="border rounded-lg p-4"
                          style={{ 
                            borderColor: colors.primary + '20',
                            backgroundColor: period === 'allTime' ? colors.secondary + '10' : 'white'
                          }}>
                          <div className="text-sm font-bold mb-2 capitalize" 
                            style={{ color: colors.primary + '70' }}>{period}</div>
                          <div className="text-2xl font-bold" style={{ color: colors.success }}>
                            {formatCurrency(periodData.amount || 0)}
                          </div>
                          <div className="text-sm mt-1" style={{ color: colors.primary + '70' }}>
                            {periodData.sessions || 0} sessions
                          </div>
                          {periodData.timeMinutes > 0 && (
                            <div className="text-xs mt-1" style={{ color: colors.primary + '60' }}>
                              {periodData.timeMinutes} min
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleCloseUserModal}
                        className="px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          borderColor: colors.primary + '30',
                          color: colors.primary,
                          backgroundColor: colors.primary + '05'
                        }}
                      >
                        Close
                      </button>
                      <button className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        Export User Report
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p style={{ color: colors.primary + '70' }}>No user data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychicEarnings;