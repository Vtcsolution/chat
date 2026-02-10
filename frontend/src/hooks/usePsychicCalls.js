import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import audioSocketManager from '@/utils/audioSocket'; // Import the manager

export const usePsychicCalls = () => {
  const [pendingCalls, setPendingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const psychicId = localStorage.getItem('psychicId');
  const psychicToken = localStorage.getItem('psychicToken');

  // Create axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001',
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${psychicToken}`
    }
  });

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!psychicId || !psychicToken) {
      console.log('❌ Cannot initialize audio socket: Missing psychic ID or token');
      return;
    }

    console.log('🔌 Initializing audio socket for psychic:', psychicId);
    
    // Disconnect existing audio socket
    audioSocketManager.disconnect();
    
    // Connect to audio namespace
    const socket = audioSocketManager.connect(psychicId, psychicToken);
    socketRef.current = socket;

    // Listen for audio socket events
    socket.on('connect', () => {
      console.log('✅ Audio socket connected via manager');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Audio socket disconnected via manager');
      setSocketConnected(false);
    });

    socket.on('incoming-call', (data) => {
      console.log('📞 Incoming call received:', data);
      
      setPendingCalls(prev => {
        const exists = prev.find(call => call._id === data.callRequestId);
        if (exists) return prev;
        
        return [...prev, {
          _id: data.callRequestId,
          callRequestId: data.callRequestId,
          userId: data.userId,
          user: data.user,
          status: 'pending',
          requestedAt: data.requestedAt,
          expiresAt: data.expiresAt,
          roomName: data.roomName,
          isFreeSession: data.isFreeSession
        }];
      });
      
      toast.info(`📞 Incoming call from ${data.user?.firstName || 'User'}`, {
        duration: 30000,
        action: {
          label: 'Answer',
          onClick: () => {
            window.open(`/psychic/call/${data.callRequestId}`, '_blank');
          }
        }
      });
    });

    socket.on('pending-calls', (calls) => {
      console.log('📋 Received pending calls:', calls?.length || 0);
      setPendingCalls(calls || []);
    });

    socket.on('call-token', (data) => {
      console.log('🔑 Call token received:', data);
      
      setActiveCall(prev => ({
        ...prev,
        token: data.token,
        roomName: data.roomName,
        callSessionId: data.callSessionId,
        status: 'accepted'
      }));
      
      toast.success('Call accepted! Getting ready...');
    });

    socket.on('timer-started', (data) => {
      console.log('⏱️ Timer started:', data);
      
      setActiveCall(prev => ({
        ...prev,
        status: 'active',
        startTime: data.startTime
      }));
      
      toast.success('Call connected!');
    });

    socket.on('call-completed', (data) => {
      console.log('📞 Call completed:', data);
      
      setActiveCall(null);
      
      toast.info(`Call completed. Duration: ${data.duration || 0} seconds`);
    });

    socket.on('call-cancelled', (data) => {
      console.log('❌ Call cancelled:', data);
      
      setPendingCalls(prev => 
        prev.filter(call => call._id !== data.callRequestId)
      );
      
      toast.info('Call cancelled by user');
    });

    socket.on('call-error', (error) => {
      console.error('❌ Call error:', error);
      toast.error(error.message || 'Call error occurred');
    });

    // Fetch initial pending calls
    fetchPendingCalls();
    
    return () => {
      audioSocketManager.disconnect();
    };
  }, [psychicId, psychicToken]);

  // Fetch pending calls from API
  const fetchPendingCalls = useCallback(async () => {
    if (!psychicId) return;
    
    try {
      setIsLoading(true);
      const response = await api.get('/api/calls/pending');
      
      if (response.data.success) {
        console.log('📋 Fetched pending calls:', response.data.data?.length || 0);
        setPendingCalls(response.data.data || []);
      } else {
        console.error('Failed to fetch pending calls:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching pending calls:', error);
      // Don't show toast, it's okay if it fails initially
    } finally {
      setIsLoading(false);
    }
  }, [psychicId, api]);

  // Accept call
  const acceptCall = useCallback(async (callRequestId) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to audio server');
      return;
    }

    try {
      console.log('✅ Accepting call:', callRequestId);
      
      const callRequest = pendingCalls.find(call => call._id === callRequestId);
      if (!callRequest) {
        toast.error('Call request not found');
        return;
      }

      // Emit accept event
      socketRef.current.emit('accept-call', {
        callRequestId,
        roomName: callRequest.roomName
      });

      // Move from pending to active
      setPendingCalls(prev => prev.filter(call => call._id !== callRequestId));
      
      setActiveCall({
        ...callRequest,
        status: 'accepted',
        acceptedAt: new Date()
      });

      // Update psychic status to busy
      try {
        await api.put('/api/psychic/status', { status: 'busy' });
      } catch (error) {
        console.error('Error updating psychic status:', error);
      }
      
      toast.success('Call accepted! Getting ready...');
      
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error(error.message || 'Failed to accept call');
    }
  }, [pendingCalls, api]);

  // Reject call
  const rejectCall = useCallback(async (callRequestId, reason = 'Not available') => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      console.log('❌ Rejecting call:', callRequestId);
      
      socketRef.current.emit('reject-call', {
        callRequestId,
        reason
      });

      setPendingCalls(prev => prev.filter(call => call._id !== callRequestId));
      
      toast.info('Call rejected');
      
    } catch (error) {
      console.error('Error rejecting call:', error);
      toast.error('Failed to reject call');
    }
  }, []);

  // End active call
  const endCall = useCallback(async (endReason = 'ended_by_psychic') => {
    if (!socketRef.current?.connected || !activeCall) {
      toast.error('No active call');
      return;
    }

    try {
      console.log('🛑 Ending call:', activeCall.callSessionId);
      
      socketRef.current.emit('call-ended', {
        callSessionId: activeCall.callSessionId,
        endReason
      });

      setActiveCall(null);
      
      try {
        await api.put('/api/psychic/status', { status: 'online' });
      } catch (error) {
        console.error('Error updating psychic status:', error);
      }
      
      toast.info('Call ended');
      
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  }, [activeCall, api]);

  // Cancel call
  const cancelCall = useCallback(async (callRequestId) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      socketRef.current.emit('cancel-call', { callRequestId });
      
      setPendingCalls(prev => prev.filter(call => call._id !== callRequestId));
      
      toast.info('Call cancelled');
      
    } catch (error) {
      console.error('Error cancelling call:', error);
      toast.error('Failed to cancel call');
    }
  }, []);

  // Check if call is expired
  const isCallExpired = useCallback((expiresAt) => {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  }, []);

  // Get time remaining for call request
  const getTimeRemaining = useCallback((expiresAt) => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.max(0, Math.floor((expires - now) / 1000));
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (psychicId && psychicToken) {
      console.log('🔧 Initializing psychic calls...');
      initializeSocket();
    } else {
      console.log('❌ Missing psychic ID or token');
    }

    return () => {
      audioSocketManager.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initializeSocket, psychicId, psychicToken]);

  return {
    pendingCalls,
    activeCall,
    socket: socketRef.current,
    socketConnected,
    isLoading,
    fetchPendingCalls,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
    isCallExpired,
    getTimeRemaining,
    initializeSocket
  };
};