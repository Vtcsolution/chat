import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  User,
  MessageSquare,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  BarChart3,
  Activity,
  Users,
  TrendingUp,
  Timer,
  Sparkles,
  Eye as ViewIcon,
  Crown,
  Target,
  Zap,
  CheckCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Dashboard_Navbar from "../Admin_Navbar";
import Doctor_Side_Bar from "../SideBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';

// Color scheme matching psychic dashboard
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
  chartLine: "#0ea5e9",    // Sky blue for charts
};

const AdminHumanChatDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState(false);
  const [fetchingSessionIds, setFetchingSessionIds] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totals: {
      psychics: 0,
      sessions: 0,
      paidTimers: 0,
      chatRequests: 0,
      users: 0
    },
    currentStatus: {
      activeSessions: 0,
      activePaidTimers: 0,
      pendingRequests: 0
    },
    financials: {
      totalRevenue: 0,
      totalPaidTime: 0,
      avgSessionValue: 0
    },
    lists: {
      psychics: [],
      recentPaidTimers: [],
      recentSessions: []
    }
  });

  const [sessionIdMap, setSessionIdMap] = useState({});

  useEffect(() => {
    if (admin) {
      fetchDashboardData();
    }
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setFetchingSessionIds(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/admindata/chats`,
        {
          withCredentials: true
        }
      );

      console.log('✅ Dashboard Response:', response.data);

      if (response.data.success) {
        const data = response.data.data || {
          totals: {},
          currentStatus: {},
          financials: {},
          lists: {}
        };
        
        setDashboardData(data);
        
        await findSessionIdsForPaidTimers(data.lists.recentPaidTimers || []);
        await fetchMissingUserDetails(data.lists.recentPaidTimers || []);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch dashboard data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setFetchingSessionIds(false);
    }
  };

  const fetchMissingUserDetails = async (paidTimers) => {
    const missingUserTimers = paidTimers.filter(
      timer => timer.user === 'Unknown User' || !timer.user || timer.user === 'User (Name Not Available)'
    );
    
    if (missingUserTimers.length === 0) return;
    
    for (const timer of missingUserTimers) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/admindata/chats/${timer._id}`,
          {
            withCredentials: true,
            timeout: 5000
          }
        );
        
        if (response.data.success && response.data.data?.participants?.user) {
          const user = response.data.data.participants.user;
          setUserDetails(prev => ({
            ...prev,
            [timer._id]: user
          }));
        }
      } catch (error) {
        console.error(`❌ Error fetching user details for timer ${timer._id}:`, error.message);
      }
    }
  };

  const findSessionIdsForPaidTimers = async (paidTimers) => {
    try {
      const newSessionIdMap = {};
      
      for (const timer of paidTimers) {
        if (timer._id) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/admindata/chats/${timer._id}`,
              {
                withCredentials: true,
                timeout: 5000
              }
            );

            if (response.data.success) {
              if (response.data.redirect || response.data.sessionId) {
                const sessionId = response.data.sessionId || response.data.redirect.split('/').pop();
                newSessionIdMap[timer._id] = sessionId;
              } else {
                newSessionIdMap[timer._id] = timer._id;
              }
            }
          } catch (error) {
            console.error(`❌ Error finding session for timer ${timer._id}:`, error.message);
            newSessionIdMap[timer._id] = null;
          }
        }
      }
      
      setSessionIdMap(newSessionIdMap);
    } catch (error) {
      console.error('❌ Error finding session IDs:', error);
    }
  };

  const handleViewChatDetails = async (itemId, isPaidTimer = false) => {
    try {
      let sessionId = itemId;
      
      if (isPaidTimer && sessionIdMap[itemId]) {
        sessionId = sessionIdMap[itemId];
      }
      
      if (!sessionId) {
        toast({
          title: "Finding chat session...",
          description: "Please wait while we find the chat session",
          variant: "default"
        });
        
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/admindata/chats/${itemId}`,
          {
            withCredentials: true,
            timeout: 5000
          }
        );
        
        if (response.data.success && response.data.sessionId) {
          sessionId = response.data.sessionId;
        } else {
          toast({
            title: "No Chat Session",
            description: "No chat session found for this paid timer",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log(`🚀 Navigating to chat session: ${sessionId}`);
      navigate(`/admin/dashboard/chat-details/${sessionId}`);
      
    } catch (error) {
      console.error('❌ Error viewing chat details:', error);
      toast({
        title: "Error",
        description: "Failed to find chat session",
        variant: "destructive"
      });
    }
  };

  const getUserDisplayName = (timer, isPaidTimer = false) => {
    const timerId = timer._id;
    
    if (userDetails[timerId]) {
      const user = userDetails[timerId];
      if (user.name && user.name !== 'Unknown User') return user.name;
      if (user.fullName) return user.fullName;
      if (user.firstName || user.lastName) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
      }
      if (user.email) return user.email.split('@')[0];
    }
    
    if (typeof timer.user === 'string') {
      if (timer.user !== 'Unknown User' && timer.user !== 'User (Name Not Available)') {
        return timer.user;
      }
    }
    
    if (timer.user && typeof timer.user === 'object') {
      if (timer.user.name) return timer.user.name;
      if (timer.user.fullName) return timer.user.fullName;
      if (timer.user.firstName || timer.user.lastName) {
        return `${timer.user.firstName || ''} ${timer.user.lastName || ''}`.trim();
      }
      if (timer.user.email) return timer.user.email.split('@')[0];
    }
    
    if (isPaidTimer) {
      return 'User (Click to view details)';
    }
    
    return 'User (No Name)';
  };

  const getPsychicDisplayName = (item) => {
    if (typeof item === 'string') {
      return item === 'Unknown Psychic' ? 'Psychic (Name Not Available)' : item;
    }
    
    if (item && typeof item === 'object') {
      if (item.name) return item.name;
      if (item.email) return item.email.split('@')[0];
    }
    
    return 'Psychic (Name Not Available)';
  };

  const handleFetchUserDetails = async (timerId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      toast({
        title: "Fetching user details...",
        description: "Please wait",
        variant: "default"
      });
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/admindata/chats/${timerId}`,
        { withCredentials: true }
      );
      
      if (response.data.success && response.data.data?.participants?.user) {
        const user = response.data.data.participants.user;
        setUserDetails(prev => ({
          ...prev,
          [timerId]: user
        }));
        
        toast({
          title: "User details updated",
          description: `Found user: ${user.name || user.email || 'User'}`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return `Today, ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.secondary }} />
        <span className="ml-2" style={{ color: colors.primary + '70' }}>Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
     
      <div className="flex">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
       
        <main className="flex-1 p-6 ml-0 mt-20 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-6 w-6" style={{ color: colors.secondary }} />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: colors.primary }}>
                  Chat Management Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground mt-1" style={{ color: colors.primary + '80' }}>
                Overview of all chat sessions, requests, and paid timers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={fetchDashboardData} 
                disabled={loading}
                className="hover:scale-105 transition-transform duration-200"
                style={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Psychics Card */}
            <Card className="border-none shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary + '70' }}>Total Psychics</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{dashboardData.totals.psychics || 0}</p>
                    <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>Registered coaches</p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                    }}
                  >
                    <Users className="h-6 w-6" style={{ color: colors.textLight }} />
                  </div>
                </div>
              </CardContent>
            </Card>
           
            {/* Total Sessions Card */}
            <Card className="border-none shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary + '70' }}>Total Sessions</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{dashboardData.totals.sessions || 0}</p>
                    <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>Chat sessions</p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}80 100%)`,
                    }}
                  >
                    <MessageSquare className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
           
            {/* Paid Timers Card */}
            <Card className="border-none shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary + '70' }}>Paid Timers</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{dashboardData.totals.paidTimers || 0}</p>
                    <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>Active timers</p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.secondary} 100%)`,
                    }}
                  >
                    <Timer className="h-6 w-6" style={{ color: colors.primary }} />
                  </div>
                </div>
              </CardContent>
            </Card>
           
            {/* Chat Requests Card */}
            <Card className="border-none shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary + '70' }}>Chat Requests</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>{dashboardData.totals.chatRequests || 0}</p>
                    <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>Pending requests</p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.accent}80 0%, ${colors.primary} 100%)`,
                    }}
                  >
                    <Activity className="h-6 w-6" style={{ color: colors.textLight }} />
                  </div>
                </div>
              </CardContent>
            </Card>
           
            {/* Total Revenue Card */}
            <Card className="border-none shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.primary + '70' }}>Total Revenue</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
                      ${(dashboardData.financials.totalRevenue || 0).toFixed(2)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.primary + '60' }}>All time earnings</p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.warning} 100%)`,
                    }}
                  >
                    <DollarSign className="h-6 w-6" style={{ color: colors.primary }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different lists */}
          <Tabs defaultValue="recent-sessions" className="mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-lg bg-transparent gap-2">
              <TabsTrigger 
                value="recent-sessions"
                className="data-[state=active]:shadow-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Recent Sessions
              </TabsTrigger>
              <TabsTrigger 
                value="recent-paid"
                className="data-[state=active]:shadow-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <Timer className="h-4 w-4 mr-2" />
                Paid Timers
              </TabsTrigger>
              <TabsTrigger 
                value="recent-psychics"
                className="data-[state=active]:shadow-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                Psychics
              </TabsTrigger>
            </TabsList>

            {/* Recent Sessions Tab */}
            <TabsContent value="recent-sessions">
              <Card 
                className="border-none shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`,
                }}
              >
                <CardHeader className="pb-3" style={{ borderBottomColor: colors.primary + '10' }}>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <MessageSquare className="h-5 w-5" />
                    Recent Chat Sessions
                  </CardTitle>
                  <CardDescription style={{ color: colors.primary + '70' }}>
                    Latest chat sessions with HumanChatSession IDs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.primary + '20' }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: colors.primary + '05' }}>
                          <TableHead style={{ color: colors.primary }}>User</TableHead>
                          <TableHead style={{ color: colors.primary }}>Psychic</TableHead>
                          <TableHead style={{ color: colors.primary }}>Status</TableHead>
                          <TableHead style={{ color: colors.primary }}>Duration</TableHead>
                          <TableHead style={{ color: colors.primary }}>Last Activity</TableHead>
                          <TableHead style={{ color: colors.primary }}>Chat Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.secondary }} />
                                <span style={{ color: colors.primary + '70' }}>Loading sessions...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : dashboardData.lists.recentSessions?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12" style={{ color: colors.primary + '70' }}>
                              <div className="flex flex-col items-center gap-3">
                                <MessageSquare className="h-12 w-12" style={{ color: colors.primary + '20' }} />
                                <p className="font-medium">No recent sessions</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          dashboardData.lists.recentSessions?.map((session, index) => (
                            <TableRow 
                              key={session._id || index}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? colors.primary + '02' : 'white',
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-8 w-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: colors.primary + '05' }}
                                  >
                                    <User className="h-4 w-4" style={{ color: colors.primary }} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm" style={{ color: colors.primary }}>
                                      {getUserDisplayName(session, false)}
                                    </p>
                                    {typeof session.user === 'object' && session.user?.email && (
                                      <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                        {session.user.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-8 w-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: colors.accent + '10' }}
                                  >
                                    <User className="h-4 w-4" style={{ color: colors.accent }} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm" style={{ color: colors.primary }}>
                                      {getPsychicDisplayName(session.psychic)}
                                    </p>
                                    {typeof session.psychic === 'object' && session.psychic?.email && (
                                      <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                        {session.psychic.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className="border font-medium"
                                  style={{
                                    backgroundColor: session.status === 'active' 
                                      ? colors.success + '10'
                                      : session.status === 'ended'
                                      ? colors.accent + '10'
                                      : colors.primary + '10',
                                    color: session.status === 'active' 
                                      ? colors.success
                                      : session.status === 'ended'
                                      ? colors.accent
                                      : colors.primary,
                                    borderColor: session.status === 'active' 
                                      ? colors.success + '30'
                                      : session.status === 'ended'
                                      ? colors.accent + '30'
                                      : colors.primary + '30',
                                  }}
                                >
                                  {session.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" style={{ color: colors.secondary }} />
                                  <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                    {formatDuration(session.duration)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm" style={{ color: colors.primary + '80' }}>
                                {formatDate(session.lastMessageAt)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleViewChatDetails(session._id, false)}
                                  disabled={loading}
                                  className="hover:scale-105 transition-transform duration-200"
                                  style={{
                                    backgroundColor: colors.secondary,
                                    color: colors.primary,
                                  }}
                                >
                                  <ViewIcon className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Paid Timers Tab */}
            <TabsContent value="recent-paid">
              <Card 
                className="border-none shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`,
                }}
              >
                <CardHeader className="pb-3" style={{ borderBottomColor: colors.primary + '10' }}>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Timer className="h-5 w-5" />
                    Recent Paid Timer Sessions
                  </CardTitle>
                  <CardDescription style={{ color: colors.primary + '70' }}>
                    {fetchingSessionIds ? "Finding chat sessions..." : "Latest completed paid timer sessions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.primary + '20' }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: colors.primary + '05' }}>
                          <TableHead style={{ color: colors.primary }}>User</TableHead>
                          <TableHead style={{ color: colors.primary }}>Psychic</TableHead>
                          <TableHead style={{ color: colors.primary }}>Amount</TableHead>
                          <TableHead style={{ color: colors.primary }}>Duration</TableHead>
                          <TableHead style={{ color: colors.primary }}>Ended At</TableHead>
                          <TableHead style={{ color: colors.primary }}>Chat Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.secondary }} />
                                <span style={{ color: colors.primary + '70' }}>Loading paid timers...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : dashboardData.lists.recentPaidTimers?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12" style={{ color: colors.primary + '70' }}>
                              <div className="flex flex-col items-center gap-3">
                                <Timer className="h-12 w-12" style={{ color: colors.primary + '20' }} />
                                <p className="font-medium">No recent paid timers</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          dashboardData.lists.recentPaidTimers?.map((timer, index) => {
                            const hasSession = !!sessionIdMap[timer._id];
                            
                            return (
                              <TableRow 
                                key={timer._id || index}
                                className="cursor-pointer hover:scale-[1.01] transition-transform duration-200"
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? colors.primary + '02' : 'white',
                                }}
                                onClick={() => handleViewChatDetails(timer._id, true)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="h-8 w-8 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: colors.primary + '05' }}
                                    >
                                      <User className="h-4 w-4" style={{ color: colors.primary }} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm" style={{ color: colors.primary }}>
                                        {getUserDisplayName(timer, true)}
                                      </p>
                                      {userDetails[timer._id]?.email && (
                                        <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                          {userDetails[timer._id].email}
                                        </p>
                                      )}
                                      {timer.user === 'Unknown User' && !userDetails[timer._id] && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-4 p-0 text-xs"
                                          onClick={(e) => handleFetchUserDetails(timer._id, e)}
                                          style={{ color: colors.secondary }}
                                        >
                                          Try to find user
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="h-8 w-8 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: colors.accent + '10' }}
                                    >
                                      <User className="h-4 w-4" style={{ color: colors.accent }} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm" style={{ color: colors.primary }}>
                                        {getPsychicDisplayName(timer.psychic)}
                                      </p>
                                      {typeof timer.psychic === 'object' && timer.psychic?.email && (
                                        <p className="text-xs" style={{ color: colors.primary + '70' }}>
                                          {timer.psychic.email}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" style={{ color: colors.secondary }} />
                                    <span className="font-bold" style={{ color: colors.primary }}>
                                      {formatAmount(timer.amount)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-4 w-4" style={{ color: colors.warning }} />
                                    <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                      {formatDuration(timer.duration)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm" style={{ color: colors.primary + '80' }}>
                                  {formatDate(timer.endedAt)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant={hasSession ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewChatDetails(timer._id, true);
                                    }}
                                    disabled={!hasSession || loading}
                                    title={hasSession ? "View chat session" : "No chat session found"}
                                    className="hover:scale-105 transition-transform duration-200"
                                    style={{
                                      backgroundColor: hasSession ? colors.secondary : 'transparent',
                                      color: hasSession ? colors.primary : colors.primary + '70',
                                      borderColor: hasSession ? colors.secondary : colors.primary + '20',
                                    }}
                                  >
                                    {hasSession ? (
                                      <>
                                        <ViewIcon className="h-4 w-4 mr-2" />
                                        View Chat
                                      </>
                                    ) : (
                                      "No Chat"
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Psychics Tab */}
            <TabsContent value="recent-psychics">
              <Card 
                className="border-none shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, white 0%, ${colors.primary}03 100%)`,
                }}
              >
                <CardHeader className="pb-3" style={{ borderBottomColor: colors.primary + '10' }}>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Crown className="h-5 w-5" />
                    Recent Psychics
                  </CardTitle>
                  <CardDescription style={{ color: colors.primary + '70' }}>
                    Recently registered psychics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.primary + '20' }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: colors.primary + '05' }}>
                          <TableHead style={{ color: colors.primary }}>Name</TableHead>
                          <TableHead style={{ color: colors.primary }}>Email</TableHead>
                          <TableHead style={{ color: colors.primary }}>Rate/Min</TableHead>
                          <TableHead style={{ color: colors.primary }}>Rating</TableHead>
                          <TableHead style={{ color: colors.primary }}>Joined</TableHead>
                          <TableHead style={{ color: colors.primary }}>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.secondary }} />
                                <span style={{ color: colors.primary + '70' }}>Loading psychics...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : dashboardData.lists.psychics?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12" style={{ color: colors.primary + '70' }}>
                              <div className="flex flex-col items-center gap-3">
                                <Users className="h-12 w-12" style={{ color: colors.primary + '20' }} />
                                <p className="font-medium">No psychics found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          dashboardData.lists.psychics?.map((psychic, index) => (
                            <TableRow 
                              key={psychic._id || index}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? colors.primary + '02' : 'white',
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-8 w-8 rounded-full flex items-center justify-center"
                                    style={{ 
                                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                                    }}
                                  >
                                    <User className="h-4 w-4" style={{ color: colors.textLight }} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm" style={{ color: colors.primary }}>
                                      {getPsychicDisplayName(psychic)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm" style={{ color: colors.primary + '80' }}>{psychic.email}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" style={{ color: colors.secondary }} />
                                  <span className="font-bold" style={{ color: colors.primary }}>
                                    ${(psychic.ratePerMin || 0).toFixed(2)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="h-4 w-4" style={{ color: colors.accent }} />
                                  <span className="font-bold" style={{ color: colors.primary }}>
                                    {psychic.averageRating ? psychic.averageRating.toFixed(1) : '0.0'}/5
                                  </span>
                                  <span className="text-xs" style={{ color: colors.primary + '70' }}>
                                    ({psychic.totalRatings || 0})
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm" style={{ color: colors.primary + '80' }}>
                                {formatDate(psychic.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className="border font-medium"
                                  style={{
                                    backgroundColor: psychic.isVerified
                                      ? colors.success + '10'
                                      : colors.warning + '10',
                                    color: psychic.isVerified
                                      ? colors.success
                                      : colors.warning,
                                    borderColor: psychic.isVerified
                                      ? colors.success + '30'
                                      : colors.warning + '30',
                                  }}
                                >
                                  {psychic.isVerified ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </>
                                  ) : (
                                    'Pending'
                                  )}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminHumanChatDashboard;