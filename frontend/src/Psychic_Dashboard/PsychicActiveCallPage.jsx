// src/pages/psychic/PsychicActiveCallPage.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  
  // Refs
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const earningsTimerRef = useRef(null);
  const pollRef = useRef(null);
  const audioPermissionRef = useRef(null);
  const roomListenersRef = useRef(null);
  const initializedRef = useRef(false);
  const startTimeRef = useRef(null);
  
  const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  // Color scheme fallback
  const colorScheme = colors || {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // 1. CHECK PSYCHIC ACTIVE CALL
  const checkPsychicActiveCall = async () => {
    console.log('🔍 Checking for psychic active call...');
    setIsCheckingActiveCall(true);
    
    try {
      const token = localStorage.getItem('psychicToken');
      if (!token) {
        toast.error('Please login first');
        navigate('/psychic/login');
        return;
      }

      const response = await axios.get(`${API_BASE}/api/calls/psychic/active`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('📊 Psychic active call response:', response.data);
      
      if (response.data.success && response.data.data) {
        const activeCallData = response.data.data;
        setActiveCall(activeCallData);
        
        const targetCallRequestId = callRequestId || activeCallData.callRequestId;
        
        if (targetCallRequestId) {
          await fetchCallDetails(targetCallRequestId);
        } else {
          if (callRequestId) {
            await fetchCallDetails(callRequestId);
          } else {
            setError('No active calls or call request ID provided');
            setIsLoading(false);
          }
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
  };

  // 2. FETCH CALL DETAILS
  const fetchCallDetails = async (requestId) => {
    console.log(`📞 Fetching call details for: ${requestId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('psychicToken');
      if (!token) {
        toast.error('Please login first');
        navigate('/psychic/login');
        return;
      }

      let endpoints = [
        `${API_BASE}/api/calls/details/${requestId}`,
        `${API_BASE}/api/calls/request/${requestId}`,
      ];
      
      let response = null;
      let data = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true,
            timeout: 5000
          });
          
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
      
      // Process the data
      let callRequestData = data.callRequest || data;
      let userData = data.user || data.userId || {};
      let activeSessionData = data.activeSession || {};
      
      // Set states
      setCallDetails(callRequestData);
      setUserDetails(userData);
      
      // Determine call status
      let status = 'pending';
      if (activeSessionData?.status) {
        status = activeSessionData.status;
      } else if (callRequestData?.status) {
        status = callRequestData.status;
      }
      setCallStatus(status);
      
      // Set room name and token
      if (activeSessionData?.roomName) {
        setRoomName(activeSessionData.roomName);
      }
      
      if (activeSessionData?.participantTokens?.psychic) {
        setTwilioToken(activeSessionData.participantTokens.psychic);
      }
      
      // Calculate time remaining
      let timeRemainingValue = null;
      if (data.timeRemaining !== undefined) {
        timeRemainingValue = data.timeRemaining;
      } else if (callRequestData.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(callRequestData.expiresAt);
        timeRemainingValue = Math.max(0, Math.floor((expiresAt - now) / 1000));
      }
      setTimeRemaining(timeRemainingValue);
      
      // Set initial earnings rate
      const ratePerMin = callRequestData.ratePerMin || 1;
      setEarnings(0); // Start from 0
      
      // If call is in progress, calculate elapsed time from start
      if (status === 'in-progress' && activeSessionData.startTime) {
        const startTime = new Date(activeSessionData.startTime);
        const now = new Date();
        const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
        console.log('📅 Calculated elapsed time from DB:', {
          startTime,
          now,
          elapsedSeconds
        });
        
        // Set initial elapsed time
        setElapsedTime(elapsedSeconds);
        
        // Store the actual start time reference
        startTimeRef.current = startTime.getTime();
        
        // Calculate initial earnings
        const initialEarnings = (elapsedSeconds / 60) * ratePerMin;
        setEarnings(parseFloat(initialEarnings.toFixed(2)));
        
        // Start timers
        setTimeout(() => {
          startCallTimer();
        }, 100);
      }
      
      console.log('✅ Call details loaded:', {
        status,
        user: userData.firstName,
        rate: ratePerMin,
        elapsedTime,
        earnings,
        timeRemaining: timeRemainingValue,
        hasRoom: !!activeSessionData?.roomName,
        hasToken: !!activeSessionData?.participantTokens?.psychic
      });
      
    } catch (error) {
      console.error('❌ Error fetching call details:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load call details');
      toast.error('Failed to load call details');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. START CALL TIMER - FIXED
  const startCallTimer = () => {
    console.log('⏱️ Starting call timer...');
    
    // Clear any existing timers first
    stopTimers();
    
    // Calculate the actual start time
    const actualStartTime = startTimeRef.current || (Date.now() - (elapsedTime * 1000));
    console.log('⏱️ Actual start time:', new Date(actualStartTime).toISOString());
    
    // Start the timer interval
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const newElapsedTime = Math.floor((now - actualStartTime) / 1000);
      
      setElapsedTime(prev => {
        // Only update if there's a change
        if (prev !== newElapsedTime) {
          console.log('⏱️ Timer update:', { prev, new: newElapsedTime });
          return newElapsedTime;
        }
        return prev;
      });
    }, 1000);
    
    // Start earnings calculator
    startEarningsCalculator();
    
    console.log('✅ Timer started successfully');
  };

  // 4. START EARNINGS CALCULATOR - FIXED
  const startEarningsCalculator = () => {
    console.log('💰 Starting earnings calculator...');
    
    if (!callDetails) {
      console.warn('⚠️ No call details for earnings calculation');
      return;
    }
    
    // Clear any existing earnings timer
    if (earningsTimerRef.current) {
      clearInterval(earningsTimerRef.current);
      earningsTimerRef.current = null;
    }
    
    const ratePerMin = callDetails.ratePerMin || 1;
    console.log('💰 Rate per minute:', ratePerMin);
    
    // Update earnings based on elapsed time
    const updateEarnings = () => {
      const currentEarnings = (elapsedTime / 60) * ratePerMin;
      const roundedEarnings = parseFloat(currentEarnings.toFixed(2));
      
      setEarnings(prev => {
        if (prev !== roundedEarnings) {
          console.log('💰 Earnings update:', { prev, new: roundedEarnings });
          return roundedEarnings;
        }
        return prev;
      });
    };
    
    // Initial calculation
    updateEarnings();
    
    // Update earnings every second
    earningsTimerRef.current = setInterval(() => {
      updateEarnings();
    }, 1000);
    
    console.log('✅ Earnings calculator started');
  };

  // 5. STOP ALL TIMERS
  const stopTimers = () => {
    console.log('🛑 Stopping all timers...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (earningsTimerRef.current) {
      clearInterval(earningsTimerRef.current);
      earningsTimerRef.current = null;
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 6. ACCEPT CALL
  const acceptCall = async () => {
    try {
      const token = localStorage.getItem('psychicToken');
      const requestId = callRequestId || activeCall?.callRequestId;
      
      if (!requestId) {
        toast.error('No call request ID found');
        return;
      }
      
      console.log(`📞 Accepting call: ${requestId}`);
      setIsConnecting(true);
      
      const response = await axios.post(
        `${API_BASE}/api/calls/accept/${requestId}`,
        {},
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
        const { token: twilioToken, roomName } = response.data.data;
        
        setTwilioToken(twilioToken);
        setRoomName(roomName);
        setCallStatus('ringing');
        
        // Set start time for timer
        startTimeRef.current = Date.now();
        
        // Initialize Twilio call
        await initializeTwilioCall(twilioToken, roomName);
        
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

  // 7. INITIALIZE TWILIO CALL
  const initializeTwilioCall = async (token, roomNameParam = null) => {
    if (!token) {
      toast.error('No Twilio token available');
      return;
    }

    try {
      console.log('🎤 Initializing Twilio Video call...');
      setConnectionStatus('connecting');
      
      const targetRoomName = roomNameParam || roomName;
      
      if (!targetRoomName) {
        throw new Error('Room name is required');
      }
      
      // Initialize Twilio
      await twilioService.initialize();
      
      // Join room
      await twilioService.joinRoom(token, targetRoomName);
      
      // Update states
      setCallStatus('in-progress');
      setConnectionStatus('connected');
      
      // Start timers if not already started
      if (!timerRef.current) {
        // Set start time if not already set
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now() - (elapsedTime * 1000);
        }
        
        startCallTimer();
      }
      
      // Setup audio permission handler
      setupAudioPermissionHandler();
      
      toast.success('Audio connected! You can now speak to the client.');
      
    } catch (error) {
      console.error('❌ Failed to connect to Twilio:', error);
      setConnectionStatus('failed');
      
      let errorMessage = 'Failed to connect audio';
      if (error.code === 20101) errorMessage = 'Invalid access token';
      else if (error.code === 53113) errorMessage = 'Room not found';
      else if (error.code === 53405) errorMessage = 'Room is full';
      
      toast.error(errorMessage);
    }
  };

  // 8. JOIN EXISTING CALL
  const joinExistingCall = async () => {
    if (!twilioToken || !roomName) {
      toast.error('Missing connection details');
      return;
    }
    
    try {
      console.log('🎤 Joining existing call...');
      setConnectionStatus('connecting');
      
      await initializeTwilioCall(twilioToken, roomName);
      
    } catch (error) {
      console.error('❌ Error joining existing call:', error);
      toast.error('Failed to join call');
      setConnectionStatus('failed');
    }
  };

  // 9. SETUP AUDIO PERMISSION HANDLER
  const setupAudioPermissionHandler = () => {
    // Remove existing handler
    if (audioPermissionRef.current) {
      document.removeEventListener('click', audioPermissionRef.current);
    }
    
    // Create new handler
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
    
    // Add click handler
    document.addEventListener('click', audioPermissionRef.current);
    
    // Show instruction
    setTimeout(() => {
      toast.info('Click anywhere on the page to enable audio');
    }, 1000);
  };

  // 10. REMOVE AUDIO HANDLER
  const removeAudioPermissionHandler = () => {
    if (audioPermissionRef.current) {
      document.removeEventListener('click', audioPermissionRef.current);
      audioPermissionRef.current = null;
    }
  };

  // 11. CLEANUP TWILIO
  const cleanupTwilio = () => {
    // Clear intervals
    if (roomListenersRef.current) {
      clearInterval(roomListenersRef.current);
      roomListenersRef.current = null;
    }
    
    // Remove audio handler
    removeAudioPermissionHandler();
    
    // Disconnect Twilio
    if (twilioService && typeof twilioService.disconnect === 'function') {
      twilioService.disconnect();
    }
    
    // Reset states
    setIsAudioPlaying(false);
    setConnectionStatus('disconnected');
    
    console.log('🧹 Twilio cleanup complete');
  };

  // 12. HANDLE MUTE TOGGLE
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (twilioService && typeof twilioService.toggleMute === 'function') {
      twilioService.toggleMute(newMutedState);
    }
    
    toast.info(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
  };

  // 13. HANDLE SPEAKER TOGGLE
  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  // 14. END CALL
  const handleEndCall = async () => {
    try {
      const token = localStorage.getItem('psychicToken');
      const callSessionId = activeCall?._id || callDetails?.callSessionId;
      
      // Cleanup Twilio first
      cleanupTwilio();
      
      // Stop timers
      stopTimers();
      
      // Notify backend
      if (callSessionId) {
        await axios.post(
          `${API_BASE}/api/calls/end/${callSessionId}`,
          { endReason: 'ended_by_psychic' },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
      }
      
      // Update UI
      setCallStatus('ended');
      toast.success('Call ended successfully');
      
      // Navigate after delay
      setTimeout(() => {
        navigate('/psychic/dashboard/call-history');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  // 15. REJECT CALL
  const handleRejectCall = async () => {
    try {
      const token = localStorage.getItem('psychicToken');
      const requestId = callRequestId || activeCall?.callRequestId;
      
      if (!requestId) {
        toast.error('No call request to reject');
        return;
      }
      
      await axios.post(
        `${API_BASE}/api/calls/reject/${requestId}`,
        { reason: 'Not available' },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      toast.success('Call rejected');
      navigate('/psychic/dashboard');
      
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
      toast.error('Failed to reject call');
    }
  };

  // 16. REFRESH CALL DATA
  const refreshCallData = () => {
    console.log('🔄 Refreshing call data...');
    const targetId = callRequestId || activeCall?.callRequestId;
    if (targetId) {
      fetchCallDetails(targetId);
    } else {
      checkPsychicActiveCall();
    }
  };

  // 17. FORMAT FUNCTIONS
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

  // 18. STATUS BADGE HELPERS
  const getStatusBadge = () => {
    const badges = {
      'pending': { text: 'Pending', color: 'bg-yellow-500' },
      'ringing': { text: 'Ringing', color: 'bg-blue-500' },
      'in-progress': { text: 'In Progress', color: 'bg-green-500' },
      'ended': { text: 'Ended', color: 'bg-gray-500' },
      'expired': { text: 'Expired', color: 'bg-red-500' },
      'rejected': { text: 'Rejected', color: 'bg-red-500' },
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

  // 19. EFFECT: Handle countdown timer for pending calls
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

  // 20. EFFECT: Update earnings when elapsedTime changes
  useEffect(() => {
    if (callStatus === 'in-progress' && callDetails) {
      const ratePerMin = callDetails.ratePerMin || 1;
      const currentEarnings = (elapsedTime / 60) * ratePerMin;
      const roundedEarnings = parseFloat(currentEarnings.toFixed(2));
      
      // Only update if earnings actually changed
      if (Math.abs(earnings - roundedEarnings) > 0.01) {
        console.log('💰 Earnings recalculated:', { elapsedTime, earnings: roundedEarnings });
        setEarnings(roundedEarnings);
      }
    }
  }, [elapsedTime, callStatus, callDetails]);

  // 21. EFFECT: Initialize component
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    console.log('🎯 Component mounted with callRequestId:', callRequestId);
    
    // Initial load
    if (callRequestId) {
      fetchCallDetails(callRequestId);
    } else {
      checkPsychicActiveCall();
    }
    
    // Setup polling for updates
    pollRef.current = setInterval(() => {
      if (callStatus === 'pending' || callStatus === 'in-progress') {
        refreshCallData();
      }
    }, 10000);
    
    // Cleanup
    return () => {
      cleanupTwilio();
      stopTimers();
      if (pollRef.current) clearInterval(pollRef.current);
      initializedRef.current = false;
    };
  }, [callRequestId]);

  // 22. EFFECT: Handle call status changes
  useEffect(() => {
    console.log('🔄 Call status changed to:', callStatus);
    
    if (callStatus === 'in-progress') {
      // Auto-connect to Twilio if we have token and room
      if (twilioToken && roomName && !isAudioPlaying) {
        console.log('🚀 Auto-connecting to Twilio...');
        setTimeout(() => {
          joinExistingCall();
        }, 1000);
      }
      
      // Ensure timers are running
      if (!timerRef.current) {
        console.log('⏱️ Starting timers for in-progress call');
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now() - (elapsedTime * 1000);
        }
        startCallTimer();
      }
    } else if (callStatus === 'ended' || callStatus === 'expired' || callStatus === 'rejected') {
      // Stop timers for ended calls
      stopTimers();
    }
  }, [callStatus]);

  // LOADING STATE
  if (isLoading || isCheckingActiveCall) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ backgroundColor: colorScheme.deepPurple }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
            style={{ backgroundColor: colorScheme.antiqueGold + '20' }}>
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: colorScheme.antiqueGold }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {isCheckingActiveCall ? 'Finding Your Call...' : 'Loading Call Details...'}
          </h2>
          <p className="text-white/70 mb-6">
            Please wait while we connect you to the call
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate('/psychic/dashboard')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error || !callDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ backgroundColor: colorScheme.deepPurple }}>
        <Card className="p-8 max-w-md w-full bg-white/5 backdrop-blur-sm border-white/10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {activeCall ? 'Call Connection Issue' : 'No Active Call Found'}
            </h2>
            <p className="text-white/70 mb-6">
              {error || 'You don\'t have any active calls at the moment.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={checkPsychicActiveCall}
                className="w-full"
                style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Calls Again
              </Button>
              <Button
                onClick={() => navigate('/psychic/dashboard')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="min-h-screen relative overflow-hidden" 
      style={{ backgroundColor: colorScheme.deepPurple }}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: colorScheme.antiqueGold }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: colorScheme.antiqueGold }} />
        
        {/* Pulsing ring for ringing state */}
        {(callStatus === 'ringing' || callStatus === 'pending') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: colorScheme.antiqueGold }} />
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/psychic/dashboard')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              
              <Badge className={getStatusBadge().color + " text-white px-3 py-1"}>
                <span className="font-medium">{getStatusBadge().text}</span>
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Strong</span>
              </div>
              <div className="text-sm">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          
          {/* User Card */}
          <Card className="p-6 mb-6 bg-white/5 backdrop-blur-sm border-white/10">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4" 
                style={{ borderColor: colorScheme.antiqueGold }}>
                <AvatarImage 
                  src={userDetails?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.firstName || 'User')}&background=${colorScheme.antiqueGold.replace('#', '')}&color=${colorScheme.deepPurple.replace('#', '')}`} 
                  alt={userDetails?.firstName}
                />
                <AvatarFallback className="text-2xl font-bold" 
                  style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}>
                  {userDetails?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {userDetails?.firstName || 'Client'} {userDetails?.lastName || ''}
                    </h1>
                    <p className="text-white/70 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Client ID: {userDetails?._id?.slice(-8) || 'N/A'}</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      ${(callDetails.ratePerMin || 1).toFixed(2)}
                      <span className="text-sm font-normal text-white/70">/min</span>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Active Rate
                    </Badge>
                  </div>
                </div>
                
                {/* Time/Status Row */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/70" />
                    <span className="text-white">
                      {callStatus === 'in-progress' 
                        ? `Duration: ${formatTime(elapsedTime)}`
                        : callStatus === 'pending'
                        ? `Accept within: ${formatCountdown(timeRemaining)}`
                        : `Status: ${callStatus}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getConnectionBadge().color}`} />
                    <span className="text-white/70">{getConnectionBadge().text}</span>
                  </div>
                  
                  {callStatus === 'in-progress' && (
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-sm text-white/70">{isMuted ? 'Muted' : 'Mic On'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-sm text-white/70">{isAudioPlaying ? 'Audio On' : 'Audio Off'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Call Interface */}
        <div className="container mx-auto px-6">
          {/* Earnings Display (In-progress only) */}
          {callStatus === 'in-progress' && (
            <Card className="p-6 mb-6 bg-white/5 backdrop-blur-sm border-white/10">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">Current Earnings</p>
                  <p className="text-3xl font-bold text-green-400">${earnings.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">Call Duration</p>
                  <p className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">Rate</p>
                  <p className="text-2xl font-bold text-white">${(callDetails.ratePerMin || 1).toFixed(2)}/min</p>
                </div>
              </div>
              <Progress 
                value={(elapsedTime % 60) * 1.6667} 
                className="mt-4 bg-white/20 h-2"
                indicatorClassName="bg-green-500"
              />
              <p className="text-white/70 text-xs mt-2 text-center">
                Minute {Math.floor(elapsedTime / 60) + 1} • {60 - (elapsedTime % 60)}s remaining
              </p>
            </Card>
          )}
          
          {/* Call Timer Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-white mb-4 tracking-tighter">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-white/70 text-lg">
              {callStatus === 'in-progress' 
                ? `Live audio call in progress ${isAudioPlaying ? '• Audio Active' : '• Connecting...'}`
                : callStatus === 'ringing'
                ? 'Connecting to audio call...'
                : callStatus === 'pending'
                ? 'Incoming call request'
                : callStatus === 'expired'
                ? 'Call request has expired'
                : 'Call session has ended'
              }
            </p>
          </div>
          
          {/* Call Controls */}
          <div className="max-w-md mx-auto mb-12">
            {/* Pending State */}
            {callStatus === 'pending' && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={acceptCall}
                  size="lg"
                  className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
                  disabled={timeRemaining !== null && timeRemaining <= 0}
                >
                  <Phone className="h-6 w-6 mr-3" />
                  Accept Call
                </Button>
                
                <Button
                  onClick={handleRejectCall}
                  size="lg"
                  variant="outline"
                  className="h-16 text-lg border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <PhoneOff className="h-6 w-6 mr-3" />
                  Reject
                </Button>
              </div>
            )}
            
            {/* Ringing/Connecting State */}
            {callStatus === 'ringing' && (
              <Button
                onClick={joinExistingCall}
                size="lg"
                className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Connecting Audio...
                  </>
                ) : (
                  <>
                    <Phone className="h-6 w-6 mr-3" />
                    Connect Audio Now
                  </>
                )}
              </Button>
            )}
            
            {/* In-Progress State */}
            {callStatus === 'in-progress' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={handleMuteToggle}
                    size="lg"
                    variant="outline"
                    className={`h-16 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/30 text-white hover:bg-white/10'}`}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  
                  <Button
                    onClick={handleEndCall}
                    size="lg"
                    className="h-16 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    onClick={handleSpeakerToggle}
                    size="lg"
                    variant="outline"
                    className={`h-16 ${!isSpeakerOn ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-white/30 text-white hover:bg-white/10'}`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                  </Button>
                </div>
                
                {!isAudioPlaying && (
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-2">
                      Audio not playing? Click anywhere on the page to enable audio
                    </p>
                    <Button
                      onClick={() => document.click()}
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Enable Audio
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Ended/Expired State */}
            {(callStatus === 'ended' || callStatus === 'expired') && (
              <Button
                onClick={() => navigate('/psychic/dashboard')}
                size="lg"
                className="w-full h-16 text-lg"
                style={{ backgroundColor: colorScheme.antiqueGold, color: colorScheme.deepPurple }}
              >
                <CheckCircle className="h-6 w-6 mr-3" />
                Return to Dashboard
              </Button>
            )}
          </div>
          
          {/* Debug Info (Development only) */}
          {import.meta.env.DEV && (
            <Card className="p-4 mt-8 bg-black/30 backdrop-blur-sm border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold">Debug Information</h4>
                <Button
                  onClick={refreshCallData}
                  size="sm"
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-white/70">Call Status</p>
                  <p className="text-white font-semibold">{callStatus}</p>
                </div>
                <div>
                  <p className="text-white/70">Timer Status</p>
                  <p className="text-white font-semibold">{timerRef.current ? 'Running' : 'Stopped'}</p>
                </div>
                <div>
                  <p className="text-white/70">Elapsed Time</p>
                  <p className="text-white font-semibold">{elapsedTime}s ({formatTime(elapsedTime)})</p>
                </div>
                <div>
                  <p className="text-white/70">Earnings</p>
                  <p className="text-white font-semibold">${earnings.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-white/70">Room Name</p>
                  <p className="text-white font-semibold">{roomName ? '✓ Set' : '✗ Missing'}</p>
                </div>
                <div>
                  <p className="text-white/70">Twilio Token</p>
                  <p className="text-white font-semibold">{twilioToken ? '✓ Present' : '✗ Missing'}</p>
                </div>
                <div>
                  <p className="text-white/70">Audio State</p>
                  <p className="text-white font-semibold">{isAudioPlaying ? 'Playing' : 'Not Playing'}</p>
                </div>
                <div>
                  <p className="text-white/70">Start Time Ref</p>
                  <p className="text-white font-semibold">{startTimeRef.current ? 'Set' : 'Not Set'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychicActiveCallPage;