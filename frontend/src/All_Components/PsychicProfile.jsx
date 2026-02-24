import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Star, 
  MessageCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ThumbsUp,
  Calendar,
  TrendingUp,
  Users,
  Filter,
  Phone,
  Shield,
  Award,
  Zap,
  Sparkles,
  Heart,
  ChevronDown,
  Globe,
  BookOpen,
  CheckCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import io from 'socket.io-client';

const PsychicProfile = () => {
  const { psychicId } = useParams();
  const navigate = useNavigate();
  const [psychic, setPsychic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRatings, setAllRatings] = useState([]);
  const [displayedRatings, setDisplayedRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [psychicType, setPsychicType] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [hasMoreRatings, setHasMoreRatings] = useState(true);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  
  // Socket state for real-time status
  const [psychicStatus, setPsychicStatus] = useState({
    status: 'offline',
    lastSeen: null,
    lastUpdate: null
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Status configuration
  const statusConfig = {
    online: { color: '#10b981', label: 'Online', bg: '#10b98110', glow: '#10b98140' },
    away:   { color: '#f59e0b', label: 'Away',   bg: '#f59e0b10', glow: '#f59e0b40' },
    busy:   { color: '#f97316', label: 'Busy',   bg: '#f9731610', glow: '#f9731640' },
    offline:{ color: '#9ca3af', label: 'Offline', bg: '#9ca3af10', glow: '#9ca3af40' },
  };

  const INITIAL_RATINGS_COUNT = 5;
  const LOAD_MORE_COUNT = 10;

  // ========== SOCKET.IO SETUP FOR REAL-TIME STATUS ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    if (!psychicId) return;

    // Create socket connection
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
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected for psychic profile');
      setSocketConnected(true);
      
      // Subscribe to this psychic's status
      newSocket.emit('subscribe_to_psychic_status', { 
        psychicIds: [psychicId] 
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
    });

    // Handle psychic status updates
    newSocket.on('psychic_status_changed', (data) => {
      if (data.psychicId === psychicId) {
        console.log('🔄 Psychic status updated:', data.status);
        setPsychicStatus({
          status: data.status,
          lastSeen: data.lastSeen,
          lastUpdate: Date.now()
        });
      }
    });

    newSocket.on('psychic_status_update', (data) => {
      if (data.psychicId === psychicId) {
        setPsychicStatus({
          status: data.status,
          lastSeen: data.lastSeen,
          lastUpdate: Date.now()
        });
      }
    });

    newSocket.on('psychic_statuses_response', (data) => {
      if (data.statuses && data.statuses[psychicId]) {
        setPsychicStatus({
          status: data.statuses[psychicId].status || 'offline',
          lastSeen: data.statuses[psychicId].lastSeen,
          lastUpdate: Date.now()
        });
      }
    });

    // Request initial status
    newSocket.emit('get_psychic_statuses', { 
      psychicIds: [psychicId] 
    });

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [psychicId]);

  // Helper function to get status display
  const getPsychicStatusDisplay = () => {
    const status = psychicStatus.status || 'offline';
    const config = statusConfig[status] || statusConfig.offline;
    
    if (status === 'online' && psychicStatus.lastUpdate) {
      const minutesSinceUpdate = (Date.now() - psychicStatus.lastUpdate) / (1000 * 60);
      if (minutesSinceUpdate > 2) {
        return statusConfig.away;
      }
    }
    
    return config;
  };

  const isPsychicAvailable = () => {
    const status = psychicStatus.status || 'offline';
    return status === 'online' || status === 'away';
  };

  useEffect(() => {
    const fetchPsychicProfile = async () => {
      setLoading(true);
      try {
        console.log("Fetching psychic profile for ID:", psychicId);
        
        // Try human psychic endpoint first
        let response;
        try {
          console.log("Trying human psychic endpoint...");
          response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/human-psychics/profile/${psychicId}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          
          if (response.data.success) {
            console.log("Human psychic found:", response.data.data);
            const psychicData = response.data.data.psychic;
            
            // Ensure all fields are properly formatted
            setPsychic({
              ...psychicData,
              abilities: psychicData.abilities || psychicData.modalities || [],
              languages: psychicData.languages || ['English'],
              experience: psychicData.experience || psychicData.experienceYears || 3,
              ratePerMin: psychicData.ratePerMin || 1.50,
              isVerified: psychicData.isVerified || false,
              rating: psychicData.rating || { avgRating: 4.5, totalReviews: 0 },
              totalSessions: psychicData.totalSessions || 0,
              successRate: psychicData.successRate || 95,
              clientsHelped: psychicData.clientsHelped || 500
            });
            
            setPsychicType('human');
            await fetchInitialRatings(psychicId, 'human');
            return;
          }
        } catch (humanError) {
          console.log("Human psychic endpoint failed, trying AI psychic...");
        }

        // If human psychic not found, try AI psychic endpoint
        try {
          console.log("Trying AI psychic endpoint...");
          response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/psychics/profile/${psychicId}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          
          if (response.data.success) {
            console.log("AI psychic found:", response.data.data);
            const psychicData = response.data.data.psychic;
            
            setPsychic({
              ...psychicData,
              abilities: psychicData.abilities || psychicData.specialties || [],
              languages: psychicData.languages || ['English'],
              experience: psychicData.experience || 5,
              ratePerMin: psychicData.ratePerMin || 1.50,
              isVerified: psychicData.isVerified || true,
              rating: psychicData.rating || { avgRating: 4.7, totalReviews: 0 },
              totalSessions: psychicData.totalSessions || 0,
              successRate: psychicData.successRate || 98,
              clientsHelped: psychicData.clientsHelped || 1000
            });
            
            setPsychicType('ai');
            await fetchInitialRatings(psychicId, 'ai');
            return;
          }
        } catch (aiError) {
          console.log("AI psychic endpoint failed:", aiError.message);
        }

        toast.error("Psychic not found. May have been removed or ID invalid.");
        
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error.response?.data?.message || "Error fetching psychic profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPsychicProfile();
  }, [psychicId]);

  // Initial ratings and statistics
  const fetchInitialRatings = async (id, type) => {
    try {
      // Get rating statistics
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/ratings/psychic/${id}/summary`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (statsResponse.data.success) {
        console.log("Rating statistics found:", statsResponse.data.data);
        setRatingStats(statsResponse.data.data);
      }

      // Get first page of ratings
      await fetchRatingsPage(1);

    } catch (error) {
      console.log("No ratings found or rating endpoint not available:", error.message);
      // If ratings endpoint doesn't exist, use feedback from psychic data
      if (psychic?.feedback) {
        const feedbackRatings = psychic.feedback.map(f => ({
          _id: f._id || Math.random().toString(),
          rating: f.rating || 5,
          comment: f.message || "Great experience!",
          user: {
            firstName: f.userName || "Anonymous",
            image: f.userImage || "/default-avatar.jpg"
          },
          createdAt: f.createdAt || new Date().toISOString()
        }));
        setAllRatings(feedbackRatings);
        setDisplayedRatings(feedbackRatings.slice(0, INITIAL_RATINGS_COUNT));
        
        // Calculate stats from feedback
        if (feedbackRatings.length > 0) {
          const total = feedbackRatings.length;
          const sum = feedbackRatings.reduce((acc, r) => acc + r.rating, 0);
          const avg = sum / total;
          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          feedbackRatings.forEach(r => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
          });
          
          setRatingStats({
            averageRating: avg,
            totalRatings: total,
            ratingDistribution: distribution
          });
        }
      }
    }
  };

  // Fetch ratings with pagination
  const fetchRatingsPage = async (page) => {
    setRatingsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/ratings/psychic/${psychicId}`,
        {
          params: { 
            page,
            limit: 50,
            sort: sortBy,
            rating: filterRating !== "all" ? filterRating : undefined
          },
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (response.data.success) {
        const newRatings = response.data.data.ratings;
        const totalPages = response.data.data.totalPages || 1;
        
        if (page === 1) {
          setAllRatings(newRatings);
          setDisplayedRatings(newRatings.slice(0, INITIAL_RATINGS_COUNT));
        } else {
          const updatedRatings = [...allRatings, ...newRatings];
          setAllRatings(updatedRatings);
          setDisplayedRatings(updatedRatings.slice(0, INITIAL_RATINGS_COUNT + ((page - 1) * 50)));
        }
        
        setHasMoreRatings(page < totalPages);
        setRatingsPage(page);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Failed to load more reviews");
    } finally {
      setRatingsLoading(false);
    }
  };

  // Load more ratings
  const loadMoreRatings = () => {
    const currentlyDisplayed = displayedRatings.length;
    const nextDisplayCount = currentlyDisplayed + LOAD_MORE_COUNT;
    
    if (nextDisplayCount >= allRatings.length) {
      const nextPage = ratingsPage + 1;
      fetchRatingsPage(nextPage);
    } else {
      setDisplayedRatings(allRatings.slice(0, nextDisplayCount));
    }
  };

  // Sort and filter ratings
  useEffect(() => {
    let filteredRatings = [...allRatings];
    
    if (filterRating !== "all") {
      filteredRatings = filteredRatings.filter(r => r.rating === parseInt(filterRating));
    }
    
    filteredRatings = filteredRatings.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
    
    setAllRatings(filteredRatings);
    setDisplayedRatings(filteredRatings.slice(0, displayedRatings.length > INITIAL_RATINGS_COUNT ? displayedRatings.length : INITIAL_RATINGS_COUNT));
    setCurrentReviewIndex(0);
  }, [sortBy, filterRating]);

  const nextReview = () => {
    if (displayedRatings.length === 0) return;
    setCurrentReviewIndex((prev) =>
      prev === displayedRatings.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    if (displayedRatings.length === 0) return;
    setCurrentReviewIndex((prev) =>
      prev === 0 ? displayedRatings.length - 1 : prev - 1
    );
  };

  const handleChatClick = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (!isPsychicAvailable()) {
      toast.error(`This psychic is currently ${getPsychicStatusDisplay().label.toLowerCase()}. Please try again later.`);
      return;
    }
    
    navigate(`/message/${psychicId}`);
  };

  const handleCallClick = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (!isPsychicAvailable()) {
      toast.error(`This psychic is currently ${getPsychicStatusDisplay().label.toLowerCase()}. Please try again later.`);
      return;
    }
    
    navigate(`/audio-call/initiate/${psychicId}`);
  };

  const calculateStarPercentage = (starCount) => {
    if (ratingStats.totalRatings === 0) return 0;
    return Math.round((starCount / ratingStats.totalRatings) * 100);
  };

  const filterByStar = (star) => {
    if (filterRating === star.toString()) {
      setFilterRating("all");
    } else {
      setFilterRating(star.toString());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: colors.softIvory }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.antiqueGold }}></div>
      </div>
    );
  }

  if (!psychic) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4" style={{ backgroundColor: colors.softIvory }}>
        <Card className="text-center p-8 max-w-sm" style={{ 
          backgroundColor: "white",
          borderColor: colors.antiqueGold + "30"
        }}>
          <CardHeader>
            <CardTitle style={{ color: colors.deepPurple }}>Psychic Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4" style={{ color: colors.deepPurple + "CC" }}>
              The psychic you're looking for doesn't exist or may have been removed.
            </p>
            <Button
              className="rounded-full"
              style={{ 
                backgroundColor: colors.antiqueGold,
                color: colors.deepPurple
              }}
              onClick={() => navigate("/")}
            >
              View Psychics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const abilities = Array.isArray(psychic.abilities) ? psychic.abilities : [];
  const gender = psychic.gender ? psychic.gender.charAt(0).toUpperCase() + psychic.gender.slice(1) : "Not specified";
  const experience = psychic.experience || "0";
  const specialization = psychic.specialization || psychic.category || "Psychic Reader";
  const responseTime = psychic.responseTime ? `${psychic.responseTime} min` : "Instant";
  const memberSince = psychic.createdAt ? new Date(psychic.createdAt).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  }) : "Recently";
  
  const statusDisplay = getPsychicStatusDisplay();
  const isAvailable = isPsychicAvailable();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.softIvory }}>
      <div className="max-w-7xl mx-auto">
        {/* Connection Status */}
        {!socketConnected && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
           
          </div>
        )}

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8 mb-10"
        >
          {/* Psychic Image */}
          <div className="md:w-1/3 flex justify-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ border: `3px solid ${colors.antiqueGold}` }}>
                <img
                  src={psychic.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(psychic.name)}&background=7c3aed&color=fff&size=256`}
                  alt={psychic.name}
                  className="w-64 h-64 object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(psychic.name)}&background=7c3aed&color=fff&size=256`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Badges */}
              <div className="absolute -top-3 -right-3 z-10">
                <Badge className="px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"
                  style={{ 
                    backgroundColor: colors.antiqueGold,
                    color: colors.deepPurple
                  }}>
                  <User className="h-3 w-3" />
                  {psychicType === 'human' ? 'Human Psychic' : 'AI Psychic'}
                </Badge>
              </div>
              
              {psychic.isVerified && (
                <div className="absolute -bottom-3 -left-3 z-10">
                  <Badge className="px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"
                    style={{ 
                      backgroundColor: colors.deepPurple,
                      color: colors.softIvory
                    }}>
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm"
                  style={{ 
                    backgroundColor: `${statusDisplay.color}20`,
                    border: `1px solid ${statusDisplay.color}30`,
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: statusDisplay.color }}
                    />
                    <span 
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: statusDisplay.color }}
                    />
                  </span>
                  <span className="text-xs font-medium" style={{ color: statusDisplay.color }}>
                    {statusDisplay.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Psychic Info */}
          <div className="md:w-2/3">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: colors.deepPurple }}>
                  {psychic.name}
                </h1>
                <p className="text-lg" style={{ color: colors.deepPurple + "CC" }}>
                  {specialization}
                </p>
              </div>
              
              {/* Rating Display */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: colors.deepPurple }}>
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-start mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5`}
                        style={{ 
                          color: i < Math.floor(ratingStats.averageRating) ? colors.antiqueGold : "#E5E7EB",
                          fill: i < Math.floor(ratingStats.averageRating) ? colors.antiqueGold : "transparent"
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-sm mt-1" style={{ color: colors.deepPurple + "CC" }}>
                    {ratingStats.totalRatings} reviews
                  </div>
                </div>
                
                <div className="hidden sm:block h-12 w-px" style={{ backgroundColor: colors.antiqueGold + "40" }}></div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                      {experience === "0" ? "New" : experience}{experience !== "0" ? " yrs" : ""}
                    </div>
                    <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: colors.deepPurple }}>{responseTime}</div>
                    <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                      ${(psychic.ratePerMin || 1.00).toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>per minute</div>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="py-4">
                <h3 className="font-semibold mb-2" style={{ color: colors.deepPurple }}>About</h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.deepPurple + "CC" }}>
                  {psychic.bio || `${psychic.name} is an experienced psychic specializing in ${specialization.toLowerCase()}. With ${experience} years of experience, they have helped thousands of clients find clarity and guidance.`}
                </p>
              </div>
              
              {/* Gender and Languages */}
              <div className="flex flex-wrap gap-2">
                {gender !== "Not specified" && (
                  <Badge className="px-3 py-1 text-xs"
                    style={{ 
                      backgroundColor: colors.lightGold,
                      color: colors.deepPurple
                    }}>
                    {gender}
                  </Badge>
                )}
                {psychic.languages && psychic.languages.map((language, idx) => (
                  <Badge key={idx} className="px-3 py-1 text-xs flex items-center gap-1"
                    style={{ 
                      backgroundColor: colors.lightGold,
                      color: colors.deepPurple
                    }}>
                    <Globe className="h-3 w-3" />
                    {language}
                  </Badge>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
              
                
                <div className="text-center text-sm" style={{ color: colors.deepPurple + "CC" }}>
                  ${(psychic.ratePerMin || 1.00).toFixed(2)}/min for both chat & call
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full rounded-full py-3 font-medium border-2 transition-all hover:opacity-90"
                  style={{ 
                    borderColor: colors.antiqueGold,
                    color: colors.deepPurple
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Psychics
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg p-1" 
            style={{ backgroundColor: colors.lightGold }}>
            <TabsTrigger value="reviews" className="rounded-md data-[state=active]:shadow-sm" 
              style={{ 
                color: colors.deepPurple,
                backgroundColor: activeTab === "reviews" ? colors.softIvory : "transparent"
              }}>
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-md data-[state=active]:shadow-sm"
              style={{ 
                color: colors.deepPurple,
                backgroundColor: activeTab === "about" ? colors.softIvory : "transparent"
              }}>
              <User className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-md data-[state=active]:shadow-sm"
              style={{ 
                color: colors.deepPurple,
                backgroundColor: activeTab === "stats" ? colors.softIvory : "transparent"
              }}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Rating Distribution */}
            <Card className="shadow-lg rounded-xl border-0" style={{ backgroundColor: "white" }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                  Rating Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <button 
                        onClick={() => filterByStar(star)}
                        className={`flex items-center gap-1 w-16 transition-all ${
                          filterRating === star.toString() 
                            ? 'scale-105 font-bold' 
                            : 'hover:opacity-80'
                        }`}
                        style={{ color: colors.deepPurple }}
                      >
                        <span className="text-sm font-medium">{star}★</span>
                        <Star className={`h-4 w-4 ${filterRating === star.toString() ? 'fill-current' : ''}`} 
                          style={{ color: filterRating === star.toString() ? colors.antiqueGold : colors.antiqueGold + "80" }} />
                      </button>
                      <Progress 
                        value={calculateStarPercentage(ratingStats.ratingDistribution[star] || 0)} 
                        className="h-2 flex-1"
                        style={{ backgroundColor: colors.lightGold }}
                      />
                      <div className="w-10 text-right">
                        <span className="text-sm font-medium" style={{ color: colors.deepPurple }}>
                          {ratingStats.ratingDistribution[star] || 0}
                        </span>
                        <span className="text-xs ml-1" style={{ color: colors.deepPurple + "CC" }}>
                          ({calculateStarPercentage(ratingStats.ratingDistribution[star] || 0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filterRating !== "all" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFilterRating("all")}
                    className="mt-3"
                    style={{ color: colors.antiqueGold }}
                  >
                    Clear filter ({filterRating}★)
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Reviews Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                  Client Reviews
                </h2>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                  What clients are saying about {psychic.name}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]" style={{ borderColor: colors.antiqueGold + "50" }}>
                    <Filter className="h-4 w-4 mr-2" style={{ color: colors.antiqueGold }} />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reviews Content */}
            <Card className="shadow-lg rounded-xl border-0" style={{ backgroundColor: "white" }}>
              <CardContent className="p-6">
                {displayedRatings.length > 0 ? (
                  <div className="space-y-6">
                    {/* Featured Reviews Carousel */}
                    <div className="relative mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: colors.deepPurple }}>Featured Reviews</h3>
                          <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Highlighted experiences</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevReview}
                            className="rounded-full"
                            style={{ 
                              backgroundColor: colors.lightGold,
                              color: colors.deepPurple
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextReview}
                            className="rounded-full"
                            style={{ 
                              backgroundColor: colors.lightGold,
                              color: colors.deepPurple
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden">
                        {displayedRatings.length > 0 && (
                          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border"
                            style={{ borderColor: colors.antiqueGold + "30" }}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border" style={{ borderColor: colors.antiqueGold }}>
                                  <AvatarImage src={displayedRatings[currentReviewIndex]?.user?.image} />
                                  <AvatarFallback className="text-sm" 
                                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                                    {(displayedRatings[currentReviewIndex]?.user?.firstName || "A").charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold" style={{ color: colors.deepPurple }}>
                                    {displayedRatings[currentReviewIndex]?.user?.firstName || "Anonymous"}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    {Array(5).fill(0).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < (displayedRatings[currentReviewIndex]?.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>
                                {new Date(displayedRatings[currentReviewIndex]?.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            
                            <p className="text-sm leading-relaxed italic" style={{ color: colors.deepPurple + "CC" }}>
                              "{displayedRatings[currentReviewIndex]?.comment || "Great experience!"}"
                            </p>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t"
                              style={{ borderColor: colors.antiqueGold + "30" }}>
                              <Badge className="text-xs px-2 py-1"
                                style={{ 
                                  backgroundColor: colors.antiqueGold + "20",
                                  color: colors.antiqueGold
                                }}>
                                {displayedRatings[currentReviewIndex]?.rating}★ Rating
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-7 text-xs"
                                style={{ color: colors.deepPurple }}>
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Helpful
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {displayedRatings.length > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          {displayedRatings.slice(0, 5).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentReviewIndex(idx)}
                              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                idx === currentReviewIndex
                                  ? "w-3"
                                  : ""
                              }`}
                              style={{ 
                                backgroundColor: idx === currentReviewIndex ? colors.antiqueGold : colors.lightGold
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* All Reviews List */}
                    <div className="space-y-4">
                      {displayedRatings.map((review) => (
                        <div key={review._id} className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                          style={{ borderColor: colors.antiqueGold + "30" }}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.user?.image} />
                                <AvatarFallback className="text-xs" 
                                  style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                                  {(review.user?.firstName || "A").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium" style={{ color: colors.deepPurple }}>
                                  {review.user?.firstName || "Anonymous"}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < (review.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"}`}
                                    />
                                  ))}
                                  <span className="ml-2 text-xs" style={{ color: colors.deepPurple + "CC" }}>
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className="text-xs px-2 py-1"
                              style={{ 
                                backgroundColor: colors.antiqueGold + "20",
                                color: colors.antiqueGold
                              }}>
                              {review.rating}★
                            </Badge>
                          </div>
                          
                          {review.comment && (
                            <p className="mt-3 text-sm" style={{ color: colors.deepPurple + "CC" }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {(allRatings.length > displayedRatings.length || hasMoreRatings) && (
                      <div className="mt-8 text-center">
                        <Button
                          onClick={loadMoreRatings}
                          disabled={ratingsLoading}
                          variant="outline"
                          className="px-8 py-2 rounded-full"
                          style={{ 
                            borderColor: colors.antiqueGold,
                            color: colors.deepPurple
                          }}
                        >
                          {ratingsLoading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 mr-2"
                                style={{ borderColor: colors.antiqueGold + "30", borderTopColor: colors.antiqueGold }}></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Load More Reviews ({allRatings.length - displayedRatings.length} more)
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* No more reviews message */}
                    {allRatings.length > 0 && displayedRatings.length >= allRatings.length && !hasMoreRatings && (
                      <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                          style={{ backgroundColor: colors.lightGold }}>
                          <Star className="h-6 w-6" style={{ color: colors.antiqueGold }} />
                        </div>
                        <h4 className="font-medium mb-1" style={{ color: colors.deepPurple }}>
                          All reviews loaded
                        </h4>
                        <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                          You've viewed all {allRatings.length} reviews for {psychic.name}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: colors.lightGold }}>
                      <Star className="h-8 w-8" style={{ color: colors.antiqueGold }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: colors.deepPurple }}>
                      No reviews yet
                    </h3>
                    <p className="text-sm mb-4" style={{ color: colors.deepPurple + "CC" }}>
                      Be the first to review {psychic.name}
                    </p>
                    <Button
                      onClick={handleChatClick}
                      disabled={!isAvailable}
                      className="rounded-full"
                      style={{ 
                        backgroundColor: colors.antiqueGold,
                        color: colors.deepPurple,
                        opacity: !isAvailable ? 0.5 : 1
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat to leave a review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="shadow-lg rounded-xl border-0" style={{ backgroundColor: "white" }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Abilities */}
                {abilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: colors.deepPurple }}>Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {abilities.map((ability, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1 rounded-full"
                          style={{ 
                            borderColor: colors.antiqueGold,
                            color: colors.deepPurple
                          }}>
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                      <span className="font-medium" style={{ color: colors.deepPurple }}>Response Time</span>
                    </div>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{responseTime} response time</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                      <span className="font-medium" style={{ color: colors.deepPurple }}>Experience</span>
                    </div>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                      {experience === "0" ? "New psychic" : `${experience} years experience`}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                      <span className="font-medium" style={{ color: colors.deepPurple }}>Member Since</span>
                    </div>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                      {memberSince}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                      <span className="font-medium" style={{ color: colors.deepPurple }}>Gender</span>
                    </div>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{gender}</p>
                  </div>

                  {psychic.languages && psychic.languages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                        <span className="font-medium" style={{ color: colors.deepPurple }}>Languages</span>
                      </div>
                      <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{psychic.languages.join(', ')}</p>
                    </div>
                  )}

                  {psychic.location && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                        <span className="font-medium" style={{ color: colors.deepPurple }}>Location</span>
                      </div>
                      <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{psychic.location}</p>
                    </div>
                  )}

                  {psychic.totalSessions > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" style={{ color: colors.antiqueGold }} />
                        <span className="font-medium" style={{ color: colors.deepPurple }}>Total Sessions</span>
                      </div>
                      <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{psychic.totalSessions}+ sessions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="shadow-lg rounded-xl border-0" style={{ backgroundColor: "white" }}>
              <CardHeader>
                <CardTitle className="text-xl font-bold" style={{ color: colors.deepPurple }}>
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.deepPurple }}>
                      {ratingStats.totalRatings}
                    </div>
                    <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Total Reviews</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.deepPurple }}>
                      {ratingStats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Average Rating</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.deepPurple }}>
                      {psychic.successRate || 95}%
                    </div>
                    <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Success Rate</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.deepPurple }}>
                      {psychic.clientsHelped || 500}+
                    </div>
                    <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Clients Helped</div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                  <h4 className="font-semibold mb-2" style={{ color: colors.deepPurple }}>Client Satisfaction</h4>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                    {psychic.name} maintains a {ratingStats.averageRating.toFixed(1)}★ rating based on {ratingStats.totalRatings} reviews.
                    {psychic.successRate && ` They have a ${psychic.successRate}% success rate and have helped ${psychic.clientsHelped || 500}+ clients.`}
                  </p>
                </div>

                {/* Rating Distribution Summary */}
                <div className="mt-8">
                  <h4 className="font-semibold mb-3" style={{ color: colors.deepPurple }}>Rating Distribution</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-8" style={{ color: colors.deepPurple }}>{star}★</span>
                        <Progress 
                          value={calculateStarPercentage(ratingStats.ratingDistribution[star] || 0)} 
                          className="h-2 flex-1"
                          style={{ backgroundColor: colors.lightGold }}
                        />
                        <span className="text-sm w-12 text-right" style={{ color: colors.deepPurple }}>
                          {calculateStarPercentage(ratingStats.ratingDistribution[star] || 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PsychicProfile;