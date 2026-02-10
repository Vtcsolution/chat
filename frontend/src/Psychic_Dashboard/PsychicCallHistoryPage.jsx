import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePsychicAuth } from '../context/PsychicAuthContext';
import { 
  Phone, Clock, User, Calendar, DollarSign, ArrowLeft,
  AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import axios from 'axios';
import io from 'socket.io-client';

const PsychicCallHistoryPage = () => {
  const navigate = useNavigate();
  const { psychic, colors } = usePsychicAuth();
  
  // State for both pending and history
  const [pendingCalls, setPendingCalls] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState({
    pending: false,
    history: false
  });
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalEarnings: 0,
    totalDuration: 0,
    pendingCount: 0,
    averageRating: 0
  });

  const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
  
  // Use ref for socket to avoid re-renders
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('🎯 PsychicCallHistoryPage mounted');
    console.log('Psychic:', psychic);
    console.log('Has token:', !!localStorage.getItem('psychicToken'));
    console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
    console.log('Using API_BASE:', API_BASE);
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!psychic?._id) return;
    
    // Initialize audio for notifications
    audioRef.current = new Audio('/incoming_call.mp3');
    
    console.log('🔌 Initializing Socket.IO connection...');
    const token = localStorage.getItem('psychicToken');
    
    socketRef.current = io(`${API_BASE}/audio-calls`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // ========== SOCKET EVENT HANDLERS ==========
    
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to audio namespace');
      // Register psychic upon connection
      socketRef.current.emit('psychic-register', psychic._id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      toast.error('Failed to connect to real-time service. Using polling fallback.');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // Registration success
    socketRef.current.on('registration-success', (data) => {
      console.log('✅ Psychic registered:', data);
      toast.success('Real-time audio calls enabled');
    });

    socketRef.current.on('registration-error', (error) => {
      console.error('❌ Registration error:', error);
      toast.error('Failed to register for audio calls');
    });

    // Real-time pending calls update
    socketRef.current.on('pending-calls-initial', (data) => {
      console.log('📋 Initial pending calls:', data);
      if (data.calls) {
        setPendingCalls(data.calls);
        setStats(prev => ({ ...prev, pendingCount: data.count || 0 }));
      }
    });

    socketRef.current.on('pending-calls-update', (data) => {
      console.log('🔄 Pending calls update:', data);
      if (data.calls) {
        setPendingCalls(data.calls);
        setStats(prev => ({ ...prev, pendingCount: data.count || 0 }));
      }
    });

    // New incoming call - FIXED: Use proper state updater
    socketRef.current.on('incoming-call', (callData) => {
      console.log('📞 New incoming call:', callData);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play error:', err));
      }
      
      // Use functional update to avoid missing prev
      setPendingCalls(prev => {
        // Check if call already exists
        const exists = prev.some(call => call._id === callData._id);
        if (!exists) {
          return [callData, ...prev];
        }
        return prev;
      });
      
      // Update stats
      setStats(prev => ({ 
        ...prev, 
        pendingCount: prev.pendingCount + 1 
      }));
      
      toast.info(`📞 New call from ${callData.user?.firstName || 'Client'}!`, {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => setActiveTab('pending')
        }
      });
    });

    // New pending call added to list
    socketRef.current.on('new-pending-call', (callData) => {
      console.log('➕ New pending call:', callData);
      
      setPendingCalls(prev => {
        const exists = prev.some(call => call._id === callData._id);
        if (!exists) {
          return [callData, ...prev];
        }
        return prev;
      });
    });

    // Pending call removed - FIXED: Use functional update
    socketRef.current.on('pending-call-removed', (data) => {
      console.log('➖ Pending call removed:', data);
      
      setPendingCalls(prev => 
        prev.filter(call => call._id !== data.callRequestId)
      );
      
      setStats(prev => ({ 
        ...prev, 
        pendingCount: Math.max(0, prev.pendingCount - 1)
      }));
      
      if (data.reason) {
        toast.info(`Call ${data.reason}`, {
          duration: 3000
        });
      }
    });

    // Fetch initial data via API
    fetchAllData();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [psychic?._id, API_BASE]);

  // Fetch both pending and history
  const fetchAllData = async () => {
    console.log('🔄 Starting to fetch all data');
    await Promise.all([
      fetchPendingCalls(),
      fetchCallHistory()
    ]);
  };

  const fetchPendingCalls = async () => {
    console.log('📞 Fetching pending calls via HTTP...');
    setIsLoading(prev => ({ ...prev, pending: true }));
    try {
      const token = localStorage.getItem('psychicToken');
      if (!token) {
        toast.error('Please login first');
        navigate('/psychic/login');
        return;
      }

      const response = await axios.get(
        `${API_BASE}/api/calls/pending`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
          timeout: 10000
        }
      );
      
      console.log('📊 Pending calls response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data || [];
        console.log(`✅ Found ${data.length} pending calls`);
        setPendingCalls(data);
        setStats(prev => ({ ...prev, pendingCount: data.length }));
      } else {
        console.log('❌ API returned success: false', response.data.message);
        toast.error(response.data.message || 'Failed to load pending calls');
        setPendingCalls([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending calls:', {
        message: error.message,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/psychic/login');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load pending calls');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, pending: false }));
    }
  };

  const fetchCallHistory = async () => {
    console.log('📋 Fetching call history...');
    setIsLoading(prev => ({ ...prev, history: true }));
    try {
      const token = localStorage.getItem('psychicToken');
      
      if (!token) {
        return;
      }

      // Try the main endpoint first
      const response = await axios.get(
        `${API_BASE}/api/calls/psychic/history`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        const data = response.data.data || {};
        const calls = data.calls || data || [];
        console.log(`✅ Found ${calls.length} call history records`);
        
        setCallHistory(calls);
        
        // Calculate stats
        const totalEarnings = calls.reduce((sum, call) => 
          sum + ((call.durationSeconds || 0) / 60 * (call.ratePerMin || 0)), 0);
        
        const totalDuration = calls.reduce((sum, call) => 
          sum + (call.durationSeconds || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalCalls: data.pagination?.total || calls.length,
          totalEarnings,
          totalDuration,
          averageRating: psychic?.averageRating || 0
        }));
      } else {
        console.log('ℹ️ No call history data found');
        setCallHistory([]);
      }
    } catch (error) {
      console.error('❌ Error fetching call history:', error.message);
      
      // Don't show error if endpoint doesn't exist
      if (error.response?.status !== 404) {
        toast.error('Failed to load call history');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, history: false }));
    }
  };

  const handleAcceptCall = async (call) => {
    // FIXED: Ensure we have the call ID
    const callId = call._id || call.callRequestId;
    
    if (!callId) {
      console.error('❌ No call ID provided');
      toast.error('Cannot accept call: Missing call ID');
      return;
    }
    
    console.log(`✅ Accepting call: ${callId}`);
    
    try {
      const token = localStorage.getItem('psychicToken');
      const response = await axios.post(
        `${API_BASE}/api/calls/accept/${callId}`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Emit socket event for real-time update
        if (socketRef.current?.connected) {
          socketRef.current.emit('call-accepted', {
            callRequestId: callId,
            psychicId: psychic._id
          });
        }
        
        toast.success('Call accepted!');
        
        // Navigate to call page with proper ID
        navigate(`/psychic/call/${callId}`, {
          state: {
            callData: call,
            token: response.data.token // If backend returns a token
          }
        });
      }
    } catch (error) {
      console.error('❌ Error accepting call:', {
        message: error.message,
        response: error.response?.data
      });
      
      toast.error(error.response?.data?.message || 'Failed to accept call');
    }
  };

  const handleRejectCall = async (call) => {
    // FIXED: Ensure we have the call ID
    const callId = call._id || call.callRequestId;
    
    if (!callId) {
      console.error('❌ No call ID provided');
      toast.error('Cannot reject call: Missing call ID');
      return;
    }
    
    console.log(`❌ Rejecting call: ${callId}`);
    
    try {
      const token = localStorage.getItem('psychicToken');
      const response = await axios.post(
        `${API_BASE}/api/calls/reject/${callId}`,
        { reason: 'Not available' },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Emit socket event for real-time update
        if (socketRef.current?.connected) {
          socketRef.current.emit('call-rejected', {
            callRequestId: callId,
            psychicId: psychic._id
          });
        }
        
        toast.success('Call rejected');
        
        // Refresh pending calls
        fetchPendingCalls();
      }
    } catch (error) {
      console.error('❌ Error rejecting call:', error.message);
      toast.error('Failed to reject call');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds == null) return 'No expiration';
    if (seconds <= 0) return 'Expired';
    
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const config = {
      'completed': { color: 'bg-green-500', text: 'Completed', icon: CheckCircle },
      'active': { color: 'bg-blue-500', text: 'Active', icon: Phone },
      'pending': { color: 'bg-yellow-500', text: 'Pending', icon: AlertCircle },
      'rejected': { color: 'bg-red-500', text: 'Rejected', icon: XCircle },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled', icon: XCircle },
      'failed': { color: 'bg-red-500', text: 'Failed', icon: XCircle }
    }[status] || { color: 'bg-gray-500', text: status, icon: AlertCircle };
    
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh...');
    fetchAllData();
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State updated:', {
      pendingCalls: pendingCalls.length,
      callHistory: callHistory.length,
      activeTab,
      stats
    });
  }, [pendingCalls, callHistory, activeTab, stats]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors?.softIvory || '#F5F3EB' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/psychic/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                Audio Calls
              </h1>
              <p className="text-gray-600">Manage your audio call sessions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 mr-2">
              ID: {psychic?._id?.slice(-8) || 'N/A'}
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading.pending || isLoading.history}
              className="flex items-center gap-2"
            >
              {isLoading.pending || isLoading.history ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Calls</p>
                <h3 className="text-2xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  {stats.pendingCount}
                </h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: colors?.lightGold || '#E8D9B0' }}>
                <AlertCircle className="h-5 w-5" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {pendingCalls.length} in list
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <h3 className="text-2xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  {stats.totalCalls}
                </h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: colors?.lightGold || '#E8D9B0' }}>
                <Phone className="h-5 w-5" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {callHistory.length} in list
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <h3 className="text-2xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  ${stats.totalEarnings.toFixed(2)}
                </h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: colors?.lightGold || '#E8D9B0' }}>
                <DollarSign className="h-5 w-5" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              From call history
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <h3 className="text-2xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  {formatTime(stats.totalDuration)}
                </h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: colors?.lightGold || '#E8D9B0' }}>
                <Clock className="h-5 w-5" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Total time
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <h3 className="text-2xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  {stats.averageRating.toFixed(1)}
                </h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: colors?.lightGold || '#E8D9B0' }}>
                <User className="h-5 w-5" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Your rating
            </div>
          </Card>
        </div>

        {/* Tabs for Pending Calls and History */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Calls
              {pendingCalls.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCalls.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call History
              {callHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {callHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Calls Tab */}
          <TabsContent value="pending">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  Incoming Call Requests
                </h2>
                <div className="text-sm text-gray-500">
                  {socketRef.current?.connected ? '🔵 Real-time active' : '🟡 Using polling'}
                </div>
              </div>

              {isLoading.pending ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-12 w-12 animate-spin" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
                  <span className="ml-4">Loading pending calls...</span>
                </div>
              ) : pendingCalls.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                    No pending calls
                  </h3>
                  <p className="text-gray-600 mb-6">You don't have any incoming call requests at the moment</p>
                  <Button onClick={fetchPendingCalls} variant="outline">
                    Check Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Click "Accept" to start a call or "Reject" to decline
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingCalls.map((call) => (
                      <Card key={call._id} className="p-4 hover:shadow-lg transition-shadow border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-100 border-2 border-yellow-500">
                            <img
                              src={call.user?.image || call.userId?.image || 'https://via.placeholder.com/48'}
                              alt={call.user?.firstName || call.userId?.firstName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {call.user?.firstName || call.userId?.firstName} {call.user?.lastName || call.userId?.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">Client</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rate:</span>
                            <span className="font-semibold">${(call.ratePerMin || 1).toFixed(2)}/min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time left:</span>
                            <span className={`font-semibold ${call.timeRemaining != null && call.timeRemaining > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              <Clock className="inline h-3 w-3 mr-1" />
                              {formatTimeRemaining(call.timeRemaining)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Requested:</span>
                            <span className="text-sm">
                              {new Date(call.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          {call.isFreeSession && (
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded text-center">
                              ⭐ First minute free for this client
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptCall(call)}
                            disabled={call.timeRemaining != null && call.timeRemaining <= 0}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Accept Call
                          </Button>
                          <Button
                            onClick={() => handleRejectCall(call)}
                            variant="outline"
                            className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          {/* Call History Tab */}
         
          {/* Call History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                  Call History
                </h2>
                <div className="text-sm text-gray-500">
                  Total: {callHistory.length} calls
                </div>
              </div>

              {isLoading.history ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-12 w-12 animate-spin" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
                  <span className="ml-4">Loading call history...</span>
                </div>
              ) : callHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="h-12 w-12 mx-auto mb-4" style={{ color: colors?.antiqueGold || '#C9A24D' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                    No call history yet
                  </h3>
                  <p className="text-gray-600 mb-6">Your call history will appear here after completing calls</p>
                  <div className="text-sm text-gray-500">
                    Completed calls are archived automatically when calls end
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callHistory.map((call, index) => (
                        <TableRow key={call._id || index} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                <img
                                  src={call.userId?.image || 'https://via.placeholder.com/40'}
                                  alt={call.userId?.firstName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium" style={{ color: colors?.deepPurple || '#2B1B3F' }}>
                                  {call.userId?.firstName || 'Client'} {call.userId?.lastName || ''}
                                </div>
                                <div className="text-sm text-gray-500">{call.userId?.email || 'No email'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(call.createdAt || call.requestedAt || call.startTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {formatTime(call.durationSeconds)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              ${((call.durationSeconds || 0) / 60 * (call.ratePerMin || 0)).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(call.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              ${(call.ratePerMin || 0).toFixed(2)}/min
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug Info (Visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 mt-6 bg-gray-100">
            <h4 className="font-bold text-gray-700 mb-2">Debug Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Psychic:</strong> {psychic?.name || 'Not logged in'}</p>
                <p><strong>ID:</strong> {psychic?._id?.slice(-8) || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Pending Calls:</strong> {pendingCalls.length}</p>
                <p><strong>Call History:</strong> {callHistory.length}</p>
              </div>
              <div>
                <p><strong>Active Tab:</strong> {activeTab}</p>
                <p><strong>Loading:</strong> Pending: {isLoading.pending ? 'Yes' : 'No'}, History: {isLoading.history ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PsychicCallHistoryPage;