import { MessageCircle, User, Phone, Star, Shield, Sparkles, Users, Clock, Heart, Globe, Award, Zap, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./screen/AuthContext";
import { motion } from "framer-motion";
import io from 'socket.io-client';

const Home = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [humanPsychics, setHumanPsychics] = useState([]);
  const [showing, setShowing] = useState(4);
  const [isLoadingHumanPsychics, setIsLoadingHumanPsychics] = useState(false);
  const [humanPsychicsError, setHumanPsychicsError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [psychicStatuses, setPsychicStatuses] = useState({});
  const [ratingSummaries, setRatingSummaries] = useState({});
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const subscribedPsychicsRef = useRef(new Set());

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Fetch human psychics data with ratings
  useEffect(() => {
    const fetchHumanPsychicsWithFastStatus = async () => {
      setIsLoadingHumanPsychics(true);
      setHumanPsychicsError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/human-psychics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        
        const data = response.data;
        if (data.success && Array.isArray(data.psychics)) {
          const formattedPsychics = data.psychics.map(p => ({
            ...p,
            isHuman: true,
            type: p.type || "Human Psychic"
          }));

          // Fetch rating summaries for each human psychic
          const ratingSummaryPromises = formattedPsychics.map(async (psychic) => {
            const summary = await fetchPsychicRatingSummary(psychic._id);
            return { psychicId: psychic._id, summary };
          });

          const summaries = await Promise.all(ratingSummaryPromises);
          const summaryMap = {};
          summaries.forEach(item => {
            if (item.summary) {
              summaryMap[item.psychicId] = item.summary;
            }
          });
          setRatingSummaries(prev => ({ ...prev, ...summaryMap }));

          setHumanPsychics(formattedPsychics);
          
          // Fetch initial statuses for human psychics
          const psychicIds = data.psychics.map(p => p._id);
          if (psychicIds.length > 0) {
            try {
              const statusResponse = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/human-psychics/statuses-fast`,
                { psychicIds },
                { 
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  timeout: 2000
                }
              );
              
              if (statusResponse.data.success) {
                const newStatuses = {};
                Object.keys(statusResponse.data.statuses).forEach(id => {
                  newStatuses[id] = {
                    status: statusResponse.data.statuses[id].status,
                    lastSeen: statusResponse.data.statuses[id].lastSeen,
                    lastActive: statusResponse.data.statuses[id].lastActive,
                    timestamp: Date.now()
                  };
                });
                
                setPsychicStatuses(prev => ({
                  ...prev,
                  ...newStatuses
                }));
              }
            } catch (statusError) {
              console.warn("Human psychics fast status failed:", statusError);
            }
          }
          
        } else {
          throw new Error(data.message || "Failed to fetch human psychics");
        }
      } catch (error) {
        console.error("Error fetching human psychics:", error);
        setHumanPsychicsError(error.response?.data?.message || "Failed to load human psychic profiles. Please try again.");
        toast.error(error.response?.data?.message || "Failed to load human psychic profiles.");
      } finally {
        setIsLoadingHumanPsychics(false);
      }
    };
    
    fetchHumanPsychicsWithFastStatus();
  }, []);
// Add this function to your Home component, after the handlePsychicSelect function
const initiateAudioCall = async (psychic) => {
  if (!user) {
    toast.error("Please log in to start a call");
    navigate("/login");
    return;
  }

  const psychicStatus = getPsychicStatus(psychic._id);
  const isAvailable = psychicStatus === 'online' || psychicStatus === 'away';

  if (!isAvailable) {
    toast.error(`This psychic is currently ${psychicStatus.toLowerCase()}. Please try again later.`);
    return;
  }

  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem("accessToken");
    
    // Initiate call via API
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/calls/initiate/${psychic._id}`,
      {},
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true
      }
    );
    
    if (response.data.success) {
      const { callRequestId, callSessionId, roomName, expiresAt, isFreeSession } = response.data.data;
      
      // Navigate to audio call page with all necessary data
      navigate(`/audio-call/${callSessionId}`, {
        state: {
          callSessionId,
          callRequestId,
          roomName,
          psychic,
          isFreeSession,
          expiresAt,
          user,
          fromHome: true,
          status: 'initiated' // initial status
        }
      });
      
      toast.success("Call initiated! Waiting for psychic to accept...");
    } else {
      toast.error(response.data.message || "Failed to initiate call");
    }
  } catch (error) {
    console.error("Error initiating audio call:", error);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already have an active call')) {
      toast.error("You already have an active call. Please end it first.");
    } else if (error.response?.status === 400 && error.response?.data?.message?.includes('not available')) {
      toast.error("Psychic is not available for calls at the moment.");
    } else if (error.response?.status === 404) {
      toast.error("Psychic not found.");
    } else if (error.response?.status === 403) {
      toast.error("Insufficient credits to start a call.");
    } else {
      toast.error(error.response?.data?.message || "Failed to start audio call");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Fetch psychic rating summary
  const fetchPsychicRatingSummary = async (psychicId) => {
    try {
      console.log('Fetching rating summary for psychic:', psychicId);
      
      let endpoints = [
        `${import.meta.env.VITE_BASE_URL}/api/psychic/${psychicId}/summary`,
        `${import.meta.env.VITE_BASE_URL}/api/ratings/psychic/${psychicId}/summary`,
        `${import.meta.env.VITE_BASE_URL}/api/human-psychics/${psychicId}/summary`
      ];
      
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await axios.get(endpoint, {
            timeout: 3000
          });
          
          if (response.data && response.data.success) {
            console.log('Success from endpoint:', endpoint, response.data.data);
            return response.data.data;
          }
        } catch (err) {
          console.log('Endpoint failed:', endpoint, err.message);
        }
      }
      
      console.error('All endpoints failed for psychic:', psychicId);
      return null;
      
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      return null;
    }
  };

  // Socket.io connection for real-time status updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = user?._id || '';
    
    if (!userId) return;
    
    if (socketRef.current?.connected) {
      console.log('ℹ️ Socket already connected');
      return;
    }

    console.log('🔄 Creating new socket connection...');
    
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
      auth: {
        token,
        userId,
        role: 'user'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      setSocketConnected(true);
      
      // Join global psychic list room
      newSocket.emit('join_room', 'psychic_list_status');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      setSocketConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    // Consolidated psychic status handler
    const handlePsychicStatusUpdate = (data) => {
      console.log('🔄 Psychic status update:', {
        psychicId: data.psychicId,
        status: data.status,
        timestamp: new Date(data.timestamp).toLocaleTimeString()
      });
      
      setPsychicStatuses(prev => ({
        ...prev,
        [data.psychicId]: {
          status: data.status,
          lastSeen: data.lastSeen,
          lastActive: data.lastActive,
          lastUpdate: Date.now(),
          isOnline: data.status === 'online'
        }
      }));
    };

    // Listen for all status update events
    newSocket.on('psychic_status_changed', handlePsychicStatusUpdate);
    newSocket.on('psychic_status_update', handlePsychicStatusUpdate);
    newSocket.on('psychic_online', handlePsychicStatusUpdate);

    // Initial statuses response
    newSocket.on('psychic_statuses_response', (data) => {
      console.log('📋 Initial psychic statuses received');
      if (data.statuses && !data.error) {
        const newStatuses = {};
        Object.keys(data.statuses).forEach(psychicId => {
          newStatuses[psychicId] = {
            status: data.statuses[psychicId].status || 'offline',
            lastSeen: data.statuses[psychicId].lastSeen,
            lastActive: data.statuses[psychicId].lastActive,
            lastUpdate: Date.now(),
            isOnline: data.statuses[psychicId].status === 'online'
          };
        });
        setPsychicStatuses(prev => ({ ...prev, ...newStatuses }));
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      subscribedPsychicsRef.current.clear();
    };
  }, [user?._id]);

  // Smart subscription to psychic statuses
  useEffect(() => {
    if (!socketConnected || !socketRef.current) return;

    const allPsychicIds = humanPsychics.map(p => p._id).filter(id => id && !subscribedPsychicsRef.current.has(id));

    if (allPsychicIds.length === 0) return;

    console.log('📊 Subscribing to psychic statuses:', allPsychicIds);

    // Subscribe to status updates
    socketRef.current.emit('subscribe_to_psychic_status', { 
      psychicIds: allPsychicIds 
    });

    // Request initial statuses
    socketRef.current.emit('get_psychic_statuses', { 
      psychicIds: allPsychicIds 
    });

    // Add to subscribed set
    allPsychicIds.forEach(id => subscribedPsychicsRef.current.add(id));

    // Set up periodic status refresh (every 60 seconds)
    const refreshInterval = setInterval(() => {
      if (socketConnected && allPsychicIds.length > 0) {
        socketRef.current.emit('get_psychic_statuses', { 
          psychicIds: allPsychicIds 
        });
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [socketConnected, humanPsychics]);

  // ========== HELPER FUNCTIONS ==========
  const getPsychicStatus = (psychicId) => {
    const statusData = psychicStatuses[psychicId];
    if (!statusData) return 'offline';
    
    // If status is online but last update was more than 2 minutes ago, mark as away
    if (statusData.status === 'online' && statusData.lastUpdate) {
      const minutesSinceUpdate = (Date.now() - statusData.lastUpdate) / (1000 * 60);
      if (minutesSinceUpdate > 2) {
        return 'away';
      }
    }
    
    return statusData.status || 'offline';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500 text-white';
      case 'away':
        return 'bg-yellow-500 text-white';
      case 'busy':
        return 'bg-orange-500 text-white';
      case 'offline':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>;
      case 'away':
        return <div className="h-2 w-2 rounded-full bg-yellow-500"></div>;
      case 'busy':
        return <div className="h-2 w-2 rounded-full bg-orange-500"></div>;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-400"></div>;
    }
  };

  const isPsychicAvailable = (psychicId) => {
    const status = getPsychicStatus(psychicId);
    return status === 'online' || status === 'away';
  };

  const handleShowMore = () => setShowing((prev) => Math.min(prev + 4, humanPsychics.length));

  // Handle psychic select function
  const handlePsychicSelect = async (psychic) => {
    if (!user) {
      toast.error("Please log in to connect with a psychic");
      navigate("/login");
      return;
    }

    const psychicStatus = getPsychicStatus(psychic._id);
    const isAvailable = isPsychicAvailable(psychic._id);

    // Check if psychic is available (not offline or busy)
    if (psychicStatus === 'offline' || psychicStatus === 'busy') {
      toast.error(`This psychic is currently ${psychicStatus.toLowerCase()}. Please try again later.`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Check for existing session
      try {
        const check = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/humanchat/sessions/check/${psychic._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (check.data.exists) {
          navigate(`/message/${psychic._id}`, {
            state: {
              chatSession: check.data.session,
              psychic: psychic,
              fromHome: true,
              timestamp: Date.now()
            }
          });
          return;
        }
      } catch (checkError) {
        console.log("No existing session found, creating new one");
      }
      
      // Create new session
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/humanchat/sessions`,
        { psychicId: psychic._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        navigate(`/message/${psychic._id}`, {
          state: {
            chatSession: response.data.chatSession,
            psychic: psychic,
            fromHome: true,
            timestamp: Date.now()
          }
        });
      } else {
        toast.error(response.data.message || "Failed to start chat.");
        navigate(`/message/${psychic._id}`, {
          state: {
            psychic: psychic,
            fromHome: true
          }
        });
      }
    } catch (error) {
      console.error("Human chat session error:", error);
      toast.info("Connecting to chat...");
      navigate(`/message/${psychic._id}`, {
        state: {
          psychic: psychic,
          fromHome: true
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
      {/* Enhanced Hero Section */}
      <div 
        className="relative py-24 px-4 overflow-hidden"
        style={{ 
          backgroundColor: colors.deepPurple,
          background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-5"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                background: `radial-gradient(circle, ${colors.antiqueGold} 0%, transparent 70%)`,
                top: `${20 + i * 30}%`,
                left: `${10 + i * 20}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" 
                style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Trusted by Thousands Worldwide</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block" style={{ color: colors.softIvory }}>Discover Your</span>
                <span style={{ 
                  background: `linear-gradient(135deg, ${colors.antiqueGold}, #FFD700)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>Spiritual Path</span>
              </h1>
              
              <p className="text-xl mb-8 opacity-90 leading-relaxed" style={{ color: colors.softIvory }}>
                Connect with gifted, certified psychics for personalized guidance, clarity, and spiritual growth. 
                Experience authentic connections that illuminate your life's journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: colors.antiqueGold,
                    color: colors.deepPurple,
                    boxShadow: `0 10px 40px ${colors.antiqueGold}40`
                  }}
                  onClick={() => {
                    if (user) {
                      if (humanPsychics.length > 0) {
                        handlePsychicSelect(humanPsychics[0]);
                      } else {
                        toast.info("No psychics available at the moment");
                      }
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  Start Chatting Now
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold border-2 transition-all hover:scale-105"
                  style={{ 
                    borderColor: colors.antiqueGold,
                    color: colors.softIvory,
                    backgroundColor: "transparent"
                  }}
                  onClick={() => navigate("/register")}
                >
                  <Heart className="mr-3 h-5 w-5" />
                  Begin Free Trial
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4" style={{ color: colors.antiqueGold, fill: colors.antiqueGold }} />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: colors.softIvory + "CC" }}>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                  <span className="text-sm" style={{ color: colors.softIvory + "CC" }}>10,000+ Satisfied Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                  <span className="text-sm" style={{ color: colors.softIvory + "CC" }}>Global Community</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Image/Featured Psychic */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" 
                style={{ 
                  backgroundColor: colors.darkPurple,
                  border: `2px solid ${colors.antiqueGold}`
                }}>
                <div className="absolute inset-0 opacity-10" 
                  style={{ background: `linear-gradient(45deg, ${colors.antiqueGold}, transparent)` }}></div>
                
                {humanPsychics[0] && (
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: colors.antiqueGold }}>
                          <img 
                            src={humanPsychics[0].image} 
                            alt={humanPsychics[0].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.antiqueGold }}>
                          <Award className="h-5 w-5" style={{ color: colors.deepPurple }} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.softIvory }}>{humanPsychics[0].name}</h3>
                        <p className="text-sm" style={{ color: colors.antiqueGold }}>Top-Rated Psychic</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3" style={{ color: colors.antiqueGold, fill: colors.antiqueGold }} />
                          <span className="text-xs ml-1" style={{ color: colors.softIvory + "CC" }}>
                            {humanPsychics[0].rating?.avgRating?.toFixed(1) || "5.0"} · {humanPsychics[0].rating?.totalReviews || "100+"} readings
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-6" style={{ color: colors.softIvory + "CC" }}>
                      "I've helped over 500 clients find clarity and direction in their lives. Let me guide you on your spiritual journey."
                    </p>
                    <Button 
                      className="w-full rounded-full py-4"
                      style={{ 
                        backgroundColor: colors.antiqueGold,
                        color: colors.deepPurple
                      }}
                      onClick={() => handlePsychicSelect(humanPsychics[0])}
                      disabled={!user || isSubmitting}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Start Chat with {humanPsychics[0].name.split(" ")[0]}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ border: `2px solid ${colors.antiqueGold}` }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" style={{ color: colors.antiqueGold }} />
                  <div>
                    <div className="font-bold text-sm" style={{ color: colors.deepPurple }}>Live Availability</div>
                    <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Connect instantly</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust & Security Section */}
      <div className="py-12 px-4" style={{ backgroundColor: colors.lightGold }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield />, title: "100% Secure", desc: "End-to-end encryption" },
              { icon: <Lock />, title: "Private", desc: "Confidential sessions" },
              { icon: <CheckCircle />, title: "Verified", desc: "Certified psychics" },
              { icon: <Clock />, title: "24/7 Support", desc: "Always available" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" 
                  style={{ backgroundColor: colors.deepPurple + "20", color: colors.deepPurple }}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-1" style={{ color: colors.deepPurple }}>{item.title}</h4>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Psychics Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
            style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
            <Award className="h-4 w-4" />
            <span className="text-sm font-medium">Our Human Psychics</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Meet Our Top-Rated Psychics
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
            Carefully selected for their exceptional accuracy, empathy, and client satisfaction
          </p>
        </div>

        <Tabs defaultValue="active">
  <TabsContent value="active">
    {isLoadingHumanPsychics ? (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.antiqueGold }}></div>
      </div>
    ) : humanPsychicsError ? (
      <div className="text-center p-8">
        <p className="text-red-600" style={{ color: colors.deepPurple }}>{humanPsychicsError}</p>
      </div>
    ) : humanPsychics.length === 0 ? (
      <p className="text-center p-8" style={{ color: colors.deepPurple + "CC" }}>No human psychics available at the moment.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {humanPsychics.slice(0, showing).map((psychic, i) => {
          const psychicStatus = getPsychicStatus(psychic._id);
          const gender = psychic.gender ? psychic.gender.charAt(0).toUpperCase() + psychic.gender.slice(1) : "Not specified";
          const experience = psychic.experience || "0";
          const specialization = psychic.specialization || "Psychic Reader";
          const responseTime = psychic.responseTime ? `${psychic.responseTime} min` : "Instant";
          const memberSince = psychic.createdAt ? new Date(psychic.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          }) : "Recently";
          
          return (
            <motion.div
              key={psychic._id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.antiqueGold}, ${colors.deepPurple})`,
                  transform: "translateY(10px) scale(1.02)"
                }}></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                
                {/* Status & Verification Badge */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                  {/* Status Badge */}
                  <Badge className="px-3 py-1 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: getStatusBadgeColor(psychicStatus).split(' ')[0], color: 'white' }}>
                    {getStatusIcon(psychicStatus)}
                    <span className="text-xs font-medium">{getStatusText(psychicStatus)}</span>
                  </Badge>
                  
                  {/* Human Badge */}
                  <Badge className="px-2 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: colors.deepPurple + "10", 
                      color: colors.deepPurple,
                      border: `1px solid ${colors.deepPurple}30`
                    }}>
                    <User className="h-3 w-3 mr-1" />
                    Human Psychic
                  </Badge>
                </div>
                
                {/* Psychic Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={psychic.image}
                    alt={psychic.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white">{psychic.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-white/90">{specialization}</p>
                      {gender && (
                        <Badge className="text-xs bg-white/20 text-white">
                          {gender}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-6">
                  {/* Rating and Rate per minute */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="h-4 w-4" style={{ 
                          color: i < Math.round(psychic.averageRating || psychic.rating?.avgRating || 4.5) ? colors.antiqueGold : "#E5E7EB",
                          fill: i < Math.round(psychic.averageRating || psychic.rating?.avgRating || 4.5) ? colors.antiqueGold : "transparent"
                        }} />
                      ))}
                      <span className="ml-2 text-sm" style={{ color: colors.deepPurple + "CC" }}>
                        {(psychic.averageRating || psychic.rating?.avgRating || 4.5).toFixed(1)}
                        <span className="text-xs ml-1">({psychic.totalRatings || psychic.rating?.totalReviews || "0+"})</span>
                      </span>
                    </div>
                    
                    {/* Rate per minute */}
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                        ${(psychic.ratePerMin || 1.00).toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>per minute</div>
                    </div>
                  </div>
                  
                  {/* About Section */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: colors.deepPurple + "CC" }}>About</h4>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                      {psychic.bio || `${psychic.name} is an experienced psychic specializing in ${specialization.toLowerCase()}.`}
                    </p>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                      <Clock className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                      <div>
                        <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Response Time</div>
                        <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>{responseTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                      <Users className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                      <div>
                        <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Experience</div>
                        <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>
                          {experience === "0" ? "New" : `${experience}${experience === "0" ? "" : "+ years"}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Abilities/Languages */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {psychic.abilities && psychic.abilities.length > 0 ? (
                      psychic.abilities.slice(0, 3).map((ability, idx) => (
                        <Badge
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: colors.lightGold,
                            color: colors.deepPurple
                          }}
                        >
                          {ability}
                        </Badge>
                      ))
                    ) : psychic.languages && psychic.languages.length > 0 ? (
                      psychic.languages.slice(0, 2).map((language, idx) => (
                        <Badge
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: colors.lightGold,
                            color: colors.deepPurple
                          }}
                        >
                          {language}
                        </Badge>
                      ))
                    ) : (
                      <Badge
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: colors.lightGold,
                          color: colors.deepPurple
                        }}
                      >
                        Spiritual Guidance
                      </Badge>
                    )}
                  </div>
                  
                  {/* Action Buttons Row */}
                {/* Action Buttons Row */}
{/* Action Buttons Row */}
<div className="space-y-3">
  {/* Chat & Call Buttons Row */}
  <div className="grid grid-cols-2 gap-3">
    {/* Chat Button */}
    <Button
      onClick={() => {
        if (!user) {
          toast.error("Please log in to chat with a psychic");
          navigate("/login");
          return;
        }
        handlePsychicSelect(psychic);
      }}
      disabled={isSubmitting || psychicStatus === 'offline' || psychicStatus === 'busy'}
      className="w-full rounded-full py-3 font-medium transition-all hover:opacity-90"
      style={{ 
        backgroundColor: colors.deepPurple,
        color: colors.softIvory
      }}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {psychicStatus === 'offline' || psychicStatus === 'busy'
        ? (psychicStatus === 'offline' ? 'Offline' : 'Busy')
        : 'Chat'}
    </Button>
    
    {/* Call Button */}
    <Button
      onClick={() => {
        if (!user) {
          toast.error("Please log in to start a call");
          navigate("/login");
          return;
        }
        initiateAudioCall(psychic);
      }}
      disabled={isSubmitting}
      className="w-full rounded-full py-3 font-medium transition-all hover:opacity-90"
      style={{ 
        backgroundColor: colors.antiqueGold,
        color: colors.deepPurple
      }}
    >
      <Phone className="mr-2 h-4 w-4" />
      Call
    </Button>
  </div>
  
  {/* Rate Info */}
  <div className="text-center text-sm" style={{ color: colors.deepPurple + "CC" }}>
    ${(psychic.ratePerMin || 1.00).toFixed(2)}/min for both chat & call
  </div>
  
  {/* View Profile Button */}
  <Button
    variant="outline"
    onClick={() => navigate(`/psychic/${psychic._id}`)}
    className="w-full rounded-full py-3 font-medium border-2 transition-all hover:opacity-90"
    style={{ 
      borderColor: colors.antiqueGold,
      color: colors.deepPurple
    }}
  >
    <User className="mr-2 h-4 w-4" />
    View Full Profile
  </Button>
</div>
                  {/* Status Message */}
                  {(psychicStatus === 'offline' || psychicStatus === 'busy') && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {psychicStatus === 'offline'
                        ? "This psychic is currently offline. You can still view their profile."
                        : "This psychic is currently busy. Please try again later."}
                    </p>
                  )}
                  
                  {/* Member Since */}
                  {psychic.createdAt && (
                    <div className="pt-4 mt-4 border-t text-center text-xs" 
                      style={{ borderColor: colors.antiqueGold + "30", color: colors.deepPurple + "CC" }}>
                      Member since {memberSince}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
    
    {showing < humanPsychics.length && (
      <div className="flex justify-center items-center">
        <Button
          onClick={handleShowMore}
          size="lg"
          className="rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105 shadow-lg"
          style={{ 
            backgroundColor: colors.antiqueGold,
            color: colors.deepPurple,
            boxShadow: `0 10px 40px ${colors.antiqueGold}40`
          }}
        >
          <Sparkles className="mr-3 h-5 w-5" />
          Show More Psychics
        </Button>
      </div>
    )}
  </TabsContent>
</Tabs>
      </div>
     
      {/* Comprehensive Features Section */}
      <div className="py-20 px-4" style={{ 
        backgroundColor: colors.deepPurple,
        background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
              style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Why HecateVoyance Stands Out</span>
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.softIvory }}>
              The Ultimate Spiritual Guidance Platform
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.softIvory + "CC" }}>
              We combine ancient wisdom with modern technology to provide authentic, transformative experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Precision Matching",
                description: "Our advanced algorithm connects you with psychics whose specialties align perfectly with your needs.",
                features: ["Skill-based matching", "Personality compatibility", "Client success rates"]
              },
              {
                icon: "🔮",
                title: "Diverse Modalities",
                description: "Access specialists in tarot, astrology, mediumship, numerology, and more for comprehensive guidance.",
                features: ["Multiple reading types", "Specialized experts", "Cross-disciplinary insights"]
              },
              {
                icon: "💖",
                title: "Empathetic Connections",
                description: "Build meaningful relationships with psychics who genuinely care about your spiritual journey.",
                features: ["Compassionate listeners", "Non-judgmental space", "Personalized approach"]
              },
              {
                icon: "🛡️",
                title: "Rigorous Vetting",
                description: "Every psychic undergoes thorough screening, testing, and ongoing quality assessment.",
                features: ["Background checks", "Skill verification", "Client feedback review"]
              },
              {
                icon: "⚡",
                title: "Instant Access",
                description: "Connect with available psychics immediately or schedule sessions at your convenience.",
                features: ["Live availability", "Flexible scheduling", "Global timezone support"]
              },
              {
                icon: "📈",
                title: "Growth-Focused",
                description: "Tools and resources to track your spiritual development and reading history.",
                features: ["Session records", "Progress insights", "Personalized recommendations"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl group hover:scale-105 transition-transform duration-300"
                style={{ 
                  backgroundColor: colors.deepPurple + "DD", 
                  border: `1px solid ${colors.antiqueGold}33`,
                  backdropFilter: "blur(10px)"
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.softIvory }}>
                  {feature.title}
                </h3>
                <p className="mb-4" style={{ color: colors.softIvory + "CC" }}>
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.antiqueGold }}></div>
                      <span style={{ color: colors.softIvory + "CC" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4" style={{ backgroundColor: colors.softIvory }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{ 
              backgroundColor: colors.deepPurple,
              background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.darkPurple})`,
              border: `2px solid ${colors.antiqueGold}`
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colors.antiqueGold }}></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.softIvory }}>
              Ready to Begin Your Spiritual Journey?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.softIvory + "CC" }}>
              Join thousands who have found clarity, direction, and peace through authentic psychic connections
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold shadow-xl"
                style={{ 
                  backgroundColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
                onClick={() => {
                  if (user) {
                    if (humanPsychics.length > 0) {
                      handlePsychicSelect(humanPsychics[0]);
                    } else {
                      toast.info("No psychics available at the moment");
                    }
                  } else {
                    navigate("/login");
                  }
                }}
              >
                Start Chatting Now
              </Button>
            </div>
            
            <p className="text-sm mt-8" style={{ color: colors.softIvory + "80" }}>
              No credit card required for trial · Cancel anytime · 100% satisfaction guarantee
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;