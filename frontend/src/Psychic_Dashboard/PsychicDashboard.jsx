import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { usePsychicAuth } from "../context/PsychicAuthContext";
import axios from "axios";
import {
  FaUsers,
  FaClock,
  FaDollarSign,
  FaChartLine,
  FaUserFriends,
  FaCommentDots,
  FaStar,
  FaChartBar,
  FaSpinner,
  FaChartPie,
  FaMoneyBillWave,
  FaUserTie,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaWallet,
  FaUserCheck,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaCrown,
  FaPhone,
  FaComment
} from "react-icons/fa";

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
  chat: "#3B82F6",         // Blue for chat
  call: "#8B5CF6"          // Purple for call
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, loading, change = null, subtitle = null }) => (
  <div 
    className={`bg-white rounded-xl shadow-md p-6 border ${loading ? 'animate-pulse' : ''}`}
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
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>{subtitle}</p>
        )}
        {change !== null && !loading && (
          <div className={`flex items-center mt-2 text-sm font-medium ${
            change > 0 ? 'text-green-600' : 
            change < 0 ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {change > 0 ? <FaArrowUp className="mr-1" /> : 
             change < 0 ? <FaArrowDown className="mr-1" /> : 
             <FaEquals className="mr-1" />}
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

// Debug Panel Component
const DebugPanel = ({ apiResponse, loading }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!apiResponse || loading) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="mb-2 px-3 py-1 text-sm rounded hover:opacity-90 flex items-center transition-all duration-200"
        style={{
          backgroundColor: colors.secondary,
          color: colors.primary
        }}
      >
        <FaExclamationTriangle className="mr-2" />
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      
      {showDebug && (
        <div className="p-4 rounded-lg text-sm font-mono overflow-auto max-h-96"
          style={{ 
            backgroundColor: colors.primary + '10',
            borderColor: colors.secondary + '50',
            borderWidth: '1px',
            color: colors.primary + '90'
          }}>
          <h4 className="font-bold mb-2" style={{ color: colors.secondary }}>API Response:</h4>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
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

export default function PsychicDashboard() {
  const { psychic } = usePsychicAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables
  const [dashboardData, setDashboardData] = useState({
    today: { earnings: 0, chatEarnings: 0, callEarnings: 0, sessions: 0, chatSessions: 0, callSessions: 0 },
    week: { earnings: 0, chatEarnings: 0, callEarnings: 0, sessions: 0, chatSessions: 0, callSessions: 0 },
    month: { earnings: 0, chatEarnings: 0, callEarnings: 0, sessions: 0, chatSessions: 0, callSessions: 0 },
    allTime: { earnings: 0, chatEarnings: 0, callEarnings: 0, sessions: 0, chatSessions: 0, callSessions: 0, totalUsers: 0 },
    userBreakdown: [],
    recentSessions: []
  });
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const isDashboardHome = location.pathname === '/psychic/dashboard';

  // Create API instance
  const api = useRef(
    axios.create({
      baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );

  // Add request interceptor
  useEffect(() => {
    const requestInterceptor = api.current.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('psychicToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.current.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('psychicToken');
    if (!token) {
      setError('Please login to access the dashboard');
      setLoading(false);
      navigate('/psychic/login');
      return;
    }
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      const response = await api.current.get('/api/chatrequest/psychic/earnings');
      
      if (response.data && response.data.success) {
        setApiResponse(response.data);
        const processedData = processApiResponse(response.data);
        setDashboardData(processedData);
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Use mock data as fallback
      const mockData = createMockData();
      setDashboardData(mockData);
      
      let errorMessage = 'Using demo data - ' + (err.message || 'Failed to fetch data');
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('psychicToken');
        localStorage.removeItem('psychicData');
        setTimeout(() => navigate('/psychic/login'), 2000);
      }
      
      setError(errorMessage);
      return { success: false };
    }
  };

  // Process API response
  const processApiResponse = (response) => {
    const d = response.data;
    
    if (!d || !d.summary) {
      return createMockData();
    }
    
    return {
      today: {
        earnings: d.summary.daily?.earnings || 0,
        chatEarnings: d.summary.daily?.chatEarnings || 0,
        callEarnings: d.summary.daily?.callEarnings || 0,
        sessions: d.summary.daily?.sessions || 0,
        chatSessions: d.summary.daily?.chatSessions || 0,
        callSessions: d.summary.daily?.callSessions || 0
      },
      week: {
        earnings: d.summary.weekly?.earnings || 0,
        chatEarnings: d.summary.weekly?.chatEarnings || 0,
        callEarnings: d.summary.weekly?.callEarnings || 0,
        sessions: d.summary.weekly?.sessions || 0,
        chatSessions: d.summary.weekly?.chatSessions || 0,
        callSessions: d.summary.weekly?.callSessions || 0
      },
      month: {
        earnings: d.summary.monthly?.earnings || 0,
        chatEarnings: d.summary.monthly?.chatEarnings || 0,
        callEarnings: d.summary.monthly?.callEarnings || 0,
        sessions: d.summary.monthly?.sessions || 0,
        chatSessions: d.summary.monthly?.chatSessions || 0,
        callSessions: d.summary.monthly?.callSessions || 0
      },
      allTime: {
        earnings: d.summary.allTime?.earnings || 0,
        chatEarnings: d.summary.allTime?.chatEarnings || 0,
        callEarnings: d.summary.allTime?.callEarnings || 0,
        sessions: d.summary.allTime?.sessions || 0,
        chatSessions: d.summary.allTime?.chatSessions || 0,
        callSessions: d.summary.allTime?.callSessions || 0,
        totalUsers: d.summary.allTime?.totalUsers || 0
      },
      userBreakdown: d.userBreakdown || [],
      recentSessions: (d.recentSessions || []).map(s => ({
        ...s,
        type: s.type || (s.totalCreditsUsed ? 'call' : 'chat')
      }))
    };
  };

  // Create mock data
  const createMockData = () => {
    return {
      today: {
        earnings: 6.65,
        chatEarnings: 0.65,
        callEarnings: 6.00,
        sessions: 2,
        chatSessions: 1,
        callSessions: 1
      },
      week: {
        earnings: 6.65,
        chatEarnings: 0.65,
        callEarnings: 6.00,
        sessions: 2,
        chatSessions: 1,
        callSessions: 1
      },
      month: {
        earnings: 6.65,
        chatEarnings: 0.65,
        callEarnings: 6.00,
        sessions: 2,
        chatSessions: 1,
        callSessions: 1
      },
      allTime: {
        earnings: 6.65,
        chatEarnings: 0.65,
        callEarnings: 6.00,
        sessions: 2,
        chatSessions: 1,
        callSessions: 1,
        totalUsers: 1
      },
      userBreakdown: [
        {
          user: { _id: '1', firstName: 'Zia', lastName: '', email: 'zia@gmail.com' },
          totalEarnings: 6.65,
          chatEarnings: 0.65,
          callEarnings: 6.00,
          totalSessions: 2,
          chatSessions: 1,
          callSessions: 1,
          totalTimeMinutes: 1,
          avgEarningsPerSession: 3.32
        }
      ],
      recentSessions: [
        {
          _id: '1',
          type: 'chat',
          user: { firstName: 'Zia', email: 'zia@gmail.com' },
          amount: 0.65,
          durationMinutes: 1,
          endedAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'call',
          user: { firstName: 'Zia', email: 'zia@gmail.com' },
          amount: 6.00,
          durationMinutes: 0,
          endedAt: new Date().toISOString()
        }
      ]
    };
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };

    if (isDashboardHome) {
      loadData();
    }
  }, [isDashboardHome]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const todayGrowth = calculateGrowth(dashboardData.today.earnings, dashboardData.today.earnings * 0.8);
  const weekGrowth = calculateGrowth(dashboardData.week.earnings, dashboardData.week.earnings * 0.7);

  // Get user rank color
  const getUserRankColor = (index) => {
    switch(index) {
      case 0: return `bg-yellow-100 text-yellow-700 border-yellow-300`;
      case 1: return `bg-gray-100 text-gray-700 border-gray-300`;
      case 2: return `bg-orange-100 text-orange-700 border-orange-300`;
      default: return `bg-blue-100 text-blue-700 border-blue-300`;
    }
  };

  // Calculate session mix percentages
  const totalSessions = dashboardData.allTime.sessions;
  const chatPercentage = totalSessions > 0 ? Math.round((dashboardData.allTime.chatSessions / totalSessions) * 100) : 0;
  const callPercentage = totalSessions > 0 ? Math.round((dashboardData.allTime.callSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {isDashboardHome && (
        <>
          {/* Header */}
          <div className="shadow-sm border-b">
            <div className="px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>Earnings Dashboard</h1>
                  <p className="mt-1" style={{ color: colors.textLight }}>
                    Welcome back, <span className="font-semibold" style={{ color: colors.secondary }}>{psychic?.name || 'Psychic'}</span>!
                    {dashboardData.allTime.earnings > 0 && (
                      <span className="ml-2 font-medium" style={{ color: colors.success }}>
                        Total: {formatCurrency(dashboardData.allTime.earnings)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
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
              
              {/* Tabs */}
              <div className="flex gap-1 mt-6 border-b overflow-x-auto" style={{ borderColor: colors.primary + '50' }}>
                {['overview', 'users', 'sessions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-bold capitalize transition-colors whitespace-nowrap relative ${
                      activeTab === tab
                        ? 'text-white'
                        : `hover:text-white ${colors.textLight}`
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: colors.secondary }}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Debug Panel */}
            <DebugPanel apiResponse={apiResponse} loading={loading} />

            {/* Error Display */}
            {error && (
              <div className="mb-6">
                <div className={`px-4 py-3 rounded-lg flex justify-between items-center border ${
                  error.includes('demo') 
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                    : 'border-red-300 bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    <span>{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="ml-4 hover:opacity-70">✕</button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: colors.secondary }} />
                <p style={{ color: colors.primary + '70' }}>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <>
                    {/* Session Type Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: colors.chat + '30' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: colors.chat + '20' }}>
                            <FaComment className="text-xl" style={{ color: colors.chat }} />
                          </div>
                          <h3 className="text-lg font-bold" style={{ color: colors.primary }}>Chat Sessions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm" style={{ color: colors.primary + '70' }}>Earnings</p>
                            <p className="text-2xl font-bold" style={{ color: colors.chat }}>
                              {formatCurrency(dashboardData.allTime.chatEarnings)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: colors.primary + '70' }}>Sessions</p>
                            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {dashboardData.allTime.chatSessions}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: colors.call + '30' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: colors.call + '20' }}>
                            <FaPhone className="text-xl" style={{ color: colors.call }} />
                          </div>
                          <h3 className="text-lg font-bold" style={{ color: colors.primary }}>Call Sessions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm" style={{ color: colors.primary + '70' }}>Earnings</p>
                            <p className="text-2xl font-bold" style={{ color: colors.call }}>
                              {formatCurrency(dashboardData.allTime.callEarnings)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: colors.primary + '70' }}>Sessions</p>
                            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {dashboardData.allTime.callSessions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatCard
                        title="Today's Earnings"
                        value={formatCurrency(dashboardData.today.earnings)}
                        icon={FaMoneyBillWave}
                        color={colors.success}
                        loading={loading}
                        change={todayGrowth}
                        subtitle={`Chat: ${formatCurrency(dashboardData.today.chatEarnings)} • Call: ${formatCurrency(dashboardData.today.callEarnings)}`}
                      />
                      <StatCard
                        title="This Week"
                        value={formatCurrency(dashboardData.week.earnings)}
                        icon={FaChartLine}
                        color={colors.accent}
                        loading={loading}
                        change={weekGrowth}
                        subtitle={`Chat: ${formatCurrency(dashboardData.week.chatEarnings)} • Call: ${formatCurrency(dashboardData.week.callEarnings)}`}
                      />
                      <StatCard
                        title="Total Users"
                        value={dashboardData.allTime.totalUsers}
                        icon={FaUserFriends}
                        color={colors.secondary}
                        loading={loading}
                      />
                      <StatCard
                        title="Total Sessions"
                        value={dashboardData.allTime.sessions}
                        icon={FaClock}
                        color={colors.warning}
                        loading={loading}
                        subtitle={`Chat: ${dashboardData.allTime.chatSessions} • Call: ${dashboardData.allTime.callSessions}`}
                      />
                    </div> */}

                    {/* Top Users & Recent Sessions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Top Users */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ borderColor: colors.primary + '20' }}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                              <FaCrown className="inline mr-2" style={{ color: colors.secondary }} />
                              Top Earning Users
                            </h2>
                          </div>
                          <div className="space-y-4">
                            {dashboardData.userBreakdown.length > 0 ? (
                              dashboardData.userBreakdown.slice(0, 5).map((user, index) => (
                                <div key={user.user?._id || index} 
                                  className="bg-white rounded-lg border p-4 hover:bg-gray-50 transition-all"
                                  style={{ borderColor: colors.primary + '20' }}>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getUserRankColor(index)} relative`}>
                                        <span className="font-bold">{index + 1}</span>
                                        {index === 0 && <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />}
                                      </div>
                                      <div>
                                        <p className="font-bold" style={{ color: colors.primary }}>
      {user.user?.username || user.userName || 'Anonymous User'}
    </p>
                                        <p className="text-sm" style={{ color: colors.primary + '70' }}>
                                          {user.user?.email || 'No email'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-lg" style={{ color: colors.success }}>
                                        {formatCurrency(user.totalEarnings || 0)}
                                      </p>
                                      <p className="text-sm" style={{ color: colors.primary + '70' }}>
                                        {user.totalSessions || 0} sessions
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Chat/Call Breakdown */}
                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="text-xs p-2 rounded" style={{ backgroundColor: colors.chat + '10' }}>
                                      <span className="font-medium" style={{ color: colors.chat }}>Chat:</span>
                                      <span className="ml-2" style={{ color: colors.primary }}>
                                        {formatCurrency(user.chatEarnings || 0)} ({user.chatSessions || 0})
                                      </span>
                                    </div>
                                    <div className="text-xs p-2 rounded" style={{ backgroundColor: colors.call + '10' }}>
                                      <span className="font-medium" style={{ color: colors.call }}>Call:</span>
                                      <span className="ml-2" style={{ color: colors.primary }}>
                                        {formatCurrency(user.callEarnings || 0)} ({user.callSessions || 0})
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-sm"
                                    style={{ borderColor: colors.primary + '10' }}>
                                    <div>
                                      <p className="font-semibold mb-1" style={{ color: colors.primary + '80' }}>Time</p>
                                      <p className="font-bold" style={{ color: colors.primary }}>
                                        {user.totalTimeMinutes || 0} min
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold mb-1" style={{ color: colors.accent }}>Avg/Session</p>
                                      <p className="font-bold" style={{ color: colors.accent }}>
                                        {formatCurrency(user.avgEarningsPerSession || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold mb-1" style={{ color: colors.secondary }}>Frequency</p>
                                      <p className="font-bold" style={{ color: colors.secondary }}>
                                        {((user.totalSessions || 0) / 4).toFixed(1)}/wk
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <FaUserFriends className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                                <p style={{ color: colors.primary + '70' }}>No user data available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recent Sessions & Stats */}
                      <div className="space-y-6">
                        {/* Recent Sessions */}
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ borderColor: colors.primary + '20' }}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                              <FaHistory className="inline mr-2" style={{ color: colors.accent }} />
                              Recent Sessions
                            </h2>
                          </div>
                          <div className="space-y-4">
                            {dashboardData.recentSessions.length > 0 ? (
                              dashboardData.recentSessions.slice(0, 5).map((session, index) => {
                                const sessionColor = session.type === 'call' ? colors.call : colors.chat;
                                const SessionIcon = session.type === 'call' ? FaPhone : FaComment;
                                
                                return (
                                  <div key={session._id || index} 
                                    className="pl-4 py-3 rounded-r hover:bg-gray-50 transition-colors"
                                    style={{ 
                                      borderLeft: `4px solid ${sessionColor}`,
                                      backgroundColor: index % 2 === 0 ? colors.primary + '03' : 'transparent'
                                    }}>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <SessionIcon className="text-xs" style={{ color: sessionColor }} />
                                          <p className="font-bold" style={{ color: colors.primary }}>
                                            {session.user?.username || 'User'}
                                          </p>
                                        </div>
                                        <p className="text-xs" style={{ color: colors.primary + '60' }}>
                                          {session.type === 'call' ? 'Call' : 'Chat'} • {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : 'Recent'}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold" style={{ color: colors.success }}>
                                          {formatCurrency(session.amount || 0)}
                                        </p>
                                        <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                          {session.durationMinutes || 0} min
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-4">
                                <p style={{ color: colors.primary + '70' }}>No recent sessions</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Session Mix Stats */}
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ borderColor: colors.primary + '20' }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
                            <FaChartPie className="inline mr-2" style={{ color: colors.secondary }} />
                            Session Mix
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span style={{ color: colors.chat }}>Chat Sessions</span>
                                <span className="font-bold" style={{ color: colors.chat }}>
                                  {chatPercentage}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.primary + '20' }}>
                                <div className="h-full" style={{ 
                                  backgroundColor: colors.chat,
                                  width: `${chatPercentage}%` 
                                }}></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span style={{ color: colors.call }}>Call Sessions</span>
                                <span className="font-bold" style={{ color: colors.call }}>
                                  {callPercentage}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.primary + '20' }}>
                                <div className="h-full" style={{ 
                                  backgroundColor: colors.call,
                                  width: `${callPercentage}%` 
                                }}></div>
                              </div>
                              <p className="text-xs mt-2" style={{ color: colors.primary + '60' }}>
                                {dashboardData.allTime.chatSessions} chats • {dashboardData.allTime.callSessions} calls
                              </p>
                            </div>
                            
                            <div className="pt-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                              <div className="flex justify-between items-center mb-2">
                                <span style={{ color: colors.primary + '70' }}>Avg Session Value</span>
                                <span className="font-bold" style={{ color: colors.accent }}>
                                  {dashboardData.allTime.sessions > 0 
                                    ? formatCurrency(dashboardData.allTime.earnings / dashboardData.allTime.sessions)
                                    : '$0.00'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                              <div className="flex justify-between items-center mb-2">
                                <span style={{ color: colors.primary + '70' }}>User Retention</span>
                                <span className="font-bold" style={{ color: colors.secondary }}>
                                  {dashboardData.userBreakdown.filter(u => (u.totalSessions || 0) > 1).length > 0 
                                    ? `${Math.round((dashboardData.userBreakdown.filter(u => (u.totalSessions || 0) > 1).length / dashboardData.userBreakdown.length) * 100)}%`
                                    : '0%'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                  <div className="bg-white rounded-xl shadow-md p-6 border"
                    style={{ borderColor: colors.primary + '20' }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                      <FaUserTie className="inline mr-2" style={{ color: colors.secondary }} />
                      User Analytics
                    </h2>
                    
                    {dashboardData.userBreakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: colors.primary + '20' }}>
                          <thead style={{ backgroundColor: colors.primary + '05' }}>
                            <tr>
                              {['Rank', 'User', 'Total', 'Chat', 'Call', 'Sessions', 'Time', 'Avg/Session'].map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                                  style={{ color: colors.primary + '70' }}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: colors.primary + '10' }}>
                            {dashboardData.userBreakdown.map((user, index) => (
                              <tr key={user.user?._id || index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getUserRankColor(index)} relative`}>
                                    <span className="font-bold">{index + 1}</span>
                                    {index === 0 && <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                 <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)` }}>
      <span className="font-bold text-white">
        {user.user?.username?.[0]?.toUpperCase() || user.user?.email?.[0]?.toUpperCase() || 'U'}
      </span>
    </div>
    <div className="ml-4">
      <div className="font-bold" style={{ color: colors.primary }}>
        {user.user?.username || 'Anonymous User'}
      </div>
      <div className="text-sm" style={{ color: colors.primary + '70' }}>
        {user.user?.email || 'No email'}
      </div>
    </div>
  </div>
</td>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-lg font-bold" style={{ color: colors.success }}>
                                    {formatCurrency(user.totalEarnings || 0)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium" style={{ color: colors.chat }}>
                                    {formatCurrency(user.chatEarnings || 0)}
                                  </div>
                                  <div className="text-xs" style={{ color: colors.primary + '60' }}>
                                    {user.chatSessions || 0} sess
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium" style={{ color: colors.call }}>
                                    {formatCurrency(user.callEarnings || 0)}
                                  </div>
                                  <div className="text-xs" style={{ color: colors.primary + '60' }}>
                                    {user.callSessions || 0} sess
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold" style={{ color: colors.primary }}>{user.totalSessions || 0}</div>
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaUserFriends className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                        <p style={{ color: colors.primary + '70' }}>No user data available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sessions Tab */}
                {activeTab === "sessions" && (
                  <div className="bg-white rounded-xl shadow-md p-6 border"
                    style={{ borderColor: colors.primary + '20' }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                      <FaHistory className="inline mr-2" style={{ color: colors.secondary }} />
                      Session History
                    </h2>
                    
                    {dashboardData.recentSessions.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.recentSessions.map((session, index) => {
                          const sessionColor = session.type === 'call' ? colors.call : colors.chat;
                          const SessionIcon = session.type === 'call' ? FaPhone : FaComment;
                          
                          return (
                            <div key={session._id || index} 
                              className="p-4 rounded-lg hover:scale-[1.01] transition-all duration-300 border"
                              style={{ 
                                borderColor: sessionColor + '30',
                                backgroundColor: colors.primary + '02'
                              }}>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: sessionColor + '20' }}>
                                    <SessionIcon className="" style={{ color: sessionColor }} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold" style={{ color: colors.primary }}>
                                      {session.user?.username || 'User'} {session.user?.lastname || ''}
                                    </h4>
                                    <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                      {session.type === 'call' ? 'Call Session' : 'Chat Session'} • {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : 'Date unknown'}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm mt-2" style={{ color: colors.primary + '70' }}>
                                      <span className="flex items-center">
                                        <FaClock className="mr-1" /> {session.durationMinutes || 0} min
                                      </span>
                                      <span className="flex items-center">
                                        <FaMoneyBillWave className="mr-1" /> {formatCurrency(session.amount || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs" style={{ color: colors.primary + '50' }}>
                                  {session.endedAt ? new Date(session.endedAt).toLocaleTimeString() : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaHistory className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                        <p style={{ color: colors.primary + '70' }}>No session history</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      {!isDashboardHome && <Outlet />}
    </div>
  );
}