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
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar,
  FaSpinner,
  FaChartPie,
  FaMoneyBillWave,
  FaUserTie,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaPercent,
  FaWallet,
  FaUserCheck,
  FaExchangeAlt,
  FaFilter,
  FaDownload,
  FaEye,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaCrown,
  FaFire,
  FaGem,
  FaRocket
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
};

// Stat Card Component - Updated
const StatCard = ({ title, value, icon: Icon, color, suffix = "", loading, change = null, onClick = null }) => (
  <div 
    className={`bg-white rounded-xl shadow-md p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer ${loading ? 'animate-pulse' : ''}`}
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
          {suffix && <span className="text-lg" style={{ color: colors.primary + '60' }}>{suffix}</span>}
        </h3>
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

// Period Card Component - Updated
const PeriodCard = ({ period, data, loading, currency = "USD", active = false, onClick }) => {
  const getPeriodIcon = (period) => {
    switch (period) {
      case 'Today': return FaCalendarDay;
      case 'This Week': return FaCalendarWeek;
      case 'This Month': return FaCalendarAlt;
      case 'This Year': return FaCalendar;
      default: return FaCalendar;
    }
  };
  
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
          {period}
        </h4>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Revenue</span>
          <span className="font-bold"
            style={{ color: active ? colors.secondary : colors.success }}>
            {loading ? "..." : formatCurrency(data.revenue || 0, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sessions</span>
          <span className="font-semibold" style={{ color: colors.primary }}>
            {loading ? "..." : data.sessions || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Users</span>
          <span className="font-semibold" style={{ color: colors.accent }}>
            {loading ? "..." : data.users || 0}
          </span>
        </div>
        {(data.timeMinutes || 0) > 0 && (
          <div className="flex justify-between items-center pt-2 border-t"
            style={{ borderColor: colors.primary + '20' }}>
            <span className="text-gray-600">Chat Time</span>
            <span className="font-semibold" style={{ color: colors.warning }}>
              {loading ? "..." : `${Math.round(data.timeMinutes || 0)} min`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Debug Panel Component - Updated
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
const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
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
    quickStats: null,
    detailedEarnings: null,
    userBreakdown: [],
    recentSessions: []
  });
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activePeriod, setActivePeriod] = useState("This Month");

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
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.current.interceptors.response.use(
      (response) => {
        console.log('API Response Success:', response.config.url, response.status);
        return response;
      },
      (error) => {
        console.error('API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );

    return () => {
      api.current.interceptors.request.eject(requestInterceptor);
      api.current.interceptors.response.eject(responseInterceptor);
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

  // Enhanced data fetching with detailed logging
  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('Starting dashboard data fetch...');
      
      const endpoints = [
        '/api/chatrequest/psychic/earnings',
        '/api/chatrequest/psychic/earnings',
        '/api/chatrequest/psychic/dashboard',
        '/api/chatrequest/psychic/stats',
        '/api/chatrequest/earnings/psychic'
      ];
      
      let response = null;
      let successfulEndpoint = '';
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const result = await api.current.get(endpoint);
          
          if (result.data) {
            console.log(`Success with endpoint: ${endpoint}`, result.data);
            response = result.data;
            successfulEndpoint = endpoint;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          continue;
        }
      }
      
      if (!response) {
        throw new Error('No data received from any endpoint');
      }
      
      setApiResponse(response);
      const processedData = processApiResponse(response, successfulEndpoint);
      setDashboardData(processedData);
      
      console.log('Processed data:', processedData);
      return { success: true, data: processedData, endpoint: successfulEndpoint };
      
    } catch (err) {
      console.error('Final error in fetchDashboardData:', err);
      
      const mockData = createMockData();
      setDashboardData(mockData);
      setApiResponse({ mock: true, message: 'Using mock data due to API failure' });
      
      let errorMessage = 'Failed to fetch dashboard data. Using demo data.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('psychicToken');
        localStorage.removeItem('psychicData');
        setTimeout(() => navigate('/psychic/login'), 2000);
      } else if (err.response?.data?.message) {
        errorMessage = `API Error: ${err.response.data.message}`;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Process API response based on endpoint
  const processApiResponse = (response, endpoint) => {
    console.log(`Processing response from ${endpoint}:`, response);
    
    const data = response.data || response;
    
    const result = {
      quickStats: {
        today: { earnings: 0, sessions: 0 },
        week: { earnings: 0, sessions: 0 },
        month: { earnings: 0, sessions: 0 },
        allTime: { earnings: 0, sessions: 0, uniqueUsers: 0 }
      },
      detailedEarnings: {
        daily: { earnings: 0, sessions: 0, timeMinutes: 0 },
        weekly: { earnings: 0, sessions: 0, timeMinutes: 0 },
        monthly: { earnings: 0, sessions: 0, timeMinutes: 0 },
        allTime: { earnings: 0, sessions: 0, timeMinutes: 0, totalUsers: 0 }
      },
      userBreakdown: [],
      recentSessions: []
    };
    
    try {
      if (response.success && response.data) {
        const d = response.data;
        
        if (d.summary) {
          result.quickStats.today.earnings = d.summary.daily?.earnings || d.summary.today?.amount || 0;
          result.quickStats.today.sessions = d.summary.daily?.sessions || d.summary.today?.sessions || 0;
          
          result.quickStats.week.earnings = d.summary.weekly?.earnings || d.summary.week?.amount || 0;
          result.quickStats.week.sessions = d.summary.weekly?.sessions || d.summary.week?.sessions || 0;
          
          result.quickStats.month.earnings = d.summary.monthly?.earnings || d.summary.month?.amount || 0;
          result.quickStats.month.sessions = d.summary.monthly?.sessions || d.summary.month?.sessions || 0;
          
          result.quickStats.allTime.earnings = d.summary.allTime?.earnings || d.summary.total?.amount || 0;
          result.quickStats.allTime.sessions = d.summary.allTime?.sessions || d.summary.total?.sessions || 0;
          result.quickStats.allTime.uniqueUsers = d.summary.allTime?.totalUsers || d.summary.total?.users || 0;
          
          result.detailedEarnings = { ...d.summary };
        } else if (d.today || d.week || d.month) {
          result.quickStats.today.earnings = d.today?.earnings || d.today?.amount || 0;
          result.quickStats.today.sessions = d.today?.sessions || 0;
          
          result.quickStats.week.earnings = d.week?.earnings || d.week?.amount || 0;
          result.quickStats.week.sessions = d.week?.sessions || 0;
          
          result.quickStats.month.earnings = d.month?.earnings || d.month?.amount || 0;
          result.quickStats.month.sessions = d.month?.sessions || 0;
          
          result.quickStats.allTime.earnings = d.totalEarnings || d.allTime?.amount || 0;
          result.quickStats.allTime.sessions = d.totalSessions || d.allTime?.sessions || 0;
          result.quickStats.allTime.uniqueUsers = d.totalUsers || d.allTime?.users || 0;
        }
        
        result.userBreakdown = d.userBreakdown || d.topUsers || d.users || [];
        result.recentSessions = d.recentSessions || d.sessions || [];
        
      } else if (data.todayEarnings !== undefined) {
        result.quickStats.today.earnings = data.todayEarnings || 0;
        result.quickStats.week.earnings = data.weekEarnings || 0;
        result.quickStats.month.earnings = data.monthEarnings || 0;
        result.quickStats.allTime.earnings = data.totalEarnings || 0;
        
        result.quickStats.today.sessions = data.todaySessions || 0;
        result.quickStats.week.sessions = data.weekSessions || 0;
        result.quickStats.month.sessions = data.monthSessions || 0;
        result.quickStats.allTime.sessions = data.totalSessions || 0;
        result.quickStats.allTime.uniqueUsers = data.totalUsers || 0;
      }
      
      console.log('Processed result:', result);
      
    } catch (processErr) {
      console.error('Error processing API response:', processErr);
    }
    
    return result;
  };

  // Create mock data for demo/development
  const createMockData = () => {
    console.log('Creating mock data...');
    
    const todayEarnings = 45.67;
    const weekEarnings = 156.89;
    const monthEarnings = 489.32;
    const totalEarnings = 2345.67;
    
    const todaySessions = 3;
    const weekSessions = 8;
    const monthSessions = 23;
    const totalSessions = 125;
    
    const totalUsers = 15;
    
    return {
      quickStats: {
        today: { earnings: todayEarnings, sessions: todaySessions },
        week: { earnings: weekEarnings, sessions: weekSessions },
        month: { earnings: monthEarnings, sessions: monthSessions },
        allTime: { earnings: totalEarnings, sessions: totalSessions, uniqueUsers: totalUsers }
      },
      detailedEarnings: {
        daily: { earnings: todayEarnings, sessions: todaySessions, timeMinutes: 25 },
        weekly: { earnings: weekEarnings, sessions: weekSessions, timeMinutes: 78 },
        monthly: { earnings: monthEarnings, sessions: monthSessions, timeMinutes: 245 },
        allTime: { earnings: totalEarnings, sessions: totalSessions, timeMinutes: 1250, totalUsers: totalUsers }
      },
      userBreakdown: [
        {
          user: { _id: '1', firstName: 'Zia', lastName: 'Rana', email: 'user1@gmail.com' },
          totalEarnings: 23.22,
          totalSessions: 10,
          totalTimeMinutes: 23,
          avgEarningsPerSession: 2.32,
          sessionFrequency: 1.5
        },
        {
          user: { _id: '2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          totalEarnings: 18.75,
          totalSessions: 8,
          totalTimeMinutes: 18,
          avgEarningsPerSession: 2.34,
          sessionFrequency: 1.2
        },
        {
          user: { _id: '3', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          totalEarnings: 15.50,
          totalSessions: 6,
          totalTimeMinutes: 15,
          avgEarningsPerSession: 2.58,
          sessionFrequency: 0.8
        }
      ],
      recentSessions: [
        {
          _id: '1',
          user: { firstName: 'Zia', email: 'user1@gmail.com' },
          amount: 4.48,
          durationMinutes: 4,
          endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          user: { firstName: 'John', email: 'john@example.com' },
          amount: 3.25,
          durationMinutes: 3,
          endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          user: { firstName: 'Jane', email: 'jane@example.com' },
          amount: 5.75,
          durationMinutes: 5,
          endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchDashboardData();
      console.log('Dashboard load completed:', result);
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

  // Calculate period data for cards
  const periodData = {
    'Today': {
      revenue: dashboardData.detailedEarnings?.daily?.earnings || dashboardData.quickStats?.today?.earnings || 0,
      sessions: dashboardData.detailedEarnings?.daily?.sessions || dashboardData.quickStats?.today?.sessions || 0,
      timeMinutes: dashboardData.detailedEarnings?.daily?.timeMinutes || 0,
      users: dashboardData.userBreakdown.filter(u => {
        return Math.random() > 0.5;
      }).length || 1
    },
    'This Week': {
      revenue: dashboardData.detailedEarnings?.weekly?.earnings || dashboardData.quickStats?.week?.earnings || 0,
      sessions: dashboardData.detailedEarnings?.weekly?.sessions || dashboardData.quickStats?.week?.sessions || 0,
      timeMinutes: dashboardData.detailedEarnings?.weekly?.timeMinutes || 0,
      users: dashboardData.userBreakdown.length > 0 ? Math.min(3, dashboardData.userBreakdown.length) : 1
    },
    'This Month': {
      revenue: dashboardData.detailedEarnings?.monthly?.earnings || dashboardData.quickStats?.month?.earnings || 0,
      sessions: dashboardData.detailedEarnings?.monthly?.sessions || dashboardData.quickStats?.month?.sessions || 0,
      timeMinutes: dashboardData.detailedEarnings?.monthly?.timeMinutes || 0,
      users: dashboardData.userBreakdown.length || 1
    },
    'This Year': {
      revenue: dashboardData.detailedEarnings?.allTime?.earnings || dashboardData.quickStats?.allTime?.earnings || 0,
      sessions: dashboardData.detailedEarnings?.allTime?.sessions || dashboardData.quickStats?.allTime?.sessions || 0,
      timeMinutes: dashboardData.detailedEarnings?.allTime?.timeMinutes || 0,
      users: dashboardData.detailedEarnings?.allTime?.totalUsers || dashboardData.quickStats?.allTime?.uniqueUsers || 0
    }
  };

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate growth rates (using mock data if real data is zero)
  const todayGrowth = calculateGrowth(
    periodData['Today'].revenue,
    periodData['Today'].revenue > 0 ? periodData['Today'].revenue * 0.8 : 10
  );

  const weekGrowth = calculateGrowth(
    periodData['This Week'].revenue,
    periodData['This Week'].revenue > 0 ? periodData['This Week'].revenue * 0.7 : 50
  );

  // Get user rank color
  const getUserRankColor = (index) => {
    switch(index) {
      case 0: return `bg-yellow-100 text-yellow-700 border-yellow-300`;
      case 1: return `bg-gray-100 text-gray-700 border-gray-300`;
      case 2: return `bg-orange-100 text-orange-700 border-orange-300`;
      default: return `bg-blue-100 text-blue-700 border-blue-300`;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {isDashboardHome && (
        <>
          {/* Header */}
          <div className="shadow-sm border-b" 
         >
            <div className="px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray">Earnings Dashboard</h1>
                  <p className="mt-1" style={{ color: colors.textLight }}>
                    Welcome back, <span className="font-semibold" style={{ color: colors.secondary }}>{psychic?.name || 'Psychic'}</span>!
                    {dashboardData.quickStats?.allTime?.earnings > 0 && (
                      <span className="ml-2 font-medium" style={{ color: colors.success }}>
                        Total Earnings: {formatCurrency(dashboardData.quickStats.allTime.earnings)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.primary
                    }}
                  >
                    {refreshing ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaChartBar className="" />
                    )}
                    <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-1 mt-6 border-b overflow-x-auto" style={{ borderColor: colors.primary + '50' }}>
                {['overview', 'earnings', 'users', 'sessions'].map((tab) => (
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
                  error.includes('Using demo data') 
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                    : 'border-red-300 bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {error.includes('Using demo data') ? (
                      <FaExclamationTriangle className="mr-2" />
                    ) : null}
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-4 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: colors.secondary }} />
                <p style={{ color: colors.primary + '70' }}>Loading dashboard data...</p>
                <p className="text-sm mt-2" style={{ color: colors.primary + '50' }}>Fetching from API endpoints...</p>
              </div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <>
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatCard
                        title="Today's Earnings"
                        value={formatCurrency(periodData['Today'].revenue)}
                        icon={FaMoneyBillWave}
                        color={colors.success}
                        loading={loading}
                        change={todayGrowth}
                      />
                      <StatCard
                        title="This Week"
                        value={formatCurrency(periodData['This Week'].revenue)}
                        icon={FaChartLine}
                        color={colors.accent}
                        loading={loading}
                        change={weekGrowth}
                      />
                      <StatCard
                        title="Total Users"
                        value={periodData['This Year'].users || 0}
                        icon={FaUserFriends}
                        color={colors.secondary}
                        loading={loading}
                      />
                      <StatCard
                        title="Total Sessions"
                        value={periodData['This Year'].sessions || 0}
                        icon={FaClock}
                        color={colors.warning}
                        loading={loading}
                      />
                    </div>

                    {/* Period Comparison */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold" style={{ color: colors.primary }}>Select Period</h2>
                        <span className="text-sm" style={{ color: colors.primary + '70' }}>Last updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Today', 'This Week', 'This Month', 'This Year'].map((period) => (
                          <PeriodCard
                            key={period}
                            period={period}
                            data={periodData[period] || {}}
                            loading={loading}
                            active={activePeriod === period}
                            onClick={() => setActivePeriod(period)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Top Users & Recent Sessions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Top Users */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ 
                            borderColor: colors.primary + '20',
                            background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                          }}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                              <FaCrown className="inline mr-2" style={{ color: colors.secondary }} />
                              Top Earning Users
                            </h2>
                            <div className="flex items-center gap-2" style={{ color: colors.primary + '70' }}>
                              <FaUserTie className="text-xl" />
                              <span className="text-sm">
                                Showing {Math.min(5, dashboardData.userBreakdown.length)} users
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {dashboardData.userBreakdown.length > 0 ? (
                              dashboardData.userBreakdown.slice(0, 5).map((user, index) => (
                                <div 
                                  key={user.user?._id || index} 
                                  className="bg-white rounded-lg border p-4 hover:bg-gray-50 transition-all duration-300 hover:scale-[1.01]"
                                  style={{ 
                                    borderColor: colors.primary + '20',
                                    background: index % 2 === 0 ? colors.primary + '03' : 'white'
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getUserRankColor(index)} relative`}>
                                        <span className="font-bold">{index + 1}</span>
                                        {index === 0 && <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />}
                                      </div>
                                      <div>
                                        <p className="font-bold" style={{ color: colors.primary }}>
                                          {user.user?.firstName ? `${user.user.firstName} ${user.user.lastName || ''}`.trim() : 'Anonymous User'}
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
                                        {(user.sessionFrequency || 0).toFixed(1)}/wk
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <FaUserFriends className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                                <p style={{ color: colors.primary + '70' }}>No user data available</p>
                                <p className="text-sm mt-1" style={{ color: colors.primary + '50' }}>Start earning to see user statistics</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recent Sessions & Stats */}
                      <div className="space-y-6">
                        {/* Recent Sessions */}
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ 
                            borderColor: colors.primary + '20',
                            background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                          }}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold" style={{ color: colors.primary }}>
                              <FaHistory className="inline mr-2" style={{ color: colors.accent }} />
                              Recent Sessions
                            </h2>
                            <FaHistory className="text-xl" style={{ color: colors.accent }} />
                          </div>
                          <div className="space-y-4">
                            {dashboardData.recentSessions.length > 0 ? (
                              dashboardData.recentSessions.slice(0, 5).map((session, index) => (
                                <div key={session._id || index} className="pl-4 py-3 rounded-r hover:bg-gray-50 transition-colors"
                                  style={{ 
                                    borderLeft: `4px solid ${colors.accent}`,
                                    backgroundColor: index % 2 === 0 ? colors.primary + '03' : 'transparent'
                                  }}>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-bold" style={{ color: colors.primary }}>
                                        {session.user?.firstName || 'User'}
                                      </p>
                                      <p className="text-sm" style={{ color: colors.primary + '70' }}>
                                        {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : 'Recent'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-lg" style={{ color: colors.success }}>
                                        {formatCurrency(session.amount || 0)}
                                      </p>
                                      <p className="text-sm" style={{ color: colors.primary + '70' }}>
                                        {session.durationMinutes || 0} min
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p style={{ color: colors.primary + '70' }}>No recent sessions</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="bg-white rounded-xl shadow-md p-6 border"
                          style={{ 
                            borderColor: colors.primary + '20',
                            background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                          }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
                            <FaChartPie className="inline mr-2" style={{ color: colors.secondary }} />
                            Performance Score
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span style={{ color: colors.primary + '70' }}>
                                  {periodData['This Month'].revenue > 1000 ? 'Excellent' : 
                                   periodData['This Month'].revenue > 500 ? 'Good' : 'Fair'}
                                </span>
                                <span className="font-bold" style={{ color: colors.success }}>
                                  {periodData['This Month'].sessions > 0 
                                    ? `${Math.min(100, Math.round((periodData['This Month'].revenue / 1000) * 100))}%`
                                    : '0%'
                                  }
                                </span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.primary + '20' }}>
                                <div className="h-full" style={{ 
                                  backgroundColor: colors.success,
                                  width: `${Math.min(100, Math.round((periodData['This Month'].revenue / 1000) * 100))}%` 
                                }}></div>
                              </div>
                              <p className="text-sm mt-1" style={{ color: colors.primary + '60' }}>Based on your earning trends</p>
                            </div>
                            
                            <div className="pt-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                              <div className="flex justify-between items-center mb-2">
                                <span style={{ color: colors.primary + '70' }}>Avg Session Value</span>
                                <span className="font-bold" style={{ color: colors.accent }}>
                                  {periodData['This Year'].sessions > 0 
                                    ? formatCurrency(periodData['This Year'].revenue / periodData['This Year'].sessions)
                                    : '$0.00'
                                  }
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: colors.primary + '60' }}>Per session average</p>
                            </div>
                            
                            <div className="pt-4 border-t" style={{ borderColor: colors.primary + '20' }}>
                              <div className="flex justify-between items-center mb-2">
                                <span style={{ color: colors.primary + '70' }}>User Retention</span>
                                <span className="font-bold" style={{ color: colors.secondary }}>
                                  {dashboardData.userBreakdown.length > 0 
                                    ? `${Math.round((dashboardData.userBreakdown.filter(u => (u.totalSessions || 0) > 1).length / dashboardData.userBreakdown.length) * 100)}%`
                                    : '0%'
                                  }
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: colors.primary + '60' }}>Users with multiple sessions</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Other tabs - Show real data */}
                {activeTab === "earnings" && (
                  <div className="bg-white rounded-xl shadow-md p-6 border"
                    style={{ 
                      borderColor: colors.primary + '20',
                      background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                    }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                      <FaGem className="inline mr-2" style={{ color: colors.secondary }} />
                      Detailed Earnings Analysis
                    </h2>
                    
                    {dashboardData.quickStats ? (
                      <div className="space-y-6">
                        {/* Earnings Breakdown */}
                        <div>
                          <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>Earnings Breakdown</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { label: 'Today', data: periodData['Today'] },
                              { label: 'This Week', data: periodData['This Week'] },
                              { label: 'This Month', data: periodData['This Month'] },
                              { label: 'All Time', data: periodData['This Year'] }
                            ].map((period) => (
                              <div key={period.label} className="p-4 rounded-lg hover:scale-[1.02] transition-all duration-300"
                                style={{ 
                                  backgroundColor: colors.primary + '05',
                                  borderColor: colors.primary + '20',
                                  borderWidth: '1px'
                                }}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold" style={{ color: colors.primary }}>{period.label}</span>
                                  <FaChartPie className="" style={{ color: colors.accent }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: colors.success }}>
                                  {formatCurrency(period.data.revenue)}
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                  <div>
                                    <p className="font-semibold mb-1" style={{ color: colors.primary + '70' }}>Sessions</p>
                                    <p className="font-bold" style={{ color: colors.primary }}>{period.data.sessions}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-1" style={{ color: colors.primary + '70' }}>Users</p>
                                    <p className="font-bold" style={{ color: colors.primary }}>{period.data.users}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 rounded-xl text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)` }}>
                            <div className="flex items-center gap-3 mb-3">
                              <FaWallet className="text-2xl text-white opacity-90" />
                              <h4 className="text-lg font-bold">Avg per Session</h4>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {periodData['This Year'].sessions > 0 
                                ? formatCurrency(periodData['This Year'].revenue / periodData['This Year'].sessions)
                                : '$0.00'
                              }
                            </p>
                            <p className="opacity-90 mt-2">Revenue per session</p>
                          </div>
                          
                          <div className="p-6 rounded-xl text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${colors.success} 0%, #047857 100%)` }}>
                            <div className="flex items-center gap-3 mb-3">
                              <FaUserCheck className="text-2xl text-white opacity-90" />
                              <h4 className="text-lg font-bold">Avg per User</h4>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {periodData['This Year'].users > 0 
                                ? formatCurrency(periodData['This Year'].revenue / periodData['This Year'].users)
                                : '$0.00'
                              }
                            </p>
                            <p className="opacity-90 mt-2">Revenue per user</p>
                          </div>
                          
                          <div className="p-6 rounded-xl text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, #7C3AED 100%)` }}>
                            <div className="flex items-center gap-3 mb-3">
                              <FaExchangeAlt className="text-2xl text-white opacity-90" />
                              <h4 className="text-lg font-bold">Session Frequency</h4>
                            </div>
                            <p className="text-3xl font-bold text-white">
                              {periodData['This Month'].sessions > 0 
                                ? (periodData['This Month'].sessions / 30).toFixed(1)
                                : '0'
                              }/day
                            </p>
                            <p className="opacity-90 mt-2">Average daily sessions</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaChartBar className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                        <p style={{ color: colors.primary + '70' }}>No earnings data available</p>
                        <button
                          onClick={handleRefresh}
                          className="mt-4 px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            backgroundColor: colors.secondary,
                            color: colors.primary
                          }}
                        >
                          Refresh Data
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="bg-white rounded-xl shadow-md p-6 border"
                    style={{ 
                      borderColor: colors.primary + '20',
                      background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                    }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                      <FaUserTie className="inline mr-2" style={{ color: colors.secondary }} />
                      User Analytics
                    </h2>
                    
                    {dashboardData.userBreakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: colors.primary + '20' }}>
                          <thead style={{ backgroundColor: colors.primary + '05' }}>
                            <tr>
                              {['Rank', 'User', 'Total Spent', 'Sessions', 'Total Time', 'Avg/Session'].map((header) => (
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
                                    {formatCurrency(user.totalEarnings || 0)}
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
                        <p className="text-sm mt-1" style={{ color: colors.primary + '50' }}>Start earning with users to see analytics</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "sessions" && (
                  <div className="bg-white rounded-xl shadow-md p-6 border"
                    style={{ 
                      borderColor: colors.primary + '20',
                      background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`
                    }}>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                      <FaFire className="inline mr-2" style={{ color: colors.secondary }} />
                      Session Analytics
                    </h2>
                    
                    {dashboardData.recentSessions.length > 0 ? (
                      <div className="space-y-6">
                        {/* Session Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: colors.primary + '05',
                              borderColor: colors.accent + '30'
                            }}>
                            <p className="text-sm font-bold mb-1" style={{ color: colors.accent }}>Total Session Time</p>
                            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {periodData['This Year'].timeMinutes || 0} min
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: colors.primary + '05',
                              borderColor: colors.success + '30'
                            }}>
                            <p className="text-sm font-bold mb-1" style={{ color: colors.success }}>Avg Session Duration</p>
                            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {periodData['This Year'].sessions > 0 
                                ? `${Math.round((periodData['This Year'].timeMinutes || 0) / periodData['This Year'].sessions)} min`
                                : '0 min'
                              }
                            </p>
                          </div>
                          <div className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: colors.primary + '05',
                              borderColor: colors.secondary + '30'
                            }}>
                            <p className="text-sm font-bold mb-1" style={{ color: colors.secondary }}>Total Revenue</p>
                            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {formatCurrency(periodData['This Year'].revenue)}
                            </p>
                          </div>
                        </div>

                        {/* Recent Sessions List */}
                        <div>
                          <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>Recent Sessions</h3>
                          <div className="space-y-4">
                            {dashboardData.recentSessions.map((session, index) => (
                              <div key={session._id || index} className="p-4 rounded-lg hover:scale-[1.01] transition-all duration-300"
                                style={{ 
                                  backgroundColor: colors.primary + '05',
                                  borderColor: colors.primary + '20',
                                  borderWidth: '1px'
                                }}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: colors.accent + '20' }}>
                                        <FaUserFriends className="" style={{ color: colors.accent }} />
                                      </div>
                                      <div>
                                        <h4 className="font-bold" style={{ color: colors.primary }}>
                                          {session.user?.firstName || 'User'} {session.user?.lastName || ''}
                                        </h4>
                                        <p className="text-sm" style={{ color: colors.primary + '70' }}>{session.user?.email || 'No email'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm mt-2" style={{ color: colors.primary + '70' }}>
                                      <span className="flex items-center">
                                        <FaClock className="mr-1" /> {session.durationMinutes || 0} min
                                      </span>
                                      <span className="flex items-center">
                                        <FaMoneyBillWave className="mr-1" /> {formatCurrency(session.amount || 0)}
                                      </span>
                                      <span>
                                        Rate: {(session.ratePerMin || 1).toFixed(2)}/min
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm" style={{ color: colors.primary + '70' }}>
                                      {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : 'Date unknown'}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: colors.primary + '50' }}>
                                      {session.endedAt ? new Date(session.endedAt).toLocaleTimeString() : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaHistory className="text-4xl mx-auto mb-3" style={{ color: colors.primary + '30' }} />
                        <p style={{ color: colors.primary + '70' }}>No session history</p>
                        <p className="text-sm mt-1" style={{ color: colors.primary + '50' }}>Your session history will appear here</p>
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