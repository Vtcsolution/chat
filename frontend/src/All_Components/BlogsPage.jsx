import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  X,
  Heart,
  MessageCircle,
  User,
  ArrowRight,
  AlertCircle,
  Grid3x3,
  LayoutList,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const colors = {
  primary: "#2B1B3F",
  secondary: "#C9A24D",
  accent: "#9B7EDE",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#F5F3EB",
  cardBg: "#FFFFFF",
  text: "#1F2937",
  lightText: "#6B7280",
  border: "#E5E7EB",
};

const categories = [
  { id: "all", name: "All Categories", icon: "", color: "#6B7280" },
  { id: "tarto", name: "Tarot", icon: "", color: "#9B7EDE" },
  { id: "love", name: "Love", icon: "", color: "#EF4444" },
  { id: "reading", name: "Readings", icon: "", color: "#10B981" },
  { id: "family", name: "Family", icon: "", color: "#F59E0B" },
  { id: "career", name: "Career", icon: "", color: "#3B82F6" },
  { id: "health", name: "Health", icon: "", color: "#10B981" },
  { id: "spirituality", name: "Spirituality", icon: "", color: "#8B5CF6" },
  { id: "dreams", name: "Dreams", icon: "", color: "#6366F1" },
  { id: "numerology", name: "Numerology", icon: "", color: "#EC4899" },
  { id: "astrology", name: "Astrology", icon: "", color: "#F59E0B" },
];

const sortOptions = [
  { value: "createdAt", label: "Newest First", icon: "" },
  { value: "views", label: "Most Viewed", icon: "" },
  { value: "likes", label: "Most Liked", icon: "" },
  { value: "readingTime", label: "Shortest Read", icon: "" },
];

const BlogsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 1
  });
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [error, setError] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch blogs when dependencies change
  useEffect(() => {
    if (!initialLoading) {
      fetchBlogs();
    }
  }, [category, sortBy, pagination.page, search]);

  // Initial fetch
  useEffect(() => {
    fetchBlogs(true);
  }, []);

  const fetchBlogs = async (isInitial = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const url = `${import.meta.env.VITE_BASE_URL}/api/blogs?${params.toString()}`;
      console.log("📡 Fetching blogs...");

      const response = await axios.get(url);

      if (response.data.success) {
        const fetchedBlogs = response.data.data || [];
        setBlogs(fetchedBlogs);
        
        // Set featured blog only on first page and initial load
        if (isInitial && fetchedBlogs.length > 0) {
          setFeaturedBlog(fetchedBlogs[0]);
        }
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }

    } catch (error) {
      console.error("❌ Error fetching blogs:", error);
      setError("Failed to load blogs. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load blogs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      if (isInitial) {
        setInitialLoading(false);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategory('all');
    setSortBy('createdAt');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  // Loading skeleton for blog cards
  const BlogCardSkeleton = () => (
    <Card className="border-none shadow-lg overflow-hidden rounded-2xl">
      <Skeleton className="h-56 w-full" />
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Hero Section - Updated to match Contact page style */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white"
            >
              Spiritual Insights
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg mb-8 text-white/90"
            >
              Discover ancient wisdom and practical guidance for your spiritual journey
            </motion.p>
            
            {/* Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSearchSubmit} 
              className="max-w-xl mx-auto"
            >
              <div className="flex gap-2 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 h-11 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-lg text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="default"
                  className="h-11 px-5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.primary }}
                >
                  Search
                </Button>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill={colors.background} fillOpacity="1" d="M0,64L48,74.7C96,85,192,107,288,106.7C384,107,480,85,576,74.7C672,64,768,64,864,74.7C960,85,1056,107,1152,106.7C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content - Updated to max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Blog */}
        {featuredBlog && pagination.page === 1 && !search && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <Sparkles className="h-5 w-5" style={{ color: colors.secondary }} />
              Featured Article
            </h2>
            
            <Card 
              className="border-none shadow-xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 rounded-2xl"
              onClick={() => navigate(`/blog/${featuredBlog._id}`)}
            >
              <div className="grid md:grid-cols-2">
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <img
                    src={featuredBlog.featuredImage || '/api/placeholder/400/320'}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/320';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                </div>
                
                <div className="p-6 flex flex-col justify-center" style={{ backgroundColor: colors.cardBg }}>
                  <Badge 
                    className="mb-3 w-fit rounded-full"
                    style={{ 
                      backgroundColor: getCategoryInfo(featuredBlog.category).color + '15',
                      color: getCategoryInfo(featuredBlog.category).color,
                      border: 'none'
                    }}
                  >
                    {getCategoryInfo(featuredBlog.category).icon} {getCategoryInfo(featuredBlog.category).name}
                  </Badge>
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#C9A24D] transition-colors">
                    {featuredBlog.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {featuredBlog.excerpt || featuredBlog.content?.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(featuredBlog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {featuredBlog.readingTime || 5} min
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 text-xs rounded-full"
                      style={{ color: colors.secondary }}
                    >
                      Read More <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filters Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold" style={{ color: colors.primary }}>
                {search ? `Search Results for "${search}"` : 'All Articles'}
              </h2>
              <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                {pagination.total}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* View Toggle */}
              <div className="flex items-center border rounded-full overflow-hidden mr-2" style={{ borderColor: colors.border }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-none ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-none ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden rounded-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px] h-9 text-sm rounded-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-sm">
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-9 text-sm rounded-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(search || category !== 'all' || sortBy !== 'createdAt') && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-4"
              >
                <Card className="p-4 rounded-2xl">
                  <div className="space-y-3">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={clearFilters} variant="outline" className="w-full rounded-full">
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-none shadow-lg rounded-2xl" style={{ backgroundColor: colors.danger + '10' }}>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: colors.danger }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.danger }}>Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => fetchBlogs()} className="rounded-full" style={{ backgroundColor: colors.danger, color: 'white' }}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Blogs Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {[...Array(6)].map((_, i) => (
              viewMode === 'grid' ? <BlogCardSkeleton key={i} /> : (
                <Card key={i} className="border-none shadow-lg overflow-hidden rounded-2xl">
                  <div className="flex flex-col md:flex-row">
                    <Skeleton className="h-48 md:h-32 md:w-48" />
                    <CardContent className="flex-1 p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </div>
                </Card>
              )
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <motion.div 
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {blogs.map((blog, index) => {
                const categoryInfo = getCategoryInfo(blog.category);
                
                if (viewMode === 'list') {
                  return (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className="group border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl"
                        style={{ backgroundColor: colors.cardBg }}
                        onClick={() => navigate(`/blog/${blog._id}`)}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="relative h-48 md:h-auto md:w-48 overflow-hidden">
                            <img
                              src={blog.featuredImage || '/api/placeholder/400/320'}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/400/320';
                              }}
                            />
                            <Badge 
                              className="absolute top-2 left-2 md:hidden rounded-full"
                              style={{ 
                                backgroundColor: categoryInfo.color,
                                color: 'white',
                              }}
                            >
                              {categoryInfo.icon}
                            </Badge>
                          </div>
                          
                          <CardContent className="flex-1 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                className="hidden md:inline-flex rounded-full"
                                style={{ 
                                  backgroundColor: categoryInfo.color + '15',
                                  color: categoryInfo.color,
                                  border: 'none'
                                }}
                              >
                                {categoryInfo.icon} {categoryInfo.name}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(blog.createdAt)}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#C9A24D] transition-colors line-clamp-1">
                              {blog.title}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {blog.excerpt || blog.content?.substring(0, 120) + '...'}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {blog.authorName || 'Anonymous'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {blog.views || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {blog.likes || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {blog.readingTime || 5} min
                                </span>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-all text-xs rounded-full"
                                style={{ color: colors.secondary }}
                              >
                                Read <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className="group border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col rounded-2xl"
                      style={{ backgroundColor: colors.cardBg }}
                      onClick={() => navigate(`/blog/${blog._id}`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.featuredImage || '/api/placeholder/400/320'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/400/320';
                          }}
                        />
                        
                        <div className="absolute top-3 left-3">
                          <Badge 
                            className="shadow-md rounded-full"
                            style={{ 
                              backgroundColor: categoryInfo.color,
                              color: 'white',
                            }}
                          >
                            {categoryInfo.icon} {categoryInfo.name}
                          </Badge>
                        </div>

                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-md text-xs rounded-full">
                            <Clock className="h-3 w-3 mr-1" />
                            {blog.readingTime || 5} min
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-[#C9A24D] transition-colors">
                          {blog.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                          {blog.excerpt || blog.content?.substring(0, 100) + '...'}
                        </p>

                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                              <User className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{blog.authorName || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Eye className="h-3 w-3" />
                                {blog.views || 0}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <Heart className="h-3 w-3" />
                                {blog.likes || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: colors.border }}>
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(blog.createdAt)}
                            </span>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all h-7 px-2 text-xs rounded-full"
                              style={{ color: colors.secondary }}
                            >
                              Read More <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="min-w-[80px] rounded-full"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (pagination.pages > 5) {
                      if (pagination.page > 3) {
                        pageNum = pagination.page - 3 + i;
                      }
                    }
                    
                    if (pageNum <= pagination.pages) {
                      return (
                        <Button
                          key={i}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          style={pagination.page === pageNum ? { backgroundColor: colors.secondary, color: colors.primary } : {}}
                          className="w-8 h-8 p-0 rounded-full"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="min-w-[80px] rounded-full"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-lg rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>No articles found</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                  {search || category !== 'all' 
                    ? "We couldn't find any articles matching your criteria."
                    : "Check back soon for new articles!"}
                </p>
                {(search || category !== 'all') && (
                  <Button 
                    onClick={clearFilters}
                    size="sm"
                    className="rounded-full"
                    style={{ backgroundColor: colors.secondary, color: colors.primary }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;