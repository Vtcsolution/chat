// Psychics.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Star, 
  Sparkles, 
  Users, 
  Clock, 
  Shield, 
  Award,
  MessageCircle,
  Phone,
  User,
  Zap,
  Heart,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  SortAsc,
  SortDesc,
  ChevronRight,
  Loader,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./screen/AuthContext";
import io from 'socket.io-client';

const Psychics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Color scheme (same as home page)
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Socket reference
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const subscribedPsychicsRef = useRef(new Set());

  // State
  const [psychics, setPsychics] = useState([]);
  const [filteredPsychics, setFilteredPsychics] = useState([]);
  const [displayedPsychics, setDisplayedPsychics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedPsychic, setExpandedPsychic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [psychicStatuses, setPsychicStatuses] = useState({});
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [experienceRange, setExperienceRange] = useState([0, 30]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  
  // Pagination
  const [itemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Categories with icons and default
  const categories = [
    { id: "all", label: "All Psychics", icon: "🔮", value: "all" },
    { id: "Tarot Reading", label: "Tarot Reading", icon: "🃏", value: "Tarot Reading" },
    { id: "Astrology", label: "Astrology", icon: "♈", value: "Astrology" },
    { id: "Reading", label: "Reading", icon: "📖", value: "Reading" },
    { id: "Love & Relationships", label: "Love & Relationships", icon: "💖", value: "Love & Relationships" },
    { id: "Career & Finance", label: "Career & Finance", icon: "💼", value: "Career & Finance" },
    { id: "Spiritual Guidance", label: "Spiritual Guidance", icon: "🕊️", value: "Spiritual Guidance" },
    { id: "Numerology", label: "Numerology", icon: "🔢", value: "Numerology" },
    { id: "Clairvoyant", label: "Clairvoyant", icon: "👁️", value: "Clairvoyant" },
    { id: "Dream Analysis", label: "Dream Analysis", icon: "💭", value: "Dream Analysis" },
  ];

  // Sort options
  const sortOptions = [
    { id: "rating", label: "Highest Rated" },
    { id: "reviews", label: "Most Reviews" },
    { id: "priceLow", label: "Price: Low to High" },
    { id: "priceHigh", label: "Price: High to Low" },
    { id: "experience", label: "Most Experienced" },
    { id: "name", label: "Name: A to Z" },
  ];

  // Fetch psychic categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/human-psychics/categories`);
        if (response.data.success) {
          setAvailableCategories(response.data.categories);
          
          // Create category counts object
          const counts = {};
          response.data.categories.forEach(cat => {
            counts[cat.name] = cat.count;
          });
          setCategoryCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch psychic rating summary
  const fetchPsychicRatingSummary = async (psychicId) => {
    try {
      const endpoints = [
        `${import.meta.env.VITE_BASE_URL}/api/psychic/${psychicId}/summary`,
        `${import.meta.env.VITE_BASE_URL}/api/ratings/psychic/${psychicId}/summary`,
        `${import.meta.env.VITE_BASE_URL}/api/human-psychics/${psychicId}/summary`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, { timeout: 3000 });
          if (response.data && response.data.success) {
            return response.data.data;
          }
        } catch (err) {
          // Try next endpoint
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // ========== SOCKET.IO SETUP ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = user?._id || '';
    
    if (!userId) return;
    
    if (socketRef.current?.connected) {
      console.log('ℹ️ Socket already connected');
      return;
    }

    console.log('🔄 Creating new socket connection for psychics page...');
    
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
    if (!socketConnected || !socketRef.current || psychics.length === 0) return;

    const allPsychicIds = psychics.map(p => p._id).filter(id => id && !subscribedPsychicsRef.current.has(id));

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
  }, [socketConnected, psychics]);

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

  // Get category with default
  const getPsychicCategory = (psychic) => {
    return psychic.category || "Reading";
  };

  // Fetch psychics from API with category filter
  useEffect(() => {
    const fetchPsychics = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        
        // Build query params for category filtering
        const params = new URLSearchParams();
        if (selectedCategories.length > 0 && !selectedCategories.includes("all")) {
          params.append('category', selectedCategories.join(','));
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (sortBy) {
          params.append('sortBy', sortBy);
          params.append('sortOrder', sortOrder);
        }
        
        const url = `${import.meta.env.VITE_BASE_URL}/api/human-psychics${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        
        const data = response.data;
        if (data.success && Array.isArray(data.psychics)) {
          const formattedPsychics = data.psychics.map(p => ({
            ...p,
            category: p.category || "Reading", // Default to Reading if no category
            isHuman: true,
            type: p.type || "Human Psychic",
            modalities: p.modalities || p.abilities || [p.category || "Psychic Reading"],
            experienceYears: p.experience || p.experienceYears || 3,
            successRate: p.successRate || 95,
            clientsHelped: p.clientsHelped || 500
          }));

          // Fetch rating summaries for each psychic
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

          // Merge rating data with psychics
          const psychicsWithRatings = formattedPsychics.map(psychic => ({
            ...psychic,
            rating: summaryMap[psychic._id] || psychic.rating || {
              avgRating: 4.5,
              totalReviews: 100
            }
          }));

          setPsychics(psychicsWithRatings);
          
          // Fetch initial statuses
          const psychicIds = formattedPsychics.map(p => p._id);
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
                    lastUpdate: Date.now()
                  };
                });
                
                setPsychicStatuses(prev => ({
                  ...prev,
                  ...newStatuses
                }));
              }
            } catch (statusError) {
              console.warn("Status fetch failed:", statusError);
            }
          }
        } else {
          throw new Error(data.message || "Failed to fetch psychics");
        }
      } catch (error) {
        console.error("Error fetching psychics:", error);
        toast.error(error.response?.data?.message || "Failed to load psychics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPsychics();
  }, [selectedCategories, searchQuery, sortBy, sortOrder]); // Add dependencies for filtering

  // Filter and sort psychics (client-side as backup)
  useEffect(() => {
    let result = [...psychics];

    // Filter by search query (additional client-side filtering)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(psychic =>
        psychic.name?.toLowerCase().includes(query) ||
        psychic.bio?.toLowerCase().includes(query) ||
        psychic.specialty?.toLowerCase().includes(query) ||
        (psychic.category || "Reading").toLowerCase().includes(query) ||
        psychic.modalities?.some(m => m?.toLowerCase().includes(query))
      );
    }

    // Filter by availability (real-time)
    if (availableOnly) {
      result = result.filter(psychic => isPsychicAvailable(psychic._id));
    }

    // Filter by price range
    result = result.filter(psychic =>
      (psychic.ratePerMin || 1) >= priceRange[0] && (psychic.ratePerMin || 1) <= priceRange[1]
    );

    // Filter by experience range
    result = result.filter(psychic =>
      (psychic.experienceYears || 0) >= experienceRange[0] &&
      (psychic.experienceYears || 0) <= experienceRange[1]
    );

    // Sort results
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "rating":
          comparison = (b.rating?.avgRating || 0) - (a.rating?.avgRating || 0);
          break;
        case "reviews":
          comparison = (b.rating?.totalReviews || 0) - (a.rating?.totalReviews || 0);
          break;
        case "priceLow":
          comparison = (a.ratePerMin || 1) - (b.ratePerMin || 1);
          break;
        case "priceHigh":
          comparison = (b.ratePerMin || 1) - (a.ratePerMin || 1);
          break;
        case "experience":
          comparison = (b.experienceYears || 0) - (a.experienceYears || 0);
          break;
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "desc" ? comparison : -comparison;
    });

    setFilteredPsychics(result);
    
    // Reset pagination when filters change
    const initialDisplay = result.slice(0, itemsPerPage);
    setDisplayedPsychics(initialDisplay);
    setCurrentPage(1);
    setHasMore(result.length > itemsPerPage);
  }, [psychics, searchQuery, sortBy, sortOrder, availableOnly, priceRange, experienceRange, psychicStatuses]);

  // Load more psychics
  const loadMorePsychics = () => {
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      const newPsychics = filteredPsychics.slice(startIndex, endIndex);
      
      setDisplayedPsychics(newPsychics);
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredPsychics.length);
      setIsLoadingMore(false);
    }, 800);
  };

  // Handle category selection
  const toggleCategory = (categoryId) => {
    if (categoryId === "all") {
      setSelectedCategories(["all"]);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.includes("all") ? [categoryId] : [...prev];
        if (newSelection.includes(categoryId)) {
          return newSelection.filter(id => id !== categoryId);
        } else {
          return [...newSelection, categoryId];
        }
      });
    }
  };

  // Handle chat initiation
  const handlePsychicSelect = async (psychic) => {
    if (!user) {
      toast.error("Please log in to chat with a psychic");
      navigate("/login");
      return;
    }

    const psychicStatus = getPsychicStatus(psychic._id);
    const isAvailable = isPsychicAvailable(psychic._id);

    if (!isAvailable) {
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
        toast.success("Chat session started!");
      } else {
        toast.error(response.data.message || "Failed to start chat.");
      }
    } catch (error) {
      console.error("Chat session error:", error);
      toast.error(error.response?.data?.message || "Failed to start chat. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle audio call initiation
  const initiateAudioCall = async (psychic) => {
    if (!user) {
      toast.error("Please log in to start a call");
      navigate("/login");
      return;
    }

    const psychicStatus = getPsychicStatus(psychic._id);
    const isAvailable = isPsychicAvailable(psychic._id);

    if (!isAvailable) {
      toast.error(`This psychic is currently ${psychicStatus.toLowerCase()}. Please try again later.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/calls/initiate/${psychic._id}`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        const { callRequestId, callSessionId, roomName, expiresAt, isFreeSession } = response.data.data;
        
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
            status: 'initiated'
          }
        });
        
        toast.success("Call initiated! Waiting for psychic to accept...");
      } else {
        toast.error(response.data.message || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Error initiating audio call:", error);
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('active call')) {
          toast.error("You already have an active call. Please end it first.");
        } else if (error.response?.data?.message?.includes('not available')) {
          toast.error("Psychic is not available for calls at the moment.");
        } else {
          toast.error(error.response?.data?.message || "Failed to start call");
        }
      } else if (error.response?.status === 404) {
        toast.error("Psychic not found.");
      } else if (error.response?.status === 403) {
        toast.error("Insufficient credits to start a call.");
      } else {
        toast.error("Failed to start audio call. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle psychic details
  const togglePsychicDetails = (psychicId) => {
    setExpandedPsychic(expandedPsychic === psychicId ? null : psychicId);
  };

  // Get rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3 w-3" fill={colors.antiqueGold} color={colors.antiqueGold} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-3 w-3" fill={colors.antiqueGold} color={colors.antiqueGold} />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3" color={colors.lightGold} />);
      }
    }
    return stars;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
      {/* Connection Status */}
      {!socketConnected && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Badge className="px-3 py-1 bg-yellow-500 text-white rounded-full flex items-center gap-2">
            <WifiOff className="h-3 w-3" />
            Connecting to real-time updates...
          </Badge>
        </div>
      )}

      {/* Hero Header */}
      <div 
        className="relative py-16 px-4 overflow-hidden"
        style={{ 
          backgroundColor: colors.deepPurple,
          background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
        }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                background: `radial-gradient(circle, ${colors.antiqueGold} 0%, transparent 70%)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 10 + i * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Our Gifted Community</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: colors.softIvory }}
            >
              Meet Our <span style={{ color: colors.antiqueGold }}>Gifted Psychics</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto mb-8"
              style={{ color: colors.softIvory + "CC" }}
            >
              Discover authentic spiritual guides ready to illuminate your path with wisdom, 
              empathy, and profound insight.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 py-4 px-4 shadow-md"
        style={{ backgroundColor: colors.softIvory, borderBottom: `1px solid ${colors.lightGold}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                  style={{ color: colors.deepPurple + "80" }} />
                <Input
                  placeholder="Search psychics by name, specialty, or ability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-2 py-6"
                  style={{ 
                    borderColor: colors.lightGold,
                    backgroundColor: "white",
                    color: colors.deepPurple
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4" style={{ color: colors.deepPurple + "80" }} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              {/* Sort Dropdown */}
             

              {/* Availability Filter */}
              <Button
                variant={availableOnly ? "default" : "outline"}
                onClick={() => setAvailableOnly(!availableOnly)}
                className="rounded-full gap-2"
                style={{
                  backgroundColor: availableOnly ? colors.antiqueGold : "transparent",
                  borderColor: colors.antiqueGold,
                  color: availableOnly ? colors.deepPurple : colors.deepPurple
                }}
              >
                <Zap className="h-4 w-4" />
                Available Now
                {availableOnly && <Check className="h-3 w-3" />}
              </Button>

              {/* Clear Filters */}
              {(searchQuery || selectedCategories.length > 1 || availableOnly) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories(["all"]);
                    setAvailableOnly(false);
                    setPriceRange([0, 10]);
                    setExperienceRange([0, 30]);
                  }}
                  className="rounded-full"
                  style={{ color: colors.deepPurple + "CC" }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Categories Filter - Show category counts */}
         

          {/* Advanced Filters (expandable) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t overflow-hidden"
                style={{ borderColor: colors.lightGold }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: colors.deepPurple }}>
                      Price Range (per minute)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                        className="w-24 text-center rounded-full"
                        style={{ borderColor: colors.lightGold }}
                      />
                      <span style={{ color: colors.deepPurple }}>to</span>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 10])}
                        className="w-24 text-center rounded-full"
                        style={{ borderColor: colors.lightGold }}
                      />
                      <span className="text-sm" style={{ color: colors.deepPurple + "CC" }}>USD</span>
                    </div>
                  </div>

                  {/* Experience Range Filter */}
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: colors.deepPurple }}>
                      Experience (years)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceRange[0]}
                        onChange={(e) => setExperienceRange([parseFloat(e.target.value) || 0, experienceRange[1]])}
                        className="w-24 text-center rounded-full"
                        style={{ borderColor: colors.lightGold }}
                      />
                      <span style={{ color: colors.deepPurple }}>to</span>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceRange[1]}
                        onChange={(e) => setExperienceRange([experienceRange[0], parseFloat(e.target.value) || 30])}
                        className="w-24 text-center rounded-full"
                        style={{ borderColor: colors.lightGold }}
                      />
                      <span className="text-sm" style={{ color: colors.deepPurple + "CC" }}>years</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="py-4 px-4" style={{ backgroundColor: colors.lightGold }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                {filteredPsychics.length}
              </div>
              <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Psychics Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                {psychics.filter(p => isPsychicAvailable(p._id)).length}
              </div>
              <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Available Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                4.8
              </div>
              <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                {psychics.reduce((acc, p) => acc + (p.rating?.totalReviews || 0), 0)}+
              </div>
              <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Total Readings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Psychics Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {displayedPsychics.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: colors.lightGold }}>
              <Search className="h-10 w-10" style={{ color: colors.deepPurple }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.deepPurple }}>
              No Psychics Found
            </h3>
            <p className="mb-6" style={{ color: colors.deepPurple + "CC" }}>
              Try adjusting your search filters or browse all psychics
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories(["all"]);
                setAvailableOnly(false);
              }}
              style={{ backgroundColor: colors.antiqueGold, color: colors.deepPurple }}
              className="rounded-full"
            >
              Show All Psychics
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <AnimatePresence>
                {displayedPsychics.map((psychic, index) => {
                  const psychicStatus = getPsychicStatus(psychic._id);
                  const isAvailable = isPsychicAvailable(psychic._id);
                  const rating = ratingSummaries[psychic._id] || psychic.rating || { avgRating: 4.5, totalReviews: 100 };
                  const psychicCategory = getPsychicCategory(psychic);
                  
                  return (
                    <motion.div
                      key={psychic._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="relative group"
                    >
                      {/* Psychic Card */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.antiqueGold}, ${colors.deepPurple})`,
                          transform: "translateY(10px) scale(1.02)"
                        }}></div>
                      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                        style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                        
                        {/* Status & Verification Badge */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                          {/* Online Status with real-time updates */}
                          <Badge className="px-3 py-1 rounded-full flex items-center gap-1"
                            style={{ 
                              backgroundColor: getStatusBadgeColor(psychicStatus).split(' ')[0],
                              color: 'white'
                            }}>
                            {getStatusIcon(psychicStatus)}
                            <span className="text-xs font-medium">{getStatusText(psychicStatus)}</span>
                          </Badge>
                          
                          {/* Verification Badge */}
                          {psychic.isVerified && (
                            <Badge className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: colors.deepPurple + "10", 
                                color: colors.deepPurple,
                                border: `1px solid ${colors.deepPurple}30`
                              }}>
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          
                          {/* Category Badge - Always show with default */}
                          <Badge className="px-2 py-1 rounded-full text-xs"
                            style={{ 
                              backgroundColor: colors.antiqueGold + "10", 
                              color: colors.deepPurple,
                              border: `1px solid ${colors.antiqueGold}30`
                            }}>
                            {psychicCategory}
                          </Badge>
                        </div>
                        
                        {/* Psychic Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={psychic.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(psychic.name)}&background=7c3aed&color=fff&size=256`}
                            alt={psychic.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(psychic.name)}&background=7c3aed&color=fff&size=256`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-2xl font-bold text-white">{psychic.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-white/90">{psychic.specialty || psychicCategory}</p>
                              {psychic.gender && (
                                <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                                  {psychic.gender.charAt(0).toUpperCase() + psychic.gender.slice(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Details */}
                        <div className="p-6">
                          {/* Rating and Price */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {renderStars(rating.avgRating)}
                              </div>
                              <span className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                                {rating.avgRating?.toFixed(1) || "4.5"}
                                <span className="text-xs ml-1">({rating.totalReviews || "100+"})</span>
                              </span>
                            </div>
                            
                            {/* Rate per minute */}
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                                ${psychic.ratePerMin?.toFixed(2) || "1.00"}
                              </div>
                              <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>per minute</div>
                            </div>
                          </div>
                          
                          {/* Bio */}
                          <div className="mb-4">
                            <p className="text-sm line-clamp-2" style={{ color: colors.deepPurple + "CC" }}>
                              {psychic.bio || "Experienced psychic with compassionate approach..."}
                            </p>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                              <Clock className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                              <div>
                                <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Response</div>
                                <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>
                                  {psychic.responseTime ? `${psychic.responseTime} min` : "Instant"}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                              <Users className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                              <div>
                                <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Experience</div>
                                <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>
                                  {psychic.experienceYears || psychic.experience || "3"}+ years
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => handlePsychicSelect(psychic)}
                                disabled={isSubmitting || !isAvailable}
                                className="w-full rounded-full py-3 font-medium transition-all hover:opacity-90"
                                style={{ 
                                  backgroundColor: colors.deepPurple,
                                  color: colors.softIvory
                                }}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Chat
                              </Button>
                              
                              <Button
                                onClick={() => initiateAudioCall(psychic)}
                                disabled={isSubmitting || !isAvailable}
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
                              ${psychic.ratePerMin?.toFixed(2) || "1.00"}/min for both chat & call
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/psychic/${psychic._id}`)}
                                className="flex-1 rounded-full py-3 font-medium"
                                style={{ 
                                  borderColor: colors.antiqueGold,
                                  color: colors.deepPurple
                                }}
                              >
                                <User className="mr-2 h-4 w-4" />
                                Profile
                              </Button>
                              
                              <Button
                                variant="ghost"
                                onClick={() => togglePsychicDetails(psychic._id)}
                                className="px-3 rounded-full"
                                style={{ color: colors.deepPurple }}
                              >
                                {expandedPsychic === psychic._id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Message */}
                        {!isAvailable && (
                          <div className="px-6 py-2 text-center text-xs"
                            style={{ backgroundColor: colors.lightGold + "50", color: colors.deepPurple + "CC" }}>
                            {psychicStatus === 'offline' 
                              ? "This psychic is currently offline"
                              : psychicStatus === 'busy'
                              ? "This psychic is currently busy"
                              : "Currently unavailable"}
                          </div>
                        )}
                        
                        {/* Member Since */}
                        {psychic.createdAt && (
                          <div className="px-6 py-3 border-t text-center text-xs" 
                            style={{ borderColor: colors.antiqueGold + "30", color: colors.deepPurple + "CC" }}>
                            Member since {new Date(psychic.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        )}
                        
                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedPsychic === psychic._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t"
                              style={{ borderColor: colors.lightGold }}
                            >
                              <div className="p-6">
                                {/* Specialties */}
                                {psychic.modalities && psychic.modalities.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-semibold mb-2 text-sm" style={{ color: colors.deepPurple }}>
                                      Specialties
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {psychic.modalities.slice(0, 5).map((modality, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs rounded-full px-3 py-1"
                                          style={{ 
                                            borderColor: colors.antiqueGold + "50", 
                                            color: colors.deepPurple + "CC"
                                          }}
                                        >
                                          {modality}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Languages */}
                                {psychic.languages && psychic.languages.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-semibold mb-2 text-sm" style={{ color: colors.deepPurple }}>
                                      Languages
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {psychic.languages.map((lang, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs rounded-full px-3 py-1"
                                          style={{ 
                                            borderColor: colors.antiqueGold + "50", 
                                            color: colors.deepPurple + "CC"
                                          }}
                                        >
                                          <Globe className="h-3 w-3 mr-1" />
                                          {lang}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Info */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h4 className="font-semibold mb-1 text-xs" style={{ color: colors.deepPurple + "CC" }}>
                                      Success Rate
                                    </h4>
                                    <div className="text-lg font-bold" style={{ color: colors.deepPurple }}>
                                      {psychic.successRate || "95"}%
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1 text-xs" style={{ color: colors.deepPurple + "CC" }}>
                                      Clients Helped
                                    </h4>
                                    <div className="text-lg font-bold" style={{ color: colors.deepPurple }}>
                                      {psychic.clientsHelped || "500+"}
                                    </div>
                                  </div>
                                </div>

                                {/* Full Bio */}
                                {psychic.bio && (
                                  <div className="mb-4">
                                    <h4 className="font-semibold mb-2 text-sm" style={{ color: colors.deepPurple }}>
                                      About
                                    </h4>
                                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                                      {psychic.bio}
                                    </p>
                                  </div>
                                )}

                                {/* View Full Profile Button */}
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/psychic/${psychic._id}`)}
                                  className="w-full rounded-full py-3"
                                  style={{ 
                                    borderColor: colors.antiqueGold,
                                    color: colors.deepPurple
                                  }}
                                >
                                  View Complete Profile & Reviews
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={loadMorePsychics}
                  disabled={isLoadingMore}
                  className="rounded-full px-8 py-6 min-w-[200px] transition-all hover:scale-105"
                  style={{ 
                    borderColor: colors.antiqueGold,
                    color: colors.deepPurple,
                    backgroundColor: colors.softIvory
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Psychics
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm mt-4" style={{ color: colors.deepPurple + "CC" }}>
                  Showing {displayedPsychics.length} of {filteredPsychics.length} psychics
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="py-12 px-4" style={{ backgroundColor: colors.deepPurple }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.softIvory }}>
              Why Choose Our Psychics?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.softIvory + "CC" }}>
              Every psychic in our community meets our high standards for authenticity and excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Rigorous Vetting",
                description: "Every psychic undergoes extensive screening, testing, and background checks."
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Empathetic Approach",
                description: "Our psychics provide compassionate guidance in a judgment-free space."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Proven Accuracy",
                description: "High client satisfaction rates and consistent positive feedback."
              }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl"
                style={{ backgroundColor: colors.darkPurple, border: `1px solid ${colors.antiqueGold}30` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.softIvory }}>
                  {feature.title}
                </h3>
                <p style={{ color: colors.softIvory + "CC" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 px-4" style={{ backgroundColor: colors.softIvory }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-50 to-gold-50 rounded-3xl p-8 md:p-12"
            style={{ border: `2px solid ${colors.antiqueGold}` }}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepPurple }}>
              Need Help Finding the Right Psychic?
            </h2>
            <p className="text-lg mb-8" style={{ color: colors.deepPurple + "CC" }}>
              Our matching algorithm can connect you with the perfect psychic for your specific needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 py-6"
                style={{ backgroundColor: colors.antiqueGold, color: colors.deepPurple }}
                onClick={() => navigate("/quiz")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Take Our Matching Quiz
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6"
                style={{ borderColor: colors.antiqueGold, color: colors.deepPurple }}
                onClick={() => navigate("/contact")}
              >
                Contact Our Support Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Psychics;