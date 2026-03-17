import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  BookOpen,
  Globe,
  Award,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Image,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  Layers,
  Upload,
  X,
  Tag,
  FileText,
  EyeOff,
  Star,
  MessageCircle,
  Hash,
  Info,
  Settings,
  Save,
  Plus,
  Trash2,
  Link,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Dashboard_Navbar from "../Admin_Navbar";
import Doctor_Side_Bar from "../SideBar";
import { Label } from "@/components/ui/label";
import axios from 'axios';

// Color scheme matching psychic dashboard
const colors = {
  primary: "#2B1B3F",      // Deep purple
  secondary: "#C9A24D",    // Antique gold
  accent: "#9B7EDE",       // Light purple
  bgLight: "#3A2B4F",      // Lighter purple
  textLight: "#E8D9B0",    // Light gold text
  success: "#10B981",      // Green
  warning: "#F59E0B",      // Yellow
  danger: "#EF4444",       // Red
  background: "#F5F3EB",   // Soft ivory
};

// Psychic categories from the blog model
const blogCategories = [
  { id: "tarto", name: "Tarto", description: "Tarot readings and interpretations" },
  { id: "love", name: "Love", description: "Love and relationship guidance" },
  { id: "reading", name: "Reading", description: "Psychic readings and insights" },
  { id: "family", name: "Family", description: "Family dynamics and relationships" },
  { id: "career", name: "Career", description: "Career guidance and professional development" },
  { id: "health", name: "Health", description: "Health and wellness insights" },
  { id: "spirituality", name: "Spirituality", description: "Spiritual growth and enlightenment" },
  { id: "dreams", name: "Dreams", description: "Dream interpretation and meaning" },
  { id: "numerology", name: "Numerology", description: "Numbers and their spiritual significance" },
  { id: "astrology", name: "Astrology", description: "Astrological insights and horoscopes" },
];

// Simple formatting buttons
const formattingButtons = [
  { icon: 'B', label: 'Bold', tag: 'strong' },
  { icon: 'I', label: 'Italic', tag: 'em' },
  { icon: 'U', label: 'Underline', tag: 'u' },
  { icon: 'H1', label: 'Heading 1', tag: 'h1' },
  { icon: 'H2', label: 'Heading 2', tag: 'h2' },
  { icon: 'P', label: 'Paragraph', tag: 'p' },
];

const AddBlog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [side, setSide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [errors, setErrors] = useState({});
  
  // Image states
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Additional images
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isPublished: false,
    isFeatured: false,
    allowComments: true,
    authorName: "Admin",
  });

  // Get admin info from localStorage or context
  useEffect(() => {
    const adminName = localStorage.getItem('adminName') || 'Admin';
    setFormData(prev => ({ ...prev, authorName: adminName }));
  }, []);

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default");
    
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dovyqaltq/image/upload", {
        method: "POST",
        body: data,
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Upload failed");
      return json.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw error;
    }
  };

  // Handle featured image selection
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, GIF)",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setFeaturedImageFile(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, featuredImage: "" }));
    }
  };

  // Handle additional images
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not an image`,
            variant: "destructive"
          });
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 5MB`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setAdditionalImages(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(additionalImagePreviews[index]);
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle featured image URL change
  const handleFeaturedImageUrlChange = (value) => {
    setFormData(prev => ({ ...prev, featuredImage: value }));
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
  };

  // Remove featured image
  const removeFeaturedImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setFormData(prev => ({ ...prev, featuredImage: '' }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Apply formatting to content
  const applyFormatting = (tag) => {
    const textarea = document.getElementById('content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    let formattedText = '';
    switch(tag) {
      case 'strong':
        formattedText = `**${selectedText}**`;
        break;
      case 'em':
        formattedText = `*${selectedText}*`;
        break;
      case 'u':
        formattedText = `_${selectedText}_`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'p':
        formattedText = `${selectedText}\n\n`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = formData.content.substring(0, start) + formattedText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  // Auto-generate excerpt from content
  const generateExcerpt = () => {
    if (formData.content && !formData.excerpt) {
      const text = formData.content.replace(/[*#_]/g, '');
      const excerpt = text.substring(0, 150) + (text.length > 150 ? '...' : '');
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  // Auto-generate meta title from blog title
  const generateMetaTitle = () => {
    if (formData.title && !formData.metaTitle) {
      setFormData(prev => ({ ...prev, metaTitle: formData.title.substring(0, 60) }));
    }
  };

  // Auto-generate meta description from excerpt
  const generateMetaDescription = () => {
    if (formData.excerpt && !formData.metaDescription) {
      setFormData(prev => ({ ...prev, metaDescription: formData.excerpt.substring(0, 160) }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else {
      const textContent = formData.content.replace(/[*#_]/g, '');
      if (textContent.length < 50) {
        newErrors.content = "Content must be at least 50 characters";
      }
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = "Excerpt cannot exceed 500 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!featuredImageFile && !formData.featuredImage) {
      newErrors.featuredImage = "Featured image is required";
    } else if (formData.featuredImage && !formData.featuredImage.startsWith('http')) {
      newErrors.featuredImage = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      if (errors.title || errors.content || errors.excerpt || errors.category) {
        setActiveTab("content");
      } else if (errors.featuredImage) {
        setActiveTab("media");
      }
      return;
    }

    try {
      setLoading(true);
      let finalFeaturedImageUrl = formData.featuredImage;
      let finalAdditionalImageUrls = [];
      
      if (featuredImageFile) {
        setIsUploadingImage(true);
        toast({
          title: "Uploading Featured Image",
          description: "Please wait while we upload the featured image...",
        });
        
        try {
          finalFeaturedImageUrl = await uploadToCloudinary(featuredImageFile);
          setIsUploadingImage(false);
          toast({
            title: "Featured Image Uploaded",
            description: "Featured image uploaded successfully",
          });
        } catch (uploadError) {
          setIsUploadingImage(false);
          toast({
            title: "Image Upload Failed",
            description: uploadError.message || "Failed to upload featured image",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      if (additionalImages.length > 0) {
        setUploadingAdditional(true);
        toast({
          title: "Uploading Additional Images",
          description: `Uploading ${additionalImages.length} images...`,
        });

        try {
          for (const image of additionalImages) {
            const url = await uploadToCloudinary(image);
            finalAdditionalImageUrls.push(url);
          }
          setUploadingAdditional(false);
        } catch (uploadError) {
          setUploadingAdditional(false);
          toast({
            title: "Additional Images Upload Failed",
            description: "Some images failed to upload. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const payload = {
        title: formData.title.trim(),
        content: formData.content,
        excerpt: formData.excerpt.trim(),
        category: formData.category,
        tags: tagsArray,
        featuredImage: finalFeaturedImageUrl,
        images: finalAdditionalImageUrls,
        metaTitle: formData.metaTitle.trim() || formData.title.substring(0, 60),
        metaDescription: formData.metaDescription.trim() || formData.excerpt.substring(0, 160),
        metaKeywords: formData.metaKeywords.trim(),
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        allowComments: formData.allowComments,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blogs`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Blog "${formData.title}" created successfully`,
        });

        navigate('/admin/dashboard/blogs');
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create blog",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Create blog error:', error);
      
      let errorMessage = "Failed to create blog";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(', ');
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsUploadingImage(false);
      setUploadingAdditional(false);
    }
  };

  // Back to list
  const handleBack = () => {
    navigate('/admin/dashboard/blogs');
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, isPublished: false }));
    await onSubmit(new Event('submit'));
  };

  // Publish now
  const handlePublishNow = async () => {
    setFormData(prev => ({ ...prev, isPublished: true }));
    await onSubmit(new Event('submit'));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Dashboard_Navbar side={side} setSide={setSide} />
      <div className="flex pt-16">
        <Doctor_Side_Bar side={side} setSide={setSide} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 lg:ml-64 transition-all duration-300"> 
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="hover:scale-105 transition-transform duration-200"
                style={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-6 w-6" style={{ color: colors.secondary }} />
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: colors.primary }}>
                    Create New Blog
                  </h1>
                </div>
                <p className="text-sm" style={{ color: colors.primary + '70' }}>
                  Share your psychic insights and knowledge with the community
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex" style={{ backgroundColor: colors.primary + '10' }}>
                <TabsTrigger 
                  value="content" 
                  className="data-[state=active]:bg-white"
                  style={{ color: colors.primary }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className="data-[state=active]:bg-white"
                  style={{ color: colors.primary }}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger 
                  value="seo" 
                  className="data-[state=active]:bg-white"
                  style={{ color: colors.primary }}
                >
                  <Hash className="h-4 w-4 mr-2" />
                  SEO
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-white"
                  style={{ color: colors.primary }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-6">
                {/* Blog Title */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <BookOpen className="h-5 w-5" />
                      Blog Title
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Create an engaging title for your blog post
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Understanding Tarot: A Beginner's Guide"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`text-lg ${errors.title ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.primary + '20' }}
                        maxLength={200}
                      />
                      <div className="flex justify-between">
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                        <p className="text-sm ml-auto" style={{ color: colors.primary + '60' }}>
                          {formData.title.length}/200 characters
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Selection */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Layers className="h-5 w-5" />
                      Category
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Select the most relevant category for your blog
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger 
                        id="category" 
                        className={errors.category ? "border-red-500" : ""}
                        style={{ borderColor: colors.primary + '20' }}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: colors.background }}>
                        {blogCategories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            style={{ color: colors.primary }}
                          >
                            <div className="flex flex-col">
                              <span>{category.name}</span>
                              <span className="text-xs opacity-70">{category.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-2">{errors.category}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Content Editor - Simple Textarea with Formatting */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <FileText className="h-5 w-5" />
                      Blog Content
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Write your blog content using simple text formatting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Simple formatting toolbar */}
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md" style={{ borderColor: colors.primary + '20', backgroundColor: colors.primary + '05' }}>
                        {formattingButtons.map((btn) => (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => applyFormatting(btn.tag)}
                            className="px-3 py-1 text-sm rounded hover:bg-white transition-colors"
                            style={{ color: colors.primary }}
                            title={btn.label}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                      
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Write your blog content here... Use **bold**, *italic*, # Heading 1, ## Heading 2"
                        className={`min-h-[400px] font-mono ${errors.content ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.primary + '20' }}
                        value={formData.content}
                        onChange={handleInputChange}
                      />
                      
                      <div className="text-sm" style={{ color: colors.primary + '60' }}>
                        <p>Formatting tips:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>**text** for bold</li>
                          <li>*text* for italic</li>
                          <li>_text_ for underline</li>
                          <li># text for Heading 1</li>
                          <li>## text for Heading 2</li>
                          <li>Blank line between paragraphs</li>
                        </ul>
                      </div>
                      
                      {errors.content && (
                        <p className="text-sm text-red-500">{errors.content}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Info className="h-5 w-5" />
                      Excerpt
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      A short summary of your blog post (will appear in blog listings)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-end mb-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={generateExcerpt}
                          style={{
                            borderColor: colors.secondary,
                            color: colors.secondary,
                          }}
                        >
                          Auto-generate from content
                        </Button>
                      </div>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        placeholder="Write a brief summary of your blog post..."
                        className={`min-h-[100px] ${errors.excerpt ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.primary + '20' }}
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        maxLength={500}
                      />
                      <div className="flex justify-between">
                        {errors.excerpt && (
                          <p className="text-sm text-red-500">{errors.excerpt}</p>
                        )}
                        <p className="text-sm ml-auto" style={{ color: colors.primary + '60' }}>
                          {formData.excerpt.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Tag className="h-5 w-5" />
                      Tags
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Add relevant tags to help readers find your blog
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="tarot, love, guidance, spirituality (separate with commas)"
                      value={formData.tags}
                      onChange={handleInputChange}
                      style={{ borderColor: colors.primary + '20' }}
                    />
                    <p className="text-sm mt-2" style={{ color: colors.primary + '60' }}>
                      Separate multiple tags with commas
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6 mt-6">
                {/* Featured Image */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Image className="h-5 w-5" />
                      Featured Image
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Upload a featured image for your blog (appears at the top of the post)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Preview with Upload */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="relative w-full max-w-2xl h-64 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
                        style={{ border: `2px solid ${colors.secondary}30` }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        {featuredImagePreview || formData.featuredImage ? (
                          <img
                            src={featuredImagePreview || formData.featuredImage}
                            alt="Featured Preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: colors.primary + '05' }}
                          >
                            <Image className="h-24 w-24" style={{ color: colors.primary + '30' }} />
                          </div>
                        )}
                        
                        {/* Upload Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFeaturedImageChange}
                        />
                      </div>
                      
                      {/* Remove Image Button */}
                      {(featuredImagePreview || formData.featuredImage) && (
                        <button
                          type="button"
                          className="mt-2 text-sm flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                          style={{ 
                            backgroundColor: colors.danger + '10',
                            color: colors.danger
                          }}
                          onClick={removeFeaturedImage}
                        >
                          <X className="h-3 w-3" />
                          Remove Image
                        </button>
                      )}
                      
                      <p className="text-sm mt-3" style={{ color: colors.primary + '70' }}>
                        Click to upload or use URL below
                      </p>
                    </div>

                    {/* Image URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="featuredImage" className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                        <Link className="h-4 w-4" />
                        Image URL (Optional)
                      </Label>
                      <Input
                        id="featuredImage"
                        name="featuredImage"
                        placeholder="https://example.com/image.jpg"
                        value={formData.featuredImage}
                        onChange={(e) => handleFeaturedImageUrlChange(e.target.value)}
                        className={errors.featuredImage ? "border-red-500" : ""}
                        style={{ borderColor: colors.primary + '20' }}
                        disabled={!!featuredImageFile}
                      />
                      {errors.featuredImage && (
                        <p className="text-sm text-red-500">{errors.featuredImage}</p>
                      )}
                      {featuredImageFile && (
                        <p className="text-xs" style={{ color: colors.success }}>
                          File: {featuredImageFile.name} ({(featuredImageFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Images */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Layers className="h-5 w-5" />
                      Additional Images
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Add more images to your blog post (optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Gallery */}
                    {additionalImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {additionalImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="additional-images"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.secondary + '50' }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 mb-2" style={{ color: colors.secondary }} />
                          <p className="text-sm" style={{ color: colors.primary }}>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs" style={{ color: colors.primary + '60' }}>
                            PNG, JPG, GIF (Max 5MB each)
                          </p>
                        </div>
                        <input
                          id="additional-images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleAdditionalImagesChange}
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6 mt-6">
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Hash className="h-5 w-5" />
                      SEO Settings
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Optimize your blog for search engines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Meta Title */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="metaTitle" className="font-medium" style={{ color: colors.primary }}>
                          Meta Title
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={generateMetaTitle}
                          className="text-xs"
                          style={{ color: colors.secondary }}
                        >
                          Use blog title
                        </Button>
                      </div>
                      <Input
                        id="metaTitle"
                        name="metaTitle"
                        placeholder="SEO title (max 60 characters)"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        maxLength={60}
                        style={{ borderColor: colors.primary + '20' }}
                      />
                      <p className="text-sm text-right" style={{ color: colors.primary + '60' }}>
                        {formData.metaTitle.length}/60 characters
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="metaDescription" className="font-medium" style={{ color: colors.primary }}>
                          Meta Description
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={generateMetaDescription}
                          className="text-xs"
                          style={{ color: colors.secondary }}
                        >
                          Use excerpt
                        </Button>
                      </div>
                      <Textarea
                        id="metaDescription"
                        name="metaDescription"
                        placeholder="SEO description (max 160 characters)"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        maxLength={160}
                        style={{ borderColor: colors.primary + '20' }}
                      />
                      <p className="text-sm text-right" style={{ color: colors.primary + '60' }}>
                        {formData.metaDescription.length}/160 characters
                      </p>
                    </div>

                    {/* Meta Keywords */}
                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords" className="font-medium" style={{ color: colors.primary }}>
                        Meta Keywords
                      </Label>
                      <Input
                        id="metaKeywords"
                        name="metaKeywords"
                        placeholder="tarot, love, psychic, reading (separate with commas)"
                        value={formData.metaKeywords}
                        onChange={handleInputChange}
                        style={{ borderColor: colors.primary + '20' }}
                      />
                      <p className="text-sm" style={{ color: colors.primary + '60' }}>
                        Separate keywords with commas
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Preview */}
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                      <Eye className="h-4 w-4" />
                      Google Search Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary + '05' }}>
                      <p className="text-lg text-blue-600 font-medium mb-1">
                        {formData.metaTitle || formData.title || "Blog Title"}
                      </p>
                      <p className="text-sm text-green-700 mb-1">
                        {window.location.origin}/blog/{formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || "blog-slug"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.metaDescription || formData.excerpt || "Blog description will appear here..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card 
                  className="border-none shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Settings className="h-5 w-5" />
                      Blog Settings
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Configure how your blog behaves
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Publishing Status */}
                    <div 
                      className="flex items-center justify-between rounded-lg p-4 transition-all duration-200"
                      style={{ 
                        backgroundColor: colors.secondary + '05',
                        border: `1px solid ${colors.secondary}20`,
                      }}
                    >
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                          {formData.isPublished ? (
                            <Eye className="h-4 w-4" style={{ color: colors.success }} />
                          ) : (
                            <EyeOff className="h-4 w-4" style={{ color: colors.primary + '50' }} />
                          )}
                          Publish Status
                        </Label>
                        <p className="text-sm" style={{ color: colors.primary + '60' }}>
                          {formData.isPublished 
                            ? "Blog is published and visible to everyone" 
                            : "Blog is saved as draft and only visible to admins"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge style={{ 
                          backgroundColor: formData.isPublished ? colors.success + '20' : colors.warning + '20',
                          color: formData.isPublished ? colors.success : colors.warning,
                        }}>
                          {formData.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Switch
                          checked={formData.isPublished}
                          onCheckedChange={(checked) => handleSwitchChange('isPublished', checked)}
                          style={{
                            backgroundColor: formData.isPublished ? colors.secondary : colors.primary + '20',
                          }}
                        />
                      </div>
                    </div>

                    {/* Featured Status */}
                    <div 
                      className="flex items-center justify-between rounded-lg p-4 transition-all duration-200"
                      style={{ 
                        backgroundColor: colors.accent + '05',
                        border: `1px solid ${colors.accent}20`,
                      }}
                    >
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                          <Star className="h-4 w-4" style={{ color: formData.isFeatured ? colors.warning : colors.primary + '50' }} />
                          Featured Blog
                        </Label>
                        <p className="text-sm" style={{ color: colors.primary + '60' }}>
                          {formData.isFeatured 
                            ? "Blog will appear in featured section" 
                            : "Blog will not be featured"}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                        style={{
                          backgroundColor: formData.isFeatured ? colors.warning : colors.primary + '20',
                        }}
                      />
                    </div>

                    {/* Comments Settings */}
                    <div 
                      className="flex items-center justify-between rounded-lg p-4 transition-all duration-200"
                      style={{ 
                        backgroundColor: colors.success + '05',
                        border: `1px solid ${colors.success}20`,
                      }}
                    >
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                          <MessageCircle className="h-4 w-4" style={{ color: formData.allowComments ? colors.success : colors.primary + '50' }} />
                          Allow Comments
                        </Label>
                        <p className="text-sm" style={{ color: colors.primary + '60' }}>
                          {formData.allowComments 
                            ? "Visitors can comment on this blog" 
                            : "Comments are disabled"}
                        </p>
                      </div>
                      <Switch
                        checked={formData.allowComments}
                        onCheckedChange={(checked) => handleSwitchChange('allowComments', checked)}
                        style={{
                          backgroundColor: formData.allowComments ? colors.success : colors.primary + '20',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <Card 
              className="border-none shadow-lg mt-6"
              style={{ 
                background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
              }}
            >
              <CardFooter className="flex justify-between px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading || isUploadingImage || uploadingAdditional}
                  className="hover:scale-105 transition-transform duration-200"
                  style={{
                    borderColor: colors.primary + '20',
                    color: colors.primary,
                  }}
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={loading || isUploadingImage || uploadingAdditional}
                    className="hover:scale-105 transition-transform duration-200"
                    style={{
                      borderColor: colors.primary + '20',
                      color: colors.primary,
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublishNow}
                    disabled={loading || isUploadingImage || uploadingAdditional}
                    className="hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                    }}
                  >
                    {loading || isUploadingImage || uploadingAdditional ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isUploadingImage ? "Uploading Image..." : uploadingAdditional ? "Uploading Images..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {formData.isPublished ? "Publish Now" : "Publish Blog"}
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>

          {/* Writing Tips */}
          <Card 
            className="mt-6 border-none shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)`,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: colors.primary }}>
                <Sparkles className="h-4 w-4" />
                Blog Writing Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm" style={{ color: colors.primary + '80' }}>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: colors.success }} />
                  <span>Use engaging titles that capture attention (60-70 characters recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: colors.success }} />
                  <span>Add a compelling featured image that represents your content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: colors.success }} />
                  <span>Write a concise excerpt (150-160 characters) for search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: colors.success }} />
                  <span>Use relevant tags to improve discoverability (3-5 tags recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: colors.success }} />
                  <span>Save as draft to continue editing later, publish when ready</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AddBlog;