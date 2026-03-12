// src/pages/psychic/PsychicActiveCallPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePsychicAuth } from '../context/PsychicAuthContext';
import { 
  Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff,
  User, Clock, DollarSign, AlertCircle, CheckCircle,
  ArrowLeft, Wifi, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import twilioService from '@/services/twilioService';
import audioSocketManager from '@/utils/audioSocket';

const PsychicActiveCallPage = () => {
  const navigate = useNavigate();
  const { callRequestId } = useParams();
  const { psychic, colors } = usePsychicAuth();
  
  // State
  const [activeCall, setActiveCall] = useState(null);
  const [callDetails, setCallDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState('loading');
  const [isConnecting, setIsConnecting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [error, setError] = useState(null);
  const [isCheckingActiveCall, setIsCheckingActiveCall] = useState(false);
  const [twilioToken, setTwilioToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastServerSync, setLastServerSync] = useState(0);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Create axios instance
  const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
  
  const api = useRef(
    axios.create({
      baseURL: API_BASE,
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
          console.log('✅ Token added to request:', token.substring(0, 20) + '...');
        } else {
          console.log('❌ No token found in localStorage');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.current.interceptors.request.eject(requestInterceptor);
    };
  }, []);
  
  // Refs
  const socketRef = useRef(null);
  const countdownRef = useRef(null);
  const audioPermissionRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const verifyIntervalRef = useRef(null);
  const initializedRef = useRef(false);
  const callSessionIdRef = useRef(null);
  const twilioConnectedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const autoConnectTimerRef = useRef(null);
  const connectionCheckIntervalRef = useRef(null);
  const tokenCheckIntervalRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  // Color scheme fallback
  const colorScheme = colors || {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Stop all intervals
  const stopAllIntervals = useCallback(() => {
    console.log('🛑 Stopping all intervals');
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
      verifyIntervalRef.current = null;
    }
    if (autoConnectTimerRef.current) {
      clearTimeout(autoConnectTimerRef.current);
      autoConnectTimerRef.current = null;
    }
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  }, []);

  // Clean up Twilio
  const cleanupTwilio = useCallback(() => {
    console.log('🧹 Cleaning up Twilio');
    try {
      twilioService.endCall();
      twilioService.cleanup();
    } catch (error) {
      console.error('Error cleaning up Twilio:', error);
    }
    twilioConnectedRef.current = false;
    removeAudioPermissionHandler();
    setIsAudioPlaying(false);
    setConnectionStatus('disconnected');
  }, []);

  // Remove audio permission handler
  const removeAudioPermissionHandler = useCallback(() => {
    if (audioPermissionRef.current) {
      document.removeEventListener('click', audioPermissionRef.current);
      audioPermissionRef.current = null;
    }
  }, []);

  // Handle call end from server
  const handleCallEndFromServer = useCallback((data) => {
    console.log('🛑 Handling server call end:', data);
    
    stopAllIntervals();
    cleanupTwilio();
    setCallStatus('completed');
    setActiveCall(null);
    
    const message = data.endReason === 'ended_by_user' ? 'User ended the call' : 'Call has ended';
    toast.info(message);
    
    setTimeout(() => {
      navigate('/psychic/dashboard/call-history');
    }, 2000);
  }, [stopAllIntervals, cleanupTwilio, navigate]);

  // Poll timer from server using dedicated psychic sync endpoint
  const startTimerPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    console.log('⏱️ Starting timer polling from psychic sync endpoint');
    
    pollIntervalRef.current = setInterval(async () => {
      const currentSessionId = callSessionIdRef.current || callDetails?.callSessionId;
      
      if (!currentSessionId || (callStatus !== 'in-progress' && callStatus !== 'ringing')) {
        return;
      }
      
      try {
        const response = await api.current.get(`/api/calls/psychic/sync-timer/${currentSessionId}`);
        
        if (response.data.success) {
          const data = response.data.data;
          
          if (data.status === 'completed' || data.status === 'ended' || data.status === 'failed') {
            console.log('⚠️ Server reports call ended during polling');
            handleCallEndFromServer(data);
            return;
          }
          
          if (data.status === 'in-progress' && callStatus === 'ringing') {
            console.log('🔄 Updating status from ringing to in-progress based on server data');
            setCallStatus('in-progress');
          }
          
          if (data.elapsedSeconds !== undefined) {
            setElapsedTime(data.elapsedSeconds);
            setLastServerSync(Date.now());
            setSyncStatus('synced');
          }
          
          if (data.creditsUsed !== undefined) {
            setEarnings(data.creditsUsed);
          } else if (callDetails?.ratePerMin && data.elapsedSeconds !== undefined) {
            const calculatedEarnings = (data.elapsedSeconds / 60) * (callDetails.ratePerMin || 1);
            setEarnings(parseFloat(calculatedEarnings.toFixed(2)));
          }
        }
      } catch (error) {
        console.error('Error polling timer:', error);
        setSyncStatus('error');
        
        if (error.response?.status === 404) {
          handleCallEndFromServer({
            endReason: 'call_ended',
            creditsUsed: earnings
          });
        }
      }
    }, 1000);
    
  }, [API_BASE, callStatus, callDetails, earnings, handleCallEndFromServer]);

  // Auto-connect to Twilio when we have token and room name
  const attemptAutoConnect = useCallback(async (token, room) => {
    if (!token || !room) {
      console.log('⏳ Waiting for token and room to connect...', { token: !!token, room: !!room });
      return false;
    }

    if (twilioConnectedRef.current) {
      console.log('✅ Already connected to Twilio');
      setConnectionStatus('connected');
      return true;
    }

    if (isConnecting) {
      console.log('⏳ Connection already in progress');
      return false;
    }

    console.log('🚀 Attempting auto-connect to Twilio:', { room });
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      await twilioService.initialize();
      console.log('📞 Joining room:', room);
      await twilioService.joinRoom(token, room);
      
      twilioConnectedRef.current = true;
      setConnectionStatus('connected');
      setCallStatus('in-progress');
      setIsConnecting(false);
      
      setupAudioPermissionHandler();
      startTimerPolling();
      
      console.log('✅ Auto-connect successful');
      toast.success('Audio connected!');
      
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Auto-connect failed:', error);
      setConnectionStatus('failed');
      setIsConnecting(false);
      twilioConnectedRef.current = false;
      
      autoConnectTimerRef.current = setTimeout(() => {
        if (!twilioConnectedRef.current && token && room) {
          console.log('🔄 Retrying auto-connect...');
          attemptAutoConnect(token, room);
        }
      }, 3000);
      
      return false;
    }
  }, [isConnecting, startTimerPolling]);

  // Function to check call status from server
  const checkCallStatus = useCallback(async () => {
    const currentSessionId = callSessionIdRef.current || callDetails?.callSessionId;
    if (!currentSessionId) return;
    
    try {
      const response = await api.current.get(`/api/calls/status/${currentSessionId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('📊 Status check result:', { serverStatus: data.status, localStatus: callStatus });
        
        if (data.status === 'in-progress' && callStatus === 'ringing') {
          console.log('🔄 Correcting status from ringing to in-progress based on status check');
          setCallStatus('in-progress');
        }
        
        if (data.status === 'ended' || data.status === 'completed' || data.status === 'failed') {
          console.log('⚠️ Status check shows call ended');
          handleCallEndFromServer(data);
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  }, [API_BASE, callStatus, callDetails, handleCallEndFromServer]);

  // Function to wait for token and connect
  const waitForTokenAndConnect = useCallback(() => {
    console.log('🔍 Starting token availability check...');
    
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
    }
    
    tokenCheckIntervalRef.current = setInterval(() => {
      console.log('⏰ Checking token availability:', {
        hasToken: !!twilioToken,
        tokenLength: twilioToken?.length,
        hasRoom: !!roomName,
        isConnected: twilioConnectedRef.current,
        callStatus
      });
      
      if (twilioToken && roomName && !twilioConnectedRef.current) {
        console.log('🎯 Token and room available! Attempting auto-connect...');
        attemptAutoConnect(twilioToken, roomName);
        
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current);
          tokenCheckIntervalRef.current = null;
        }
      }
      
      if (twilioConnectedRef.current) {
        console.log('✅ Already connected, stopping token check');
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current);
          tokenCheckIntervalRef.current = null;
        }
      }
    }, 500);
  }, [twilioToken, roomName, callStatus, attemptAutoConnect]);

  // Fetch call details
  const fetchCallDetails = useCallback(async (requestId) => {
    console.log(`📞 Fetching call details for: ${requestId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoints = [
        `/api/calls/details/${requestId}`,
        `/api/calls/request/${requestId}`,
        `/api/calls/status/${requestId}`
      ];
      
      let response = null;
      let data = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${API_BASE}${endpoint}`);
          response = await api.current.get(endpoint);
          
          if (response?.data?.success) {
            data = response.data.data || response.data;
            console.log(`✅ Success from endpoint: ${endpoint}`, data);
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }
      
      if (!data) {
        throw new Error('Failed to fetch call details from all endpoints');
      }
      
      let callRequestData = data.callRequest || data;
      let userData = data.user || data.userId || {};
      let activeSessionData = data.activeSession || {};
      
      if (activeSessionData._id || callRequestData.callSessionId || data._id) {
        callSessionIdRef.current = activeSessionData._id || callRequestData.callSessionId || data._id;
        console.log('📌 Call Session ID set:', callSessionIdRef.current);
      }
      
      setCallDetails(callRequestData);
      setUserDetails(userData);
      
      let status = 'pending';
      
      if (data.elapsedSeconds !== undefined && data.elapsedSeconds > 0) {
        console.log('⚠️ Elapsed time detected, forcing status to in-progress');
        status = 'in-progress';
      } else if (activeSessionData?.status) {
        status = activeSessionData.status;
      } else if (callRequestData?.status) {
        status = callRequestData.status;
      } else if (data?.status) {
        status = data.status;
      }
      
      setCallStatus(status);
      console.log('📊 Final call status:', status);
      
      const newRoomName = activeSessionData?.roomName || data?.roomName;
      const newTwilioToken = activeSessionData?.participantTokens?.psychic || data?.participantTokens?.psychic;
      
      if (newRoomName) {
        console.log('🏠 Room name set:', newRoomName);
        setRoomName(newRoomName);
      }
      
      if (newTwilioToken) {
        console.log('🔑 Twilio token set (length):', newTwilioToken.length);
        setTwilioToken(newTwilioToken);
      }
      
      if (data.timeRemaining !== undefined) {
        setTimeRemaining(data.timeRemaining);
      } else if (callRequestData.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(callRequestData.expiresAt);
        setTimeRemaining(Math.max(0, Math.floor((expiresAt - now) / 1000)));
      }
      
      if (data.elapsedSeconds !== undefined) {
        console.log('📅 Using server elapsed time:', data.elapsedSeconds);
        setElapsedTime(data.elapsedSeconds);
        
        const ratePerMin = callRequestData.ratePerMin || 1;
        const initialEarnings = (data.elapsedSeconds / 60) * ratePerMin;
        setEarnings(parseFloat(initialEarnings.toFixed(2)));
      } else if (activeSessionData.startTime) {
        const startTime = new Date(activeSessionData.startTime);
        const now = new Date();
        const calculatedElapsed = Math.max(0, Math.floor((now - startTime) / 1000));
        console.log('📅 Calculated elapsed time:', calculatedElapsed);
        setElapsedTime(calculatedElapsed);
        
        const ratePerMin = callRequestData.ratePerMin || 1;
        const initialEarnings = (calculatedElapsed / 60) * ratePerMin;
        setEarnings(parseFloat(initialEarnings.toFixed(2)));
      }
      
      startTimerPolling();
      
      setDataFetched(true);
      
      console.log('✅ Call details loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching call details:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load call details');
      toast.error('Failed to load call details');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, navigate, startTimerPolling]);

  // Check psychic active call
  const checkPsychicActiveCall = useCallback(async () => {
    console.log('🔍 Checking for psychic active call...');
    setIsCheckingActiveCall(true);
    
    try {
      const response = await api.current.get('/api/calls/psychic/active');
      
      console.log('📊 Psychic active call response:', response.data);
      
      if (response.data.success && response.data.data) {
        const activeCallData = response.data.data;
        setActiveCall(activeCallData);
        
        if (activeCallData.callSessionId) {
          callSessionIdRef.current = activeCallData.callSessionId;
        }
        
        const targetCallRequestId = callRequestId || activeCallData.callRequestId;
        
        if (targetCallRequestId) {
          await fetchCallDetails(targetCallRequestId);
        } else {
          setError('No active calls found');
          setIsLoading(false);
        }
      } else {
        console.log('ℹ️ No active call found for psychic');
        if (callRequestId) {
          await fetchCallDetails(callRequestId);
        } else {
          setError('No active calls found');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ Error checking psychic active call:', error);
      if (callRequestId) {
        await fetchCallDetails(callRequestId);
      } else {
        setError('Failed to check active calls');
        setIsLoading(false);
      }
    } finally {
      setIsCheckingActiveCall(false);
    }
  }, [API_BASE, navigate, callRequestId, fetchCallDetails]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const psychicId = localStorage.getItem('psychicId');
    const psychicToken = localStorage.getItem('psychicToken');

    if (!psychicId || !psychicToken) {
      console.log('❌ Missing psychic credentials');
      return;
    }

    console.log('🔌 Initializing audio socket for psychic:', psychicId);
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      audioSocketManager.disconnect();
    }
    
    const socket = audioSocketManager.connect(psychicId, psychicToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Audio socket connected');
      setSocketConnected(true);
      reconnectAttemptsRef.current = 0;
      
      socket.emit('psychic-register', psychicId);
      
      if (roomName) {
        console.log('📡 Joining room on connect:', roomName);
        socket.emit('join-room', roomName);
        setHasJoinedRoom(true);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Audio socket disconnected:', reason);
      setSocketConnected(false);
      setHasJoinedRoom(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current > 5) {
        toast.error('Connection issues. Trying to reconnect...');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setSocketConnected(true);
      
      socket.emit('psychic-register', psychicId);
      if (roomName) {
        socket.emit('join-room', roomName);
      }
    });

    socket.on('timer-sync', (data) => {
      console.log('⏱️ Timer sync event from server:', data);
      
      if (data.callSessionId === callSessionIdRef.current && data.elapsedSeconds !== undefined) {
        setElapsedTime(data.elapsedSeconds);
        setLastServerSync(Date.now());
        
        if (callStatus === 'ringing') {
          console.log('🔄 Updating status from ringing to in-progress based on timer sync');
          setCallStatus('in-progress');
        }
      }
    });

    socket.on('call-completed', (data) => {
      console.log('📞 Call completed event:', data);
      
      if (data.callSessionId === callSessionIdRef.current || data.callRequestId === callRequestId) {
        handleCallEndFromServer(data);
      }
    });

    socket.on('call-ended', (data) => {
      console.log('📞 Call ended event:', data);
      
      if (data.callSessionId === callSessionIdRef.current || data.callRequestId === callRequestId) {
        handleCallEndFromServer(data);
      }
    });

    socket.on('timer-stopped', (data) => {
      console.log('⏱️ Timer stopped event:', data);
      
      if (data.callSessionId === callSessionIdRef.current) {
        stopAllIntervals();
        if (data.finalTime !== undefined) {
          setElapsedTime(data.finalTime);
        }
        if (data.status) {
          setCallStatus(data.status);
        }
      }
    });

    socket.on('room-closed', (data) => {
      console.log('🚪 Room closed:', data);
      
      if (data.roomName === roomName) {
        handleCallEndFromServer({ endReason: 'room_closed' });
      }
    });

    socket.on('call-cancelled', (data) => {
      console.log('❌ Call cancelled:', data);
      
      if (data.callRequestId === callRequestId) {
        stopAllIntervals();
        cleanupTwilio();
        setCallStatus('cancelled');
        toast.info('User cancelled the call');
        
        setTimeout(() => {
          navigate('/psychic/dashboard');
        }, 2000);
      }
    });

    return socket;
  }, [roomName, callRequestId, handleCallEndFromServer, stopAllIntervals, cleanupTwilio, navigate, callStatus]);

  // Accept call
  const acceptCall = async () => {
    try {
      const requestId = callRequestId || activeCall?.callRequestId;
      
      if (!requestId) {
        toast.error('No call request ID found');
        return;
      }
      
      console.log(`📞 Accepting call: ${requestId}`);
      setIsConnecting(true);
      
      const response = await api.current.post(`/api/calls/accept/${requestId}`, {});
      
      if (response.data.success) {
        const { token: twilioToken, roomName: callRoomName, callSessionId } = response.data.data;
        
        setTwilioToken(twilioToken);
        setRoomName(callRoomName);
        setCallStatus('ringing');
        
        if (callSessionId) {
          callSessionIdRef.current = callSessionId;
        }
        
        await attemptAutoConnect(twilioToken, callRoomName);
        
        toast.success('Call accepted! Connecting audio...');
      } else {
        toast.error(response.data.message || 'Failed to accept call');
      }
      
    } catch (error) {
      console.error('❌ Error accepting call:', error);
      toast.error(error.response?.data?.message || 'Failed to accept call');
    } finally {
      setIsConnecting(false);
    }
  };

  // Reject call
  const handleRejectCall = async () => {
    try {
      const requestId = callRequestId || activeCall?.callRequestId;
      
      if (!requestId) {
        toast.error('No call request to reject');
        return;
      }
      
      await api.current.post(`/api/calls/reject/${requestId}`, {
        reason: 'Not available'
      });
      
      toast.success('Call rejected');
      navigate('/psychic/dashboard');
      
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
      toast.error('Failed to reject call');
    }
  };

  // End call
  const handleEndCall = async () => {
    try {
      const currentCallSessionId = callSessionIdRef.current || callDetails?.callSessionId;
      
      if (!currentCallSessionId) {
        console.error('No call session ID found');
        toast.error('Cannot end call - missing session ID');
        return;
      }
      
      console.log('🛑 Psychic ending call:', currentCallSessionId);
      
      stopAllIntervals();
      
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('call-ended', {
          callSessionId: currentCallSessionId,
          endReason: 'ended_by_psychic'
        });
      }
      
      cleanupTwilio();
      
      try {
        await api.current.post(`/api/calls/end/${currentCallSessionId}`, {
          endReason: 'ended_by_psychic'
        });
      } catch (apiError) {
        console.error('API end call error:', apiError);
      }
      
      setCallStatus('ended');
      setActiveCall(null);
      toast.success('Call ended successfully');
      
      setTimeout(() => {
        navigate('/psychic/dashboard/call-history');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  // Setup audio permission handler
  const setupAudioPermissionHandler = () => {
    removeAudioPermissionHandler();

    audioPermissionRef.current = async () => {
      console.log('🎧 Audio permission click handler triggered');
      
      try {
        const audioElements = document.querySelectorAll('audio');
        let playedAny = false;
        
        for (const audio of audioElements) {
          if (audio.paused) {
            try {
              await audio.play();
              playedAny = true;
              console.log('✅ Played audio element');
            } catch (playError) {
              console.log('⚠️ Could not play audio:', playError);
            }
          }
        }
        
        if (playedAny) {
          setIsAudioPlaying(true);
          removeAudioPermissionHandler();
          toast.success('Audio enabled!');
        }
      } catch (error) {
        console.error('Error in audio handler:', error);
      }
    };

    document.addEventListener('click', audioPermissionRef.current);

    setTimeout(() => {
      if (!isAudioPlaying && callStatus === 'in-progress') {
        toast.info('Click anywhere on the page to enable audio');
      }
    }, 2000);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (twilioService && typeof twilioService.toggleMute === 'function') {
      twilioService.toggleMute(newMutedState);
    }
    
    toast.info(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
  };

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  // Format functions
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds) => {
    if (seconds == null) return 'No time limit';
    if (seconds <= 0) return 'Expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Status badge helpers
  const getStatusBadge = () => {
    const badges = {
      'pending': { text: 'Pending', color: 'bg-yellow-500' },
      'ringing': { text: 'Ringing', color: 'bg-blue-500' },
      'in-progress': { text: 'In Progress', color: 'bg-green-500' },
      'ended': { text: 'Ended', color: 'bg-gray-500' },
      'completed': { text: 'Completed', color: 'bg-purple-500' },
      'cancelled': { text: 'Cancelled', color: 'bg-red-500' },
      'expired': { text: 'Expired', color: 'bg-red-500' },
      'rejected': { text: 'Rejected', color: 'bg-red-500' },
      'failed': { text: 'Failed', color: 'bg-red-500' },
      'loading': { text: 'Loading', color: 'bg-gray-500' }
    };
    
    return badges[callStatus] || badges['loading'];
  };

  const getConnectionBadge = () => {
    const badges = {
      'connected': { text: 'Audio Connected', color: 'bg-green-500' },
      'connecting': { text: 'Connecting...', color: 'bg-blue-500' },
      'disconnected': { text: 'Audio Disconnected', color: 'bg-gray-500' },
      'failed': { text: 'Connection Failed', color: 'bg-red-500' }
    };
    
    return badges[connectionStatus] || badges['disconnected'];
  };

  // Countdown timer for pending calls
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && callStatus === 'pending') {
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setCallStatus('expired');
            toast.error('Call request expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [timeRemaining, callStatus]);

  // Status verification (backup)
  useEffect(() => {
    const currentSessionId = callSessionIdRef.current || callDetails?.callSessionId;
    if (!currentSessionId) return;
    
    console.log('🔍 Starting status verification interval');
    
    statusCheckIntervalRef.current = setInterval(() => {
      checkCallStatus();
    }, 2000);
    
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [callDetails, checkCallStatus]);

  // Effect to join socket room when room name is available
  useEffect(() => {
    if (socketRef.current && socketConnected && roomName && !hasJoinedRoom) {
      console.log(`📡 Joining socket room: ${roomName}`);
      socketRef.current.emit('join-room', roomName);
      setHasJoinedRoom(true);
    }
  }, [roomName, socketConnected, hasJoinedRoom]);

  // Auto-connect effect
  useEffect(() => {
    console.log('🔍 Auto-connect check:', {
      callStatus,
      hasToken: !!twilioToken,
      tokenLength: twilioToken?.length,
      hasRoom: !!roomName,
      isConnected: twilioConnectedRef.current,
      isConnecting
    });
    
    if (twilioConnectedRef.current) {
      console.log('✅ Already connected to Twilio');
      return;
    }
    
    if (twilioToken && roomName && !twilioConnectedRef.current && !isConnecting) {
      console.log('🔌 Token and room available! Attempting immediate connection...');
      attemptAutoConnect(twilioToken, roomName);
    } 
    else if ((callStatus === 'in-progress' || callStatus === 'ringing') && (!twilioToken || !roomName) && !twilioConnectedRef.current) {
      console.log('⏳ Call in progress but missing token/room. Starting token check...');
      waitForTokenAndConnect();
    }
    
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
    };
  }, [callStatus, twilioToken, roomName, attemptAutoConnect, waitForTokenAndConnect, isConnecting]);

  // Initialize on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    console.log('🎯 Component mounted with callRequestId:', callRequestId);
    
    const socket = initializeSocket();
    socketRef.current = socket;
    
    if (callRequestId) {
      fetchCallDetails(callRequestId);
    } else {
      checkPsychicActiveCall();
    }
    
    return () => {
      console.log('🧹 Cleaning up component');
      stopAllIntervals();
      cleanupTwilio();
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        audioSocketManager.disconnect();
      }
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      initializedRef.current = false;
      twilioConnectedRef.current = false;
    };
  }, [callRequestId]);

  // Update earnings when elapsed time changes
  useEffect(() => {
    if (callStatus === 'in-progress' && callDetails) {
      const ratePerMin = callDetails.ratePerMin || 1;
      const currentEarnings = (elapsedTime / 60) * ratePerMin;
      setEarnings(parseFloat(currentEarnings.toFixed(2)));
    }
  }, [elapsedTime, callStatus, callDetails]);

  // Debug logging
  useEffect(() => {
    console.log('📊 Current state:', {
      callStatus,
      connectionStatus,
      twilioToken: twilioToken ? 'present' : 'missing',
      tokenLength: twilioToken?.length,
      roomName: roomName || 'missing',
      twilioConnected: twilioConnectedRef.current,
      elapsedTime,
      socketConnected
    });
  }, [callStatus, connectionStatus, twilioToken, roomName, elapsedTime, socketConnected]);

  // Loading state
  if (isLoading || isCheckingActiveCall) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ backgroundColor: colorScheme.deepPurple }}>
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6" 
            style={{ backgroundColor: colorScheme.antiqueGold + '20' }}>
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin" style={{ color: colorScheme.antiqueGold }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
            {isCheckingActiveCall ? 'Finding Your Call...' : 'Loading Call Details...'}
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">
            Please wait while we connect you to the call
          </p>
          <div className="flex justify-center gap-3 sm:gap-4">
            <Button
              onClick={() => navigate('/psychic/dashboard')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !callDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ backgroundColor: colorScheme.deepPurple }}>
        <Card className="p-4 sm:p-6 md:p-8 max-w-md w-full bg-white/5 backdrop-blur-sm border-white/10">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-400" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
              {activeCall ? 'Call Connection Issue' : 'No Active Call Found'}
            </h2>
            <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">
              {error || 'You don\'t have any active calls at the moment.'}
            </p>
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={checkPsychicActiveCall}
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Check for Calls Again</span>
                <span className="sm:hidden">Check Again</span>
              </Button>
              <Button
                onClick={() => navigate('/psychic/dashboard')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 text-sm sm:text-base py-2 sm:py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Return to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // MAIN RENDER - FULLY RESPONSIVE
  return (
    <div className="min-h-screen" style={{ backgroundColor: colorScheme.deepPurple }}>
      <div className="relative z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button
              onClick={() => navigate('/psychic/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2 h-auto"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            
            <Badge className={`${getStatusBadge().color} text-white px-2 sm:px-3 py-1 text-xs sm:text-sm`}>
              <span className="font-medium">{getStatusBadge().text}</span>
            </Badge>
            
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
              <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white/60 text-xs hidden sm:inline">{socketConnected ? 'Live' : 'Offline'}</span>
            </div>

            {callStatus === 'in-progress' && (
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                <div className={`h-2 w-2 rounded-full ${Date.now() - lastServerSync < 2000 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-white/60 text-xs hidden sm:inline">
                  {Date.now() - lastServerSync < 2000 ? 'Synced' : 'Syncing'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 text-white/80 ml-auto sm:ml-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full px-2 sm:px-3 py-1">
              <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs hidden sm:inline">Strong</span>
            </div>
            <div className="text-xs sm:text-sm bg-white/10 rounded-full px-2 sm:px-3 py-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        
        {/* User Card - Fully Responsive */}
        <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 bg-white/5 backdrop-blur-sm border-white/10">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-3 sm:border-4 mx-auto sm:mx-0" 
              style={{ borderColor: colorScheme.antiqueGold }}>
              <AvatarImage 
                src={userDetails?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.firstName || 'User')}&background=${colorScheme.antiqueGold.replace('#', '')}&color=${colorScheme.deepPurple.replace('#', '')}`} 
                alt={userDetails?.firstName}
              />
              <AvatarFallback className="text-xl sm:text-2xl font-bold" 
                style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}>
                {userDetails?.firstName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                    {userDetails?.firstName || 'Client'} {userDetails?.lastName || ''}
                  </h1>
                  <p className="text-white/70 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>ID: {userDetails?._id?.slice(-6) || 'N/A'}</span>
                  </p>
                </div>
                
                <div className="text-center sm:text-right">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    ${(callDetails.ratePerMin || 1).toFixed(2)}
                    <span className="text-xs font-normal text-white/70">/min</span>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-500 text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Active Rate
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/70" />
                  <span className="text-white text-xs sm:text-sm">
                    {callStatus === 'in-progress' 
                      ? formatTime(elapsedTime)
                      : callStatus === 'pending'
                      ? formatCountdown(timeRemaining)
                      : callStatus
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${getConnectionBadge().color}`} />
                  <span className="text-white/70 text-xs hidden sm:inline">{getConnectionBadge().text}</span>
                </div>
                
                {callStatus === 'in-progress' && (
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <div className={`flex items-center gap-1 ${isMuted ? 'bg-red-500/20' : 'bg-white/10'} rounded-full px-2 py-1`}>
                      <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-xs text-white/70 hidden sm:inline">{isMuted ? 'Muted' : 'Mic On'}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${isAudioPlaying ? 'bg-green-500/20' : 'bg-yellow-500/20'} rounded-full px-2 py-1`}>
                      <div className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs text-white/70 hidden sm:inline">{isAudioPlaying ? 'Audio On' : 'Audio Off'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Main Call Interface - Fully Responsive */}
        <div className="container mx-auto px-0 sm:px-2 md:px-4">
          {/* Earnings Display - Responsive */}
          {callStatus === 'in-progress' && (
            <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 bg-white/5 backdrop-blur-sm border-white/10">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Earnings</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-400">${earnings.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Duration</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">{formatTime(elapsedTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Rate</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">${(callDetails.ratePerMin || 1).toFixed(2)}</p>
                </div>
              </div>
              <Progress 
                value={(elapsedTime % 60) * 1.6667} 
                className="mt-3 sm:mt-4 bg-white/20 h-1.5 sm:h-2"
                indicatorClassName="bg-green-500"
              />
              <p className="text-white/70 text-xs mt-2 text-center">
                Minute {Math.floor(elapsedTime / 60) + 1} • {60 - (elapsedTime % 60)}s left
              </p>
            </Card>
          )}
          
          {/* Call Timer Display - Responsive */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4 tracking-tighter">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-white/70 text-xs sm:text-sm md:text-base px-2">
              {callStatus === 'in-progress' 
                ? `Live call ${isAudioPlaying ? '• Audio Active' : '• Click to enable audio'}`
                : callStatus === 'ringing'
                ? 'Connecting to audio call...'
                : callStatus === 'pending'
                ? 'Incoming call request'
                : callStatus === 'expired'
                ? 'Call request expired'
                : callStatus === 'completed'
                ? 'Call completed'
                : callStatus === 'cancelled'
                ? 'Call cancelled by user'
                : 'Call has ended'
              }
            </p>
          </div>
          
          {/* Call Controls - Fully Responsive */}
          <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-8 sm:mb-12">
            {callStatus === 'pending' && (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Button
                  onClick={acceptCall}
                  size="lg"
                  className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg bg-green-600 hover:bg-green-700 text-white px-2"
                  disabled={timeRemaining !== null && timeRemaining <= 0}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
                  <span className="hidden xs:inline">Accept</span>
                </Button>
                
                <Button
                  onClick={handleRejectCall}
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg border-red-500 text-red-500 hover:bg-red-500/10 px-2"
                >
                  <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
                  <span className="hidden xs:inline">Reject</span>
                </Button>
              </div>
            )}
            
            {callStatus === 'ringing' && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin text-white mr-2 sm:mr-3" />
                <span className="text-white text-sm sm:text-base md:text-lg">Connecting Audio...</span>
              </div>
            )}
            
            {callStatus === 'in-progress' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <Button
                    onClick={handleMuteToggle}
                    size="lg"
                    variant="outline"
                    className={`h-12 sm:h-14 md:h-16 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/30 text-white hover:bg-white/10'}`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                  </Button>
                  
                  <Button
                    onClick={handleEndCall}
                    size="lg"
                    className="h-12 sm:h-14 md:h-16 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </Button>
                  
                  <Button
                    onClick={handleSpeakerToggle}
                    size="lg"
                    variant="outline"
                    className={`h-12 sm:h-14 md:h-16 ${!isSpeakerOn ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-white/30 text-white hover:bg-white/10'}`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />}
                  </Button>
                </div>
                
                {!isAudioPlaying && (
                  <div className="text-center">
                    <p className="text-white/70 text-xs sm:text-sm">
                      ⚡ Click anywhere to enable audio
                    </p>
                  </div>
                )}
                
                {connectionStatus === 'connecting' && (
                  <div className="text-center">
                    <p className="text-yellow-400 text-xs sm:text-sm">Connecting to audio... Please wait</p>
                  </div>
                )}
                
                {connectionStatus === 'failed' && (
                  <div className="text-center">
                    <p className="text-red-400 text-xs sm:text-sm">Connection failed. Retrying...</p>
                  </div>
                )}
              </div>
            )}
            
            {(callStatus === 'ended' || callStatus === 'completed' || callStatus === 'cancelled' || callStatus === 'expired') && (
              <Button
                onClick={() => navigate('/psychic/dashboard')}
                size="lg"
                className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg"
                style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" />
                <span className="hidden xs:inline">Return to Dashboard</span>
                <span className="xs:hidden">Dashboard</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychicActiveCallPage;