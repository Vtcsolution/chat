import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
  Mail,
  Send,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
  Reply,
  MoreHorizontal,
  AlertCircle,
  Quote,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from 'framer-motion';
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

const categories = {
  tarto: { name: "Tarot", color: "#9B7EDE" },
  love: { name: "Love", color: "#EF4444" },
  reading: { name: "Readings", color: "#10B981" },
  family: { name: "Family", color: "#F59E0B" },
  career: { name: "Career", color: "#3B82F6" },
  health: { name: "Health", color: "#10B981" },
  spirituality: { name: "Spirituality", color: "#8B5CF6" },
  dreams: { name: "Dreams", color: "#6366F1" },
  numerology: { name: "Numerology", color: "#EC4899" },
  astrology: { name: "Astrology", color: "#F59E0B" },
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentPagination, setCommentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Comment form state
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyForm, setReplyForm] = useState({
    name: '',
    email: '',
    comment: '',
  });
  
  // Like states
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  
  // Share state
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Reading progress
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (blog) {
      fetchComments();
    }
  }, [blog, commentPagination.page]);

  // Reading progress tracker
  useEffect(() => {
    const updateReadingProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setReadingProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`
      );

      if (response.data.success) {
        setBlog(response.data.data);
        setLikes(response.data.data.likes || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching blog:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      });
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;
    
    try {
      setCommentsLoading(true);
      console.log("📥 Fetching comments for blog:", blog._id);
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${blog._id}/comments?page=${commentPagination.page}&limit=${commentPagination.limit}`
      );

      console.log("📦 Comments response:", response.data);

      if (response.data.success) {
        setComments(response.data.data);
        setCommentPagination(response.data.pagination);
        console.log("✅ Comments loaded:", response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const checkComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/debug/comments/all`
      );
      console.log("🔍 All comments in database:", response.data);
    } catch (error) {
      console.error("❌ Error checking comments:", error);
    }
  };

  useEffect(() => {
    if (blog) {
      fetchComments();
      checkComments();
    }
  }, [blog, commentPagination.page]);

  const handleLike = async () => {
    if (liked) return;
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${blog._id}/like`
      );
      
      if (response.data.success) {
        setLikes(response.data.likes);
        setLiked(true);
        toast({
          title: "Thanks!",
          description: "You liked this post",
        });
      }
    } catch (error) {
      console.error('❌ Error liking blog:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!commentForm.email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingComment(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${blog._id}/comments`,
        commentForm
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your comment has been submitted for approval",
        });
        
        setCommentForm({ name: '', email: '', comment: '' });
        fetchComments();
      }
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit comment",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyForm.name.trim() || !replyForm.email.trim() || !replyForm.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${blog._id}/comments`,
        {
          ...replyForm,
          parentComment: parentCommentId
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your reply has been submitted for approval",
        });
        
        setReplyingTo(null);
        setReplyForm({ name: '', email: '', comment: '' });
        fetchComments();
      }
    } catch (error) {
      console.error('❌ Error submitting reply:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit reply",
        variant: "destructive"
      });
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog.title;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
    setShowShareMenu(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mt-8 mb-4" style={{ color: colors.primary }}>{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-3xl font-semibold mt-6 mb-3" style={{ color: colors.primary }}>{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-medium mt-5 mb-2" style={{ color: colors.primary }}>{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc mb-1">{line.substring(2)}</li>;
      } else if (line.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 pl-4 py-2 my-4 italic" style={{ borderColor: colors.secondary, backgroundColor: colors.background }}>
            {line.substring(2)}
          </blockquote>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-4 leading-relaxed text-gray-700">{line}</p>;
      }
    });
  };

  const CommentComponent = ({ comment, isReply = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 mt-4' : 'mb-6'}`}
    >
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 ring-2 ring-white">
          <AvatarFallback style={{ backgroundColor: colors.secondary + '20', color: colors.secondary }}>
            {comment.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: colors.primary }}>{comment.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="text-xs"
                  style={{ color: colors.secondary }}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
            <p className="text-gray-700">{comment.comment}</p>
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl" 
              style={{ backgroundColor: colors.background }}
            >
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                <Reply className="h-4 w-4" />
                Reply to {comment.name}
              </h4>
              <div className="space-y-3">
                <Input
                  placeholder="Your Name *"
                  value={replyForm.name}
                  onChange={(e) => setReplyForm({ ...replyForm, name: e.target.value })}
                  className="bg-white"
                />
                <Input
                  type="email"
                  placeholder="Your Email *"
                  value={replyForm.email}
                  onChange={(e) => setReplyForm({ ...replyForm, email: e.target.value })}
                  className="bg-white"
                />
                <Textarea
                  placeholder="Your Reply *"
                  value={replyForm.comment}
                  onChange={(e) => setReplyForm({ ...replyForm, comment: e.target.value })}
                  className="bg-white min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment._id)}
                    style={{ backgroundColor: colors.secondary, color: colors.primary }}
                  >
                    <Send className="h-3 w-3 mr-2" />
                    Submit Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Replies */}
          {!isReply && comment.replies?.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => (
                <CommentComponent key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: colors.secondary }} />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Card className="w-96 border-none shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>Blog Not Found</h2>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/blogs')} style={{ backgroundColor: colors.secondary, color: colors.primary }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryInfo = categories[blog.category] || { name: blog.category, color: colors.accent };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-300"
        style={{ 
          width: `${readingProgress}%`,
          backgroundColor: colors.secondary,
          boxShadow: `0 0 10px ${colors.secondary}`
        }}
      />

      {/* Back Button - Fixed Position */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/blogs')}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blogs
      </Button>

      {/* Main Container - Updated to match Contact page width structure */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Image - Full width card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-none shadow-xl overflow-hidden rounded-2xl">
            <div className="relative h-[400px] md:h-[500px] w-full">
              <img
                src={blog.featuredImage || '/api/placeholder/1200/600'}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/1200/600';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Title Overlay on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 text-white">
                <div className="max-w-3xl">
                  <Breadcrumb className="mb-3">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/blogs" className="text-white/80 hover:text-white">Blogs</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="text-white/60" />
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`/blogs?category=${blog.category}`} className="text-white/80 hover:text-white">
                          {categoryInfo.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <Badge 
                    className="mb-3"
                    style={{ 
                      backgroundColor: categoryInfo.color,
                      color: 'white',
                    }}
                  >
                    {categoryInfo.name}
                  </Badge>
                  
                  <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-4 leading-tight">
                    {blog.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-2 ring-white">
                        <AvatarFallback style={{ backgroundColor: colors.secondary }}>
                          {blog.authorName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{blog.authorName}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-white/80">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.readingTime} min read
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.views} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Engagement Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white rounded-xl p-3 shadow-md"
        >
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleLike}
                    disabled={liked}
                    className={`gap-2 transition-all ${liked ? 'bg-red-50 border-red-200' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="font-medium">{likes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{liked ? 'You liked this' : 'Like this post'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2"
                    onClick={() => {
                      document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{commentPagination.total}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View comments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="default"
              className="gap-2"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {showShareMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border p-2 z-50 min-w-[200px]"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4 text-sky-500" />
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-none shadow-xl mb-8 overflow-hidden rounded-2xl">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="prose prose-lg max-w-none">
                {renderContent(blog.content)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <Tag className="h-5 w-5" />
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-white transition-all hover:scale-105"
                  style={{ borderColor: colors.secondary, color: colors.primary }}
                  onClick={() => navigate(`/blogs?search=${tag}`)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          id="comments"
        >
          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
              <MessageCircle className="h-6 w-6" style={{ color: colors.secondary }} />
              Discussion ({commentPagination.total})
            </h2>
            <p className="text-gray-600 text-sm">
              Join the conversation and share your thoughts
            </p>
          </div>

          {/* Comment Form */}
          {blog.allowComments && (
            <Card className="border-none shadow-lg mb-8 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
                  Leave a Comment
                </h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1" style={{ color: colors.primary }}>
                        <User className="h-4 w-4" />
                        Name *
                      </label>
                      <Input
                        placeholder="Your name"
                        value={commentForm.name}
                        onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1" style={{ color: colors.primary }}>
                        <Mail className="h-4 w-4" />
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={commentForm.email}
                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1" style={{ color: colors.primary }}>
                      <MessageCircle className="h-4 w-4" />
                      Comment *
                    </label>
                    <Textarea
                      placeholder="Share your thoughts..."
                      rows={4}
                      value={commentForm.comment}
                      onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingComment}
                    size="default"
                    className="w-full md:w-auto rounded-full"
                    style={{ backgroundColor: colors.secondary, color: colors.primary }}
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: colors.secondary }} />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <CommentComponent key={comment._id} comment={comment} />
              ))}

              {/* Comment Pagination */}
              {commentPagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={commentPagination.page === 1}
                    onClick={() => setCommentPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm bg-white rounded-full border">
                    Page {commentPagination.page} of {commentPagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={commentPagination.page === commentPagination.pages}
                    onClick={() => setCommentPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-none shadow-lg rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>No comments yet</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Be the first to share your thoughts on this article!
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Back to Top Button */}
      {readingProgress > 30 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
          style={{ backgroundColor: colors.secondary, color: colors.primary }}
        >
          <ChevronLeft className="h-5 w-5 rotate-90" />
        </motion.button>
      )}
    </div>
  );
};

export default BlogDetail;