import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  BookOpen,
  Save,
  Loader2,
  ArrowLeft,
  Image,
  Sparkles,
  Layers,
  Upload,
  X,
  Tag,
  FileText,
  EyeOff,
  Eye,
  Star,
  MessageCircle,
  Hash,
  Info,
  Settings,
  Link,
  Trash2,
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
import { Label } from "@/components/ui/label";
import Dashboard_Navbar from "../Admin_Navbar";
import Doctor_Side_Bar from "../SideBar";
import axios from 'axios';

const colors = {
  primary: "#2B1B3F",
  secondary: "#C9A24D",
  accent: "#9B7EDE",
  bgLight: "#3A2B4F",
  textLight: "#E8D9B0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#F5F3EB",
};

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

const formattingButtons = [
  { icon: 'B', label: 'Bold', tag: 'strong' },
  { icon: 'I', label: 'Italic', tag: 'em' },
  { icon: 'U', label: 'Underline', tag: 'u' },
  { icon: 'H1', label: 'Heading 1', tag: 'h1' },
  { icon: 'H2', label: 'Heading 2', tag: 'h2' },
  { icon: 'P', label: 'Paragraph', tag: 'p' },
];

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [side, setSide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [errors, setErrors] = useState({});
  
  // Image states
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
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
    images: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isPublished: false,
    isFeatured: false,
    allowComments: true,
    authorName: "",
  });

  // Fetch blog data on mount
  useEffect(() => {
    fetchBlog();
  }, [id]);

 const fetchBlog = async () => {
  try {
    setLoading(true);
    
    if (!id) {
      console.error("❌ No ID provided");
      toast({
        title: "Error",
        description: "No blog ID provided",
        variant: "destructive"
      });
      navigate('/admin/dashboard/blogs');
      return;
    }

    console.log("🔍 Fetching blog with ID:", id);
    console.log("🔗 Full URL:", `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`);
    
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`,
      { 
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("✅ Raw response:", response);
    console.log("✅ Response data:", response.data);

    // Handle different response formats
    let blog;
    if (response.data.success && response.data.data) {
      // Format: { success: true, data: {...} }
      blog = response.data.data;
    } else if (response.data.data) {
      // Format: { data: {...} }
      blog = response.data.data;
    } else if (response.data._id) {
      // Format: direct blog object
      blog = response.data;
    } else {
      console.error("❌ Unexpected response format:", response.data);
      throw new Error("Invalid response format");
    }

    console.log("📦 Blog data:", blog);
    
    // Convert tags array to comma-separated string
    const tagsString = blog.tags ? blog.tags.join(', ') : '';
    
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      category: blog.category || "",
      tags: tagsString,
      featuredImage: blog.featuredImage || "",
      images: blog.images || [],
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords || "",
      isPublished: blog.isPublished || false,
      isFeatured: blog.isFeatured || false,
      allowComments: blog.allowComments !== undefined ? blog.allowComments : true,
      authorName: blog.authorName || "Admin",
    });

    // Set image previews
    if (blog.featuredImage) {
      setFeaturedImagePreview(blog.featuredImage);
    }
    
    if (blog.images && blog.images.length > 0) {
      setAdditionalImagePreviews(blog.images);
    }

    toast({
      title: "Success",
      description: "Blog loaded successfully",
    });

  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    
    if (error.code === 'ECONNABORTED') {
      toast({
        title: "Timeout Error",
        description: "Request timed out. Please try again.",
        variant: "destructive"
      });
    } else if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      if (error.response.status === 404) {
        toast({
          title: "Blog Not Found",
          description: "The blog you're trying to edit doesn't exist.",
          variant: "destructive"
        });
      } else {
        toast({
          title: `Error ${error.response.status}`,
          description: error.response.data?.message || "Failed to fetch blog",
          variant: "destructive"
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      toast({
        title: "Network Error",
        description: "Cannot connect to server. Please check if backend is running.",
        variant: "destructive"
      });
    } else {
      // Something happened in setting up the request
      toast({
        title: "Error",
        description: error.message || "Failed to fetch blog",
        variant: "destructive"
      });
    }
    
    // Don't navigate immediately, let the user see the error
    setTimeout(() => {
      navigate('/admin/dashboard/blogs');
    }, 3000);
    
  } finally {
    setLoading(false);
  }
};

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
          description: "Please select an image file",
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
    if (additionalImages[index]) {
      // This is a new uploaded image
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(additionalImagePreviews[index]);
    } else {
      // This is an existing image from the blog
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle featured image URL change
  const handleFeaturedImageUrlChange = (value) => {
    setFormData(prev => ({ ...prev, featuredImage: value }));
    setFeaturedImageFile(null);
    setFeaturedImagePreview(value);
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!featuredImagePreview && !formData.featuredImage) {
      newErrors.featuredImage = "Featured image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle update
const handleUpdate = async (publish = false) => {
  if (!validateForm()) {
    toast({
      title: "Validation Error",
      description: "Please fix the errors in the form",
      variant: "destructive"
    });
    return;
  }

  try {
    setSaving(true);
    console.log("🔄 Starting update process...");
    console.log("📝 Form data:", formData);
    
    let finalFeaturedImageUrl = formData.featuredImage;
    let finalAdditionalImageUrls = [...formData.images];
    
    // Upload new featured image if selected
    if (featuredImageFile) {
      setIsUploadingImage(true);
      toast({
        title: "Uploading Image",
        description: "Uploading featured image...",
      });
      
      try {
        finalFeaturedImageUrl = await uploadToCloudinary(featuredImageFile);
        console.log("✅ Featured image uploaded:", finalFeaturedImageUrl);
        setIsUploadingImage(false);
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        toast({
          title: "Image Upload Failed",
          description: uploadError.message || "Failed to upload featured image",
          variant: "destructive"
        });
        setSaving(false);
        setIsUploadingImage(false);
        return;
      }
    }

    // Upload new additional images
    if (additionalImages.length > 0) {
      setUploadingAdditional(true);
      toast({
        title: "Uploading Images",
        description: `Uploading ${additionalImages.length} images...`,
      });

      try {
        for (const image of additionalImages) {
          const url = await uploadToCloudinary(image);
          finalAdditionalImageUrls.push(url);
          console.log("✅ Additional image uploaded:", url);
        }
        setUploadingAdditional(false);
      } catch (uploadError) {
        console.error("❌ Additional images upload failed:", uploadError);
        toast({
          title: "Additional Images Upload Failed",
          description: "Some images failed to upload",
          variant: "destructive"
        });
        setSaving(false);
        setUploadingAdditional(false);
        return;
      }
    }

    // Process tags
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
      isPublished: publish ? true : formData.isPublished,
      isFeatured: formData.isFeatured,
      allowComments: formData.allowComments,
    };

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));
    console.log("🔗 Update URL:", `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`);

    const response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`,
      payload,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Update response:", response.data);

    if (response.data.success) {
      toast({
        title: "Success",
        description: publish ? "Blog published successfully" : "Blog updated successfully",
      });

      // Small delay to show success message
      setTimeout(() => {
        navigate('/admin/dashboard/blogs');
      }, 1500);
    } else {
      throw new Error(response.data.message || "Update failed");
    }
    
  } catch (error) {
    console.error('❌ Update error:', error);
    
    let errorMessage = "Failed to update blog";
    let errorDetails = "";
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      errorMessage = error.response.data?.message || errorMessage;
      
      if (error.response.data?.errors) {
        errorDetails = Object.values(error.response.data.errors).join(', ');
      }
    } else if (error.request) {
      errorMessage = "No response from server";
      errorDetails = "Please check if backend is running";
    } else {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
      variant: "destructive"
    });
  } finally {
    setSaving(false);
    setIsUploadingImage(false);
    setUploadingAdditional(false);
  }
};

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/blogs/${id}`,
        { withCredentials: true }
      );
      
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
      
      navigate('/admin/dashboard/blogs');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <Dashboard_Navbar side={side} setSide={setSide} />
        <div className="flex pt-16">
          <Doctor_Side_Bar side={side} setSide={setSide} />
          <main className="flex-1 p-8 ml-0 lg:ml-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.secondary }} />
          </main>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/admin/dashboard/blogs')}
                className="hover:scale-105 transition-transform"
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
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary }}>
                    Edit Blog
                  </h1>
                </div>
                <p className="text-sm" style={{ color: colors.primary + '70' }}>
                  Update your blog post
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="hover:scale-105 transition-transform"
              style={{
                borderColor: colors.danger,
                color: colors.danger,
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Blog
            </Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex" style={{ backgroundColor: colors.primary + '10' }}>
              <TabsTrigger value="content" className="data-[state=active]:bg-white" style={{ color: colors.primary }}>
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-white" style={{ color: colors.primary }}>
                <Image className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="seo" className="data-[state=active]:bg-white" style={{ color: colors.primary }}>
                <Hash className="h-4 w-4 mr-2" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white" style={{ color: colors.primary }}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              {/* Blog Title */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <BookOpen className="h-5 w-5" />
                    Blog Title
                  </CardTitle>
                  <CardDescription style={{ color: colors.primary + '70' }}>
                    Edit your blog title
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`text-lg ${errors.title ? "border-red-500" : ""}`}
                    style={{ borderColor: colors.primary + '20' }}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </CardContent>
              </Card>

              {/* Category */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Layers className="h-5 w-5" />
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""} style={{ borderColor: colors.primary + '20' }}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <FileText className="h-5 w-5" />
                    Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md" style={{ borderColor: colors.primary + '20' }}>
                      {formattingButtons.map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => applyFormatting(btn.tag)}
                          className="px-3 py-1 text-sm rounded hover:bg-white transition-colors"
                          style={{ color: colors.primary }}
                        >
                          {btn.icon}
                        </button>
                      ))}
                    </div>
                    
                    <Textarea
                      id="content"
                      name="content"
                      className={`min-h-[400px] font-mono ${errors.content ? "border-red-500" : ""}`}
                      style={{ borderColor: colors.primary + '20' }}
                      value={formData.content}
                      onChange={handleInputChange}
                    />
                    
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Info className="h-5 w-5" />
                    Excerpt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={generateExcerpt}
                      style={{ borderColor: colors.secondary, color: colors.secondary }}
                    >
                      Auto-generate from content
                    </Button>
                    <Textarea
                      name="excerpt"
                      className={`min-h-[100px] ${errors.excerpt ? "border-red-500" : ""}`}
                      style={{ borderColor: colors.primary + '20' }}
                      value={formData.excerpt}
                      onChange={handleInputChange}
                    />
                    {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="tags"
                    placeholder="tarot, love, spirituality (separate with commas)"
                    value={formData.tags}
                    onChange={handleInputChange}
                    style={{ borderColor: colors.primary + '20' }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 mt-6">
              {/* Featured Image */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Image className="h-5 w-5" />
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl h-64 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
                         style={{ border: `2px solid ${colors.secondary}30` }}>
                      {featuredImagePreview ? (
                        <img
                          src={featuredImagePreview}
                          alt="Featured"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.primary + '05' }}>
                          <Image className="h-24 w-24" style={{ color: colors.primary + '30' }} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFeaturedImageChange}
                      />
                    </div>
                    
                    {featuredImagePreview && (
                      <button
                        type="button"
                        className="mt-2 text-sm flex items-center gap-1 px-3 py-1 rounded-full"
                        style={{ backgroundColor: colors.danger + '10', color: colors.danger }}
                        onClick={removeFeaturedImage}
                      >
                        <X className="h-3 w-3" />
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImage" className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Link className="h-4 w-4" />
                      Image URL
                    </Label>
                    <Input
                      name="featuredImage"
                      placeholder="https://example.com/image.jpg"
                      value={formData.featuredImage}
                      onChange={(e) => handleFeaturedImageUrlChange(e.target.value)}
                      className={errors.featuredImage ? "border-red-500" : ""}
                      style={{ borderColor: colors.primary + '20' }}
                      disabled={!!featuredImageFile}
                    />
                    {errors.featuredImage && <p className="text-sm text-red-500">{errors.featuredImage}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Images */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Layers className="h-5 w-5" />
                    Additional Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {additionalImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="additional-images"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{ borderColor: colors.secondary + '50' }}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 mb-2" style={{ color: colors.secondary }} />
                        <p className="text-sm" style={{ color: colors.primary }}>
                          <span className="font-semibold">Click to upload</span> or drag and drop
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
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Hash className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle" style={{ color: colors.primary }}>Meta Title</Label>
                    <Input
                      name="metaTitle"
                      placeholder="SEO title (max 60 characters)"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      style={{ borderColor: colors.primary + '20' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription" style={{ color: colors.primary }}>Meta Description</Label>
                    <Textarea
                      name="metaDescription"
                      placeholder="SEO description (max 160 characters)"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      style={{ borderColor: colors.primary + '20' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords" style={{ color: colors.primary }}>Meta Keywords</Label>
                    <Input
                      name="metaKeywords"
                      placeholder="tarot, love, psychic (separate with commas)"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                      style={{ borderColor: colors.primary + '20' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Preview */}
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                    <Eye className="h-4 w-4" />
                    Google Search Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary + '05' }}>
                    <p className="text-lg text-blue-600 font-medium mb-1">
                      {formData.metaTitle || formData.title}
                    </p>
                    <p className="text-sm text-green-700 mb-1">
                      {window.location.origin}/blog/{formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.metaDescription || formData.excerpt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card className="border-none shadow-lg" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                    <Settings className="h-5 w-5" />
                    Blog Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Publishing Status */}
                  <div className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: colors.secondary + '05' }}>
                    <div>
                      <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                        {formData.isPublished ? <Eye className="h-4 w-4" style={{ color: colors.success }} /> : <EyeOff className="h-4 w-4" />}
                        Publish Status
                      </Label>
                      <p className="text-sm" style={{ color: colors.primary + '60' }}>
                        {formData.isPublished ? "Published and visible" : "Saved as draft"}
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleSwitchChange('isPublished', checked)}
                    />
                  </div>

                  {/* Featured Status */}
                  <div className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: colors.accent + '05' }}>
                    <div>
                      <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                        <Star className="h-4 w-4" style={{ color: formData.isFeatured ? colors.warning : colors.primary + '50' }} />
                        Featured Blog
                      </Label>
                      <p className="text-sm" style={{ color: colors.primary + '60' }}>
                        {formData.isFeatured ? "Appears in featured section" : "Not featured"}
                      </p>
                    </div>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                    />
                  </div>

                  {/* Comments Settings */}
                  <div className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: colors.success + '05' }}>
                    <div>
                      <Label className="flex items-center gap-2 font-medium" style={{ color: colors.primary }}>
                        <MessageCircle className="h-4 w-4" style={{ color: formData.allowComments ? colors.success : colors.primary + '50' }} />
                        Allow Comments
                      </Label>
                      <p className="text-sm" style={{ color: colors.primary + '60' }}>
                        {formData.allowComments ? "Comments enabled" : "Comments disabled"}
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowComments}
                      onCheckedChange={(checked) => handleSwitchChange('allowComments', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card className="border-none shadow-lg mt-6" style={{ background: `linear-gradient(135deg, white 0%, ${colors.primary}05 100%)` }}>
            <CardFooter className="flex justify-between px-6 py-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard/blogs')}
                disabled={saving}
                style={{ borderColor: colors.primary + '20', color: colors.primary }}
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleUpdate(false)}
                  disabled={saving}
                  style={{ borderColor: colors.primary + '20', color: colors.primary }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                {!formData.isPublished && (
                  <Button
                    onClick={() => handleUpdate(true)}
                    disabled={saving}
                    style={{ backgroundColor: colors.secondary, color: colors.primary }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Publish Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditBlog;