import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Clock, User, MessageCircle, Volume2, Mic, MicOff, Video, VideoOff, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import io from 'socket.io-client';
import twilioService from '@/services/twilioService'; // ✅ ADD THIS IMPORT

const AudioCallPage = () => {
  const { callSessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State from navigation or fetch
  const [callData, setCallData] = useState(location.state || {});
  const [status, setStatus] = useState(location.state?.status || 'initiated');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [twilioToken, setTwilioToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds for psychic to accept
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [isFreeSession, setIsFreeSession] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const audioPermissionRef = useRef(null);

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Status colors
  const statusColors = {
    initiated: 'bg-yellow-500',
    ringing: 'bg-blue-500',
    active: 'bg-green-500',
    accepted: 'bg-green-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-500',
    completed: 'bg-purple-500',
    failed: 'bg-red-500'
  };

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = callData.user?._id;

    if (!userId) {
      toast.error("User not found");
      navigate('/');
      return;
    }

    // Connect to audio-calls namespace
    const socket = io(`${import.meta.env.VITE_BASE_URL}/audio-calls`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    // Register as user
    socket.emit('user-register', userId);

    // Socket event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to audio call socket');
      joinCallRoom();
    });

    socket.on('call-accepted', (data) => {
      console.log('✅ Call accepted by psychic:', data);

      // Validate token
      if (!data.token || data.token.includes('dummy_token')) {
        console.error('❌ INVALID TOKEN RECEIVED:', data.token);
        toast.error('Invalid audio connection. Please try again.');
        return;
      }

      // Check if token is a proper JWT
      if (!data.token.startsWith('eyJ')) {
        console.error('❌ TOKEN NOT A VALID JWT:', data.token?.substring(0, 50));
        toast.error('Invalid audio connection format.');
        return;
      }

      setStatus('accepted');
      setTwilioToken(data.token);
      setRoomName(data.roomName);
      setCallData(prev => ({
        ...prev,
        callSessionId: data.callSessionId,
        psychic: data.psychic
      }));

      // Connect to Twilio Video
      connectToTwilioCall(data.token, data.psychic?._id);
      toast.success(`Call accepted by ${data.psychic?.name}`);
    });

    socket.on('call-rejected', (data) => {
      console.log('❌ Call rejected:', data);
      setStatus('rejected');
      cleanupTwilio();
      toast.error(`Call rejected: ${data.reason || 'Psychic declined the call'}`);

      // Auto navigate back after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    });

    socket.on('call-cancelled', (data) => {
      console.log('Call cancelled by user:', data);
      setStatus('cancelled');
      cleanupTwilio();
      toast.info('Call cancelled');
    });

    socket.on('call-started', (data) => {
      console.log('🎉 Call started:', data);
      setStatus('active');
      startCallTimer();
      setIsAudioPlaying(true);
    });

    socket.on('timer-started', (data) => {
      console.log('⏱️ Timer started:', data);
      setStatus('active');
      startCallTimer();
    });

    socket.on('credits-updated', (data) => {
      console.log('💰 Credits updated:', data);
      setCreditsUsed(data.creditsUsed || 0);
      setCurrentCredits(data.currentCredits || 0);

      if (data.currentCredits < 1) {
        toast.warning('Low credits! Add more credits to continue call.');
      }
    });

    socket.on('free-minute-ending', (data) => {
      console.log('⚠️ Free minute ending:', data);
      toast.warning('Your free minute is ending. Call will continue using credits.');
    });

    socket.on('call-ended-insufficient-credits', (data) => {
      console.log('❌ Call ended due to insufficient credits:', data);
      setStatus('failed');
      cleanupTwilio();
      toast.error('Call ended due to insufficient credits');

      setTimeout(() => {
        navigate('/wallet');
      }, 3000);
    });

    socket.on('call-expired', (data) => {
      console.log('⏰ Call expired:', data);
      setStatus('failed');
      cleanupTwilio();
      toast.error('Call request expired. Psychic did not respond in time.');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    });

    // Twilio Device events
    socket.on('twilio-device-ready', (data) => {
      console.log('🎯 Twilio Device ready:', data);
    });

    socket.on('twilio-call-connected', (data) => {
      console.log('✅ Twilio call connected:', data);
      setStatus('active');
      startCallTimer();
    });

    socket.on('call-completed', (data) => {
      console.log('📞 Call ended:', data);
      setStatus('completed');
      setCreditsUsed(data.creditsUsed || 0);
      stopCallTimer();

      // Clean up Twilio
      cleanupTwilio();

      toast.info(`Call ended. Credits used: ${data.creditsUsed || 0}`);

      // Show summary for 5 seconds then navigate
      setTimeout(() => {
        navigate('/');
      }, 5000);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanupTwilio();
      stopTimers();
      removeAudioPermissionHandler();
    };
  }, [callSessionId, navigate]);

  // Join call room
  const joinCallRoom = () => {
    if (socketRef.current && callData.roomName) {
      socketRef.current.emit('join-room', callData.roomName);
      setRoomName(callData.roomName);
    }
  };

  // Connect to Twilio call
  const connectToTwilioCall = async (token, psychicId) => {
    if (!token || !psychicId) {
      toast.error('Missing connection details');
      return;
    }
    setIsConnecting(true);

    try {
      console.log('🎯 User connecting to audio room...');

      // Get room name from somewhere (should be in callData)
      const roomName = callData.roomName || roomName; // You need to have roomName

      if (!roomName) {
        throw new Error('Room name not found');
      }

      // 1. Initialize Twilio Video SDK
      await twilioService.initialize();

      // 2. JOIN THE ROOM (not "makeCall")
      await twilioService.joinRoom(token, roomName);

      // 3. Set up audio playback permission handler
      setupAudioPermissionHandler();

      // 4. Notify socket that call has started
      if (socketRef.current) {
        socketRef.current.emit('call-started', {
          callSessionId: callSessionId || callData.callSessionId,
          roomName: roomName
        });
      }

      setIsConnecting(false);
      setStatus('active');
      startCallTimer();

    } catch (error) {
      console.error('❌ Error connecting to Twilio:', error);
      toast.error('Failed to connect to audio call');
      setIsConnecting(false);
      setStatus('failed');
    }
  };

  // Set up audio playback permission handler
  const setupAudioPermissionHandler = () => {
    // Remove existing handler
    removeAudioPermissionHandler();

    // Create new handler for browsers blocking auto-play
    audioPermissionRef.current = () => {
      const status = twilioService.getStatus();
      console.log('🎧 Audio permission click handler triggered');

      if (status.audio === 'ready') {
        const audioEl = document.getElementById('twilio-remote-audio');
        if (audioEl) {
          audioEl.play().then(() => {
            console.log('✅ Audio playback started via user interaction');
            setIsAudioPlaying(true);
            removeAudioPermissionHandler();
          }).catch(e => {
            console.log('⚠️ Audio play failed:', e);
          });
        }
      }
    };

    // Add click handler
    document.addEventListener('click', audioPermissionRef.current);
    console.log('🎧 Added audio permission click handler');
  };

  // Remove audio permission handler
  const removeAudioPermissionHandler = () => {
    if (audioPermissionRef.current) {
      document.removeEventListener('click', audioPermissionRef.current);
      audioPermissionRef.current = null;
    }
  };

  // Clean up Twilio resources
  const cleanupTwilio = () => {
    twilioService.endCall();
    twilioService.cleanup();
    removeAudioPermissionHandler();
    setIsAudioPlaying(false);
  };

  // Start call timer
  const startCallTimer = () => {
    stopTimers();

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  // Start countdown for psychic response
  const startCountdown = () => {
    if (expiresAt) {
      const endTime = new Date(expiresAt).getTime();
      countdownRef.current = setInterval(() => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(countdownRef.current);
          setStatus('failed');
          cleanupTwilio();
          toast.error('Psychic did not respond in time');

          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      }, 1000);
    }
  };

  // Stop all timers
  const stopTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Cancel call
  const cancelCall = async () => {
    if (!callData.callRequestId) {
      toast.error('Call request ID not found');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/calls/cancel/${callData.callRequestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      // Clean up Twilio
      cleanupTwilio();

      // Also emit socket event
      if (socketRef.current) {
        socketRef.current.emit('cancel-call', {
          callRequestId: callData.callRequestId
        });
      }

      setStatus('cancelled');
      toast.info('Call cancelled');

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error cancelling call:', error);
      toast.error('Failed to cancel call');
    }
  };

  // End call
  const endCall = async () => {
    if (!callSessionId && !callData.callSessionId) {
      toast.error('Call session ID not found');
      return;
    }

    // 1. End Twilio call first
    cleanupTwilio();

    // 2. Emit socket event
    if (socketRef.current) {
      const sessionId = callSessionId || callData.callSessionId;
      socketRef.current.emit('call-ended', {
        callSessionId: sessionId,
        endReason: 'ended_by_user'
      });
    }

    setStatus('completed');
    stopTimers();

    toast.success('Call ended successfully');

    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    toast.info(newMutedState ? 'Muted' : 'Unmuted');

    // Call Twilio mute functionality
    if (twilioService.toggleMute) {
      twilioService.toggleMute(newMutedState);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format credits
  const formatCredits = (credits) => {
    return credits.toFixed(2);
  };

  // Initialize countdown on mount
  useEffect(() => {
    if (callData.expiresAt) {
      setExpiresAt(callData.expiresAt);
      startCountdown();
    }

    if (callData.isFreeSession) {
      setIsFreeSession(true);
    }

    // Check if we already have a token (from navigation state)
    if (callData.token) {
      setTwilioToken(callData.token);
    }

    return () => {
      stopTimers();
      cleanupTwilio();
    };
  }, [callData]);

  // Get status message
  const getStatusMessage = () => {
    switch (status) {
      case 'initiated':
        return 'Call initiated. Waiting for psychic...';
      case 'ringing':
        return 'Ringing psychic...';
      case 'accepted':
        return 'Psychic accepted! Connecting...';
      case 'active':
        return 'Call in progress';
      case 'rejected':
        return 'Call rejected by psychic';
      case 'cancelled':
        return 'Call cancelled';
      case 'completed':
        return 'Call completed';
      case 'failed':
        return 'Call failed';
      default:
        return 'Connecting...';
    }
  };

  // Get Twilio connection status
  const getTwilioStatus = () => {
    const status = twilioService.getStatus();
    if (status.initialized && status.connected) {
      return { text: 'Connected to Twilio', color: 'bg-green-500' };
    } else if (status.initialized) {
      return { text: 'Twilio ready', color: 'bg-yellow-500' };
    } else {
      return { text: 'Twilio not ready', color: 'bg-red-500' };
    }
  };

  // Get audio status
  const getAudioStatus = () => {
    if (isAudioPlaying) {
      return { text: 'Audio playing', color: 'bg-green-500' };
    } else if (status === 'active') {
      return { text: 'Audio connecting...', color: 'bg-yellow-500' };
    } else {
      return { text: 'Audio off', color: 'bg-gray-500' };
    }
  };

  // Get action button based on status
  const renderActionButton = () => {
    switch (status) {
      case 'initiated':
      case 'ringing':
        return (
          <Button
            onClick={cancelCall}
            className="rounded-full px-8 py-6 text-lg font-semibold"
            style={{
              backgroundColor: '#ef4444',
              color: 'white'
            }}
            disabled={isConnecting}
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            Cancel Call
          </Button>
        );

      case 'accepted':
      case 'active':
        return (
          <Button
            onClick={endCall}
            className="rounded-full px-8 py-6 text-lg font-semibold"
            style={{
              backgroundColor: '#ef4444',
              color: 'white'
            }}
            disabled={isConnecting}
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            End Call
          </Button>
        );

      case 'rejected':
      case 'cancelled':
      case 'completed':
      case 'failed':
        return (
          <Button
            onClick={() => navigate('/')}
            className="rounded-full px-8 py-6 text-lg font-semibold"
            style={{
              backgroundColor: colors.deepPurple,
              color: colors.softIvory
            }}
          >
            <X className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        );

      default:
        return null;
    }
  };

  // Render audio permission notice
  const renderAudioPermissionNotice = () => {
    if (status === 'active' && !isAudioPlaying) {
      return (
        <div className="mt-4 p-4 rounded-lg animate-pulse"
          style={{ backgroundColor: colors.antiqueGold + '20', border: `1px solid ${colors.antiqueGold}` }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" style={{ color: colors.antiqueGold }} />
            <div>
              <p className="font-semibold text-white">Click anywhere to enable audio</p>
              <p className="text-sm text-gray-200 mt-1">
                Some browsers require user interaction to play audio. Click anywhere on the page to start hearing.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.deepPurple }}>
      {/* Audio permission overlay */}
      {renderAudioPermissionNotice()}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Audio Call</h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className={statusColors[status] + ' text-white'}>
                  {status.toUpperCase()}
                </Badge>
                {status === 'active' && (
                  <Badge className="bg-green-500 text-white animate-pulse">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(timer)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="w-12"></div> {/* Spacer for alignment */}
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Psychic Info */}
            <Card className="p-6" style={{
              backgroundColor: colors.darkPurple,
              borderColor: colors.antiqueGold + '40'
            }}>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={callData.psychic?.image}
                    alt={callData.psychic?.name}
                    className="w-full h-full rounded-full object-cover border-4"
                    style={{ borderColor: colors.antiqueGold }}
                  />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.antiqueGold }}>
                    <User className="h-6 w-6" style={{ color: colors.deepPurple }} />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  {callData.psychic?.name || 'Psychic'}
                </h2>
                <p className="text-gray-300 mb-1">{callData.psychic?.specialization || 'Psychic Reader'}</p>

                <div className="flex items-center justify-center gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-4"
                      style={{
                        color: i < (callData.psychic?.averageRating || 4.5) ? colors.antiqueGold : '#4B5563',
                      }}
                    >
                      ★
                    </div>
                  ))}
                  <span className="text-gray-300 ml-2">
                    {(callData.psychic?.averageRating || 4.5).toFixed(1)}
                  </span>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Rate per minute:</span>
                    <span className="text-white font-bold">
                      ${(callData.psychic?.ratePerMin || 1.00).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Credits used:</span>
                    <span className="text-white font-bold">
                      {formatCredits(creditsUsed)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Current credits:</span>
                    <span className="text-white font-bold">
                      {formatCredits(currentCredits)}
                    </span>
                  </div>

                  {isFreeSession && (
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: colors.antiqueGold + '20' }}>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                        <span className="text-gray-200">Your first minute is free!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Center Column: Call Interface */}
            <div className="md:col-span-2 space-y-8">
              {/* Status Card */}
              <Card className="p-6" style={{
                backgroundColor: colors.darkPurple,
                borderColor: colors.antiqueGold + '40'
              }}>
                <div className="text-center space-y-4">
                  {/* Status Icon */}
                  <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full ${statusColors[status]} opacity-20 animate-pulse`}></div>
                    <div className="relative z-10">
                      {status === 'active' ? (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.antiqueGold }}>
                          <Volume2 className="h-8 w-8" style={{ color: colors.deepPurple }} />
                        </div>
                      ) : status === 'accepted' || status === 'ringing' ? (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center animate-spin"
                          style={{
                            borderTop: `4px solid ${colors.antiqueGold}`,
                            borderRight: `4px solid transparent`
                          }}>
                          <Phone className="h-8 w-8" style={{ color: colors.antiqueGold }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: colors.antiqueGold + '20',
                            border: `2px solid ${colors.antiqueGold}`
                          }}>
                          <Phone className="h-8 w-8" style={{ color: colors.antiqueGold }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Message */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {getStatusMessage()}
                    </h3>

                    {/* Timer Display */}
                    {status === 'active' && (
                      <div className="text-4xl font-bold text-white my-4">
                        {formatTime(timer)}
                      </div>
                    )}

                    {/* Countdown Display */}
                    {(status === 'initiated' || status === 'ringing') && timeLeft > 0 && (
                      <div className="my-4">
                        <div className="text-sm text-gray-300 mb-2">
                          Psychic has {timeLeft} seconds to respond
                        </div>
                        <Progress
                          value={(30 - timeLeft) * (100/30)}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Credits Display */}
                    {status === 'active' && (
                      <div className="text-sm text-gray-300">
                        Credits being used: ${formatCredits(creditsUsed)}
                        {isFreeSession && timer < 60 && (
                          <span className="ml-2 text-green-400">(First minute free)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {renderActionButton()}
                  </div>
                </div>
              </Card>

              {/* Control Buttons (only during active call) */}
              {status === 'active' && (
                <Card className="p-6" style={{
                  backgroundColor: colors.darkPurple,
                  borderColor: colors.antiqueGold + '40'
                }}>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Mute/Unmute */}
                    <Button
                      onClick={toggleMute}
                      className="rounded-full p-4"
                      variant={isMuted ? "destructive" : "outline"}
                      style={{
                        borderColor: isMuted ? '#ef4444' : colors.antiqueGold,
                        color: isMuted ? 'white' : colors.antiqueGold
                      }}
                    >
                      {isMuted ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>

                    {/* Video Toggle (disabled for audio-only) */}
                    <Button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className="rounded-full p-4"
                      variant={isVideoOn ? "default" : "outline"}
                      disabled
                      style={{
                        borderColor: colors.antiqueGold,
                        color: colors.antiqueGold,
                        opacity: 0.5
                      }}
                    >
                      {isVideoOn ? (
                        <Video className="h-6 w-6" />
                      ) : (
                        <VideoOff className="h-6 w-6" />
                      )}
                    </Button>

                    {/* Switch to Chat */}
                    <Button
                      onClick={() => navigate(`/message/${callData.psychic?._id}`)}
                      className="rounded-full p-4"
                      variant="outline"
                      style={{
                        borderColor: colors.antiqueGold,
                        color: colors.antiqueGold
                      }}
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-2 text-center text-xs text-gray-400">
                    <div>{isMuted ? 'Unmute' : 'Mute'}</div>
                    <div>Video {isVideoOn ? 'Off' : 'On'}</div>
                    <div>Switch to Chat</div>
                  </div>
                </Card>
              )}

              {/* Connection Info */}
              <Card className="p-6" style={{
                backgroundColor: colors.darkPurple,
                borderColor: colors.antiqueGold + '40'
              }}>
                <div className="space-y-4">
                  <h4 className="font-semibold text-white mb-4">Connection Information</h4>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Call ID:</div>
                      <div className="text-white font-mono truncate">
                        {callSessionId || callData.callSessionId}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400">Room:</div>
                      <div className="text-white font-mono truncate">
                        {roomName || callData.roomName || callData.callIdentifier}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400">Socket:</div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${socketRef.current?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-white">
                          {socketRef.current?.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400">Twilio:</div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getTwilioStatus().color}`}></div>
                        <span className="text-white">
                          {getTwilioStatus().text}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400">Audio:</div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getAudioStatus().color}`}></div>
                        <span className="text-white">
                          {getAudioStatus().text}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400">Token:</div>
                      <div className="text-white font-mono truncate">
                        {twilioToken ? '✓ Present' : '✗ Missing'}
                      </div>
                    </div>
                  </div>

                  {/* Help Text */}
                  {(status === 'initiated' || status === 'ringing') && (
                    <div className="mt-4 p-3 rounded text-sm"
                      style={{ backgroundColor: colors.antiqueGold + '10' }}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: colors.antiqueGold }} />
                        <div>
                          <p className="text-gray-200">
                            Your call request has been sent to the psychic. They have 30 seconds to respond.
                            You'll be connected automatically when they accept.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'active' && !isAudioPlaying && (
                    <div className="mt-4 p-3 rounded text-sm animate-pulse"
                      style={{ backgroundColor: colors.antiqueGold + '20', border: `1px solid ${colors.antiqueGold}` }}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: colors.antiqueGold }} />
                        <div>
                          <p className="text-gray-200 font-semibold">
                            🔊 Click anywhere on the page to enable audio
                          </p>
                          <p className="text-gray-200 mt-1 text-xs">
                            Some browsers require user interaction before playing audio. Click anywhere to start hearing.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'active' && (
                    <div className="mt-4 p-3 rounded text-sm"
                      style={{ backgroundColor: colors.antiqueGold + '10' }}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: colors.antiqueGold }} />
                        <div>
                          <p className="text-gray-200">
                            Call is in progress. Credits are deducted per minute.
                            {isFreeSession && ' Your first minute is free!'}
                          </p>
                          <p className="text-gray-200 mt-1">
                            Ensure you're in a quiet place for best audio quality.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioCallPage;