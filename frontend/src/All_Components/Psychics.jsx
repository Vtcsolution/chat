// Psychics.jsx
import { useState, useEffect, useMemo } from "react";
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
  Loader
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

const Psychics = () => {
  const navigate = useNavigate();
  
  // Color scheme (same as home page)
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

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
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [experienceRange, setExperienceRange] = useState([0, 30]);
  
  // Pagination
  const [itemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Categories
  const categories = [
    { id: "all", label: "All Psychics", icon: "🔮" },
    { id: "tarot", label: "Tarot Reading", icon: "🃏" },
    { id: "astrology", label: "Astrology", icon: "♈" },
    { id: "love", label: "Love & Relationships", icon: "💖" },
    { id: "career", label: "Career & Finance", icon: "💼" },
    { id: "spiritual", label: "Spiritual Guidance", icon: "🕊️" },
    { id: "mediumship", label: "Mediumship", icon: "👻" },
    { id: "numerology", label: "Numerology", icon: "🔢" },
    { id: "clairvoyant", label: "Clairvoyant", icon: "👁️" },
    { id: "dream", label: "Dream Analysis", icon: "💭" },
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

  // Static psychic data for demo (same as home page)
  const staticPsychicProfiles = [
    {
      _id: "1",
      name: "Serena Moon",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      specialty: "Tarot & Astrology",
      gender: "female",
      bio: "With over 15 years of experience, Serena specializes in tarot readings and astrological guidance. She has helped thousands find clarity in love and career paths.",
      rating: {
        avgRating: 4.9,
        totalReviews: 342
      },
      ratePerMin: 2.50,
      experience: "15+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      createdAt: "2021-03-15T00:00:00.000Z",
      abilities: ["tarot", "astrology", "love", "career"],
      languages: ["English", "Spanish"],
      modalities: ["Tarot Reading", "Astrology", "Love Guidance"],
      experienceYears: 15,
      successRate: 95,
      clientsHelped: 500
    },
    {
      _id: "2",
      name: "Marcus Thorne",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      specialty: "Mediumship & Spiritual Healing",
      gender: "male",
      bio: "A third-generation medium, Marcus connects with spiritual realms to provide healing and closure. Specializes in connecting with loved ones who have passed.",
      rating: {
        avgRating: 4.8,
        totalReviews: 278
      },
      ratePerMin: 3.00,
      experience: "12+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: false,
      createdAt: "2020-07-22T00:00:00.000Z",
      abilities: ["mediumship", "spiritual", "healing", "relationships"],
      languages: ["English", "French"],
      modalities: ["Mediumship", "Spiritual Healing", "Relationship Guidance"],
      experienceYears: 12,
      successRate: 92,
      clientsHelped: 350
    },
    {
      _id: "3",
      name: "Luna Rivers",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w-400&h=400&fit=crop",
      specialty: "Numerology & Life Path",
      gender: "female",
      bio: "Luna uses numerology and intuitive guidance to help clients discover their life purpose and overcome obstacles. Her readings are known for their accuracy.",
      rating: {
        avgRating: 4.7,
        totalReviews: 189
      },
      ratePerMin: 1.75,
      experience: "8+ years",
      isVerified: true,
      isAvailable: false,
      isFeatured: true,
      createdAt: "2022-01-10T00:00:00.000Z",
      abilities: ["numerology", "career", "life path", "spiritual"],
      languages: ["English"],
      modalities: ["Numerology", "Life Path Guidance", "Career Counseling"],
      experienceYears: 8,
      successRate: 89,
      clientsHelped: 200
    },
    {
      _id: "4",
      name: "Elena Stardust",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      specialty: "Crystal Healing & Energy Work",
      gender: "female",
      bio: "Specializing in crystal energy and chakra balancing, Elena helps clients restore their spiritual energy and find inner peace.",
      rating: {
        avgRating: 4.8,
        totalReviews: 156
      },
      ratePerMin: 2.25,
      experience: "7+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: false,
      createdAt: "2021-09-05T00:00:00.000Z",
      abilities: ["crystals", "energy", "chakra", "healing"],
      languages: ["English", "Italian"],
      modalities: ["Crystal Healing", "Energy Work", "Chakra Balancing"],
      experienceYears: 7,
      successRate: 91,
      clientsHelped: 180
    },
    {
      _id: "5",
      name: "Orion Night",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      specialty: "Past Life Regression",
      gender: "male",
      bio: "Orion specializes in past life regression and karmic readings, helping clients understand their soul's journey across lifetimes.",
      rating: {
        avgRating: 4.6,
        totalReviews: 134
      },
      ratePerMin: 2.75,
      experience: "10+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: false,
      createdAt: "2019-11-20T00:00:00.000Z",
      abilities: ["past life", "karma", "regression", "soul"],
      languages: ["English", "German"],
      modalities: ["Past Life Regression", "Karmic Readings", "Soul Journey"],
      experienceYears: 10,
      successRate: 88,
      clientsHelped: 150
    },
    {
      _id: "6",
      name: "Aurora Celeste",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop",
      specialty: "Divine Feminine & Moon Magic",
      gender: "female",
      bio: "Aurora focuses on divine feminine energy, moon cycles, and ritual magic to empower clients in their spiritual journey.",
      rating: {
        avgRating: 4.9,
        totalReviews: 210
      },
      ratePerMin: 3.25,
      experience: "9+ years",
      isVerified: true,
      isAvailable: false,
      isFeatured: true,
      createdAt: "2020-05-12T00:00:00.000Z",
      abilities: ["moon", "feminine", "rituals", "empowerment"],
      languages: ["English", "Portuguese"],
      modalities: ["Moon Magic", "Divine Feminine", "Ritual Guidance"],
      experienceYears: 9,
      successRate: 94,
      clientsHelped: 220
    },
    {
      _id: "7",
      name: "Caspian Waters",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      specialty: "Water Divination & Emotion Healing",
      gender: "male",
      bio: "Using water scrying and emotion-based readings, Caspian helps clients navigate emotional waters and find emotional clarity.",
      rating: {
        avgRating: 4.7,
        totalReviews: 98
      },
      ratePerMin: 2.00,
      experience: "6+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: false,
      createdAt: "2022-03-18T00:00:00.000Z",
      abilities: ["water", "emotions", "scrying", "healing"],
      languages: ["English", "Japanese"],
      modalities: ["Water Divination", "Emotion Healing", "Scrying"],
      experienceYears: 6,
      successRate: 87,
      clientsHelped: 120
    },
    {
      _id: "8",
      name: "Phoenix Flame",
      image: "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=400&h=400&fit=crop",
      specialty: "Transformation & Rebirth",
      gender: "non-binary",
      bio: "Phoenix specializes in transformation readings, helping clients navigate major life changes and rebirth moments with grace.",
      rating: {
        avgRating: 4.8,
        totalReviews: 167
      },
      ratePerMin: 2.50,
      experience: "11+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: true,
      createdAt: "2018-08-30T00:00:00.000Z",
      abilities: ["transformation", "rebirth", "change", "guidance"],
      languages: ["English", "Spanish", "French"],
      modalities: ["Transformation Readings", "Rebirth Guidance", "Life Change Support"],
      experienceYears: 11,
      successRate: 93,
      clientsHelped: 190
    },
    {
      _id: "9",
      name: "Sage Whisper",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      specialty: "Plant Spirit Communication",
      gender: "female",
      bio: "Sage communicates with plant spirits and uses herbal wisdom to provide grounded, earth-connected spiritual guidance.",
      rating: {
        avgRating: 4.5,
        totalReviews: 89
      },
      ratePerMin: 1.50,
      experience: "5+ years",
      isVerified: true,
      isAvailable: true,
      isFeatured: false,
      createdAt: "2022-06-14T00:00:00.000Z",
      abilities: ["plants", "herbs", "earth", "grounding"],
      languages: ["English"],
      modalities: ["Plant Spirit Communication", "Herbal Wisdom", "Earth Connection"],
      experienceYears: 5,
      successRate: 85,
      clientsHelped: 110
    }
  ];

  // Fetch psychics data (using static data for demo)
  useEffect(() => {
    const fetchPsychics = async () => {
      setIsLoading(true);
      try {
        // For demo, use static data
        setTimeout(() => {
          const psychicsData = staticPsychicProfiles.map(p => ({
            ...p,
            isHuman: true,
            isAvailable: p.isAvailable !== undefined ? p.isAvailable : Math.random() > 0.3,
            languages: p.languages || ["English"],
            modalities: p.modalities || [p.specialty || "Psychic Reading"],
            experienceYears: p.experienceYears || parseInt(p.experience) || 3,
            successRate: p.successRate || Math.floor(Math.random() * 10) + 85,
            clientsHelped: p.clientsHelped || Math.floor(Math.random() * 400) + 100
          }));
          
          setPsychics(psychicsData);
          setFilteredPsychics(psychicsData);
          
          // Set initial displayed psychics
          const initialDisplay = psychicsData.slice(0, itemsPerPage);
          setDisplayedPsychics(initialDisplay);
          setHasMore(psychicsData.length > itemsPerPage);
          
          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error("Error fetching psychics:", error);
        toast.error("Failed to load psychics. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchPsychics();
  }, []);

  // Filter and sort psychics
  useEffect(() => {
    let result = [...psychics];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(psychic =>
        psychic.name.toLowerCase().includes(query) ||
        psychic.bio?.toLowerCase().includes(query) ||
        psychic.specialty?.toLowerCase().includes(query) ||
        psychic.modalities?.some(m => m.toLowerCase().includes(query))
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0 && !selectedCategories.includes("all")) {
      result = result.filter(psychic =>
        selectedCategories.some(category =>
          psychic.specialty?.toLowerCase().includes(category) ||
          psychic.modalities?.some(m => m.toLowerCase().includes(category))
        )
      );
    }

    // Filter by availability
    if (availableOnly) {
      result = result.filter(psychic => psychic.isAvailable);
    }

    // Filter by price range
    result = result.filter(psychic =>
      psychic.ratePerMin >= priceRange[0] && psychic.ratePerMin <= priceRange[1]
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
          comparison = a.name.localeCompare(b.name);
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
  }, [psychics, searchQuery, selectedCategories, sortBy, sortOrder, availableOnly, priceRange, experienceRange]);

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
        const newSelection = prev.includes("all") ? [] : [...prev];
        if (newSelection.includes(categoryId)) {
          return newSelection.filter(id => id !== categoryId);
        } else {
          return [...newSelection, categoryId];
        }
      });
    }
  };

  // Handle psychic selection (chat/call)
  const handlePsychicSelect = async (psychic, type = "chat") => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      setTimeout(() => {
        navigate(`/message/${psychic._id}`);
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error initiating chat");
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2"
                    style={{ borderColor: colors.antiqueGold, color: colors.deepPurple }}>
                    {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                    Sort: {sortOptions.find(o => o.id === sortBy)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent style={{ backgroundColor: colors.softIvory, borderColor: colors.lightGold }}>
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.id}
                      checked={sortBy === option.id}
                      onCheckedChange={() => setSortBy(option.id)}
                      style={{ color: colors.deepPurple }}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                      className="w-full"
                      style={{ borderColor: colors.antiqueGold, color: colors.deepPurple }}
                    >
                      {sortOrder === "desc" ? "Ascending" : "Descending"}
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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
              {(searchQuery || selectedCategories.length > 0 || availableOnly) && (
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

          {/* Categories Filter */}
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                  onClick={() => toggleCategory(category.id)}
                  className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: selectedCategories.includes(category.id) 
                      ? colors.antiqueGold 
                      : colors.softIvory,
                    color: selectedCategories.includes(category.id) 
                      ? colors.deepPurple 
                      : colors.deepPurple + "CC",
                    borderColor: colors.lightGold,
                    whiteSpace: "nowrap"
                  }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                  {selectedCategories.includes(category.id) && (
                    <Check className="ml-2 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
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
                {psychics.filter(p => p.isAvailable).length}
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
                {displayedPsychics.map((psychic, index) => (
                  <motion.div
                    key={psychic._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="relative group"
                  >
                    {/* Psychic Card - Similar to Home Page */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.antiqueGold}, ${colors.deepPurple})`,
                        transform: "translateY(10px) scale(1.02)"
                      }}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                      style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                      
                      {/* Status & Verification Badge */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                        {/* Online Status */}
                        <Badge className="px-3 py-1 rounded-full flex items-center gap-1"
                          style={{ 
                            backgroundColor: psychic.isAvailable ? colors.antiqueGold : "#94a3b8",
                            color: psychic.isAvailable ? colors.deepPurple : "white"
                          }}>
                          <div className={`w-2 h-2 rounded-full ${psychic.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-xs font-medium">
                            {psychic.isAvailable ? "Available" : "Away"}
                          </span>
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
                            <p className="text-sm text-white/90">{psychic.specialty || "Psychic Reader"}</p>
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
                              {renderStars(psychic.rating?.avgRating || 4.5)}
                            </div>
                            <span className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                              {psychic.rating?.avgRating?.toFixed(1) || "4.5"}
                              <span className="text-xs ml-1">({psychic.rating?.totalReviews || "100+"})</span>
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
                          <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                            {psychic.bio || "Experienced psychic with compassionate approach..."}
                          </p>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                            <Clock className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                            <div>
                              <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Response</div>
                              <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>Instant</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                            <Users className="h-3 w-3" style={{ color: colors.antiqueGold }} />
                            <div>
                              <div className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Experience</div>
                              <div className="text-sm font-medium" style={{ color: colors.deepPurple }}>
                                {psychic.experienceYears || "3+"} years
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handlePsychicSelect(psychic, 'chat')}
                              disabled={isSubmitting || !psychic.isAvailable}
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
                              onClick={() => handlePsychicSelect(psychic, 'call')}
                              disabled={isSubmitting || !psychic.isAvailable}
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
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2 text-sm" style={{ color: colors.deepPurple }}>
                                  Specialties
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {psychic.modalities?.map((modality, idx) => (
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
                ))}
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
                      Load 3 More Psychics
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
                icon: <Shield />,
                title: "Rigorous Vetting",
                description: "Every psychic undergoes extensive screening, testing, and background checks."
              },
              {
                icon: <Heart />,
                title: "Empathetic Approach",
                description: "Our psychics provide compassionate guidance in a judgment-free space."
              },
              {
                icon: <Award />,
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