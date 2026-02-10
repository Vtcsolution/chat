import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePsychicAuth } from "../context/PsychicAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  DollarSign, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Shield,
  Calendar,
  Key,
  Info,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Star
} from 'lucide-react';
import { toast } from "sonner";
import axios from "axios";

const HumanPsychicProfile = () => {
  const { psychic, loading: authLoading, isAuthenticated, logout, refreshPsychic } = usePsychicAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ratePerMin: '',
    bio: '',
    gender: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  // Color scheme
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
  
  // Create axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001',
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('psychicToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/psychic/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get('/api/human-psychics/profile/me');
      
      if (data.success) {
        setProfile(data.psychic);
        setFormData({
          name: data.psychic.name || '',
          email: data.psychic.email || '',
          ratePerMin: data.psychic.ratePerMin?.toString() || '',
          bio: data.psychic.bio || '',
          gender: data.psychic.gender || '',
        });
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/psychic/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate rate
      if (formData.ratePerMin && (isNaN(formData.ratePerMin) || parseFloat(formData.ratePerMin) <= 0)) {
        toast.error("Please enter a valid rate per minute");
        return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        ratePerMin: parseFloat(formData.ratePerMin),
        bio: formData.bio,
        gender: formData.gender,
      };

      const { data } = await api.put('/api/human-psychics/profile/me', updateData);
      
      if (data.success) {
        setProfile(data.psychic);
        setIsEditing(false);
        refreshPsychic(); // Refresh auth context
        
        toast.success("Profile updated successfully!");
        
        // Update form data with new values
        setFormData({
          name: data.psychic.name || '',
          email: data.psychic.email || '',
          ratePerMin: data.psychic.ratePerMin?.toString() || '',
          bio: data.psychic.bio || '',
          gender: data.psychic.gender || '',
        });
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
      
      if (err.response?.status === 401) {
        logout();
        navigate("/psychic/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await api.put('/api/human-psychics/profile/me', {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
      });
      
      if (data.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        toast.success("Password changed successfully!");
        refreshPsychic(); // Refresh auth context
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
      
      if (err.response?.status === 401) {
        toast.error("Current password is incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error("Please type 'DELETE' to confirm account deletion");
      return;
    }

    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await api.delete('/api/human-psychics/profile/me');
      
      if (data.success) {
        toast.success("Account deleted successfully");
        logout();
        navigate("/psychic/login");
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete account');
      
      if (err.response?.status === 401) {
        logout();
        navigate("/psychic/login");
      }
    } finally {
      setLoading(false);
      setIsDeleting(false);
      setDeleteConfirm('');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/api/human-psychics/logout');
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      logout();
      navigate("/psychic/login");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (authLoading || (loading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="h-12 w-12 border-4 rounded-full animate-spin mx-auto mb-4" 
            style={{ borderColor: colors.secondary, borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Card className="w-full max-w-md mx-4 border" style={{ borderColor: colors.danger + '30' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.danger }}>
              <AlertCircle className="h-5 w-5" />
              Error Loading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={fetchProfile} 
              className="w-full"
              style={{ backgroundColor: colors.secondary, color: colors.primary }}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Psychic Profile</h1>
          <p className="mt-2" style={{ color: colors.primary + '80' }}>Manage your account settings and profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border shadow-sm" style={{ borderColor: colors.secondary + '30' }}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-32 w-32 border-4 shadow-lg" 
                    style={{ borderColor: colors.secondary }}>
                    <AvatarImage src={profile?.image} />
                    <AvatarFallback className="text-2xl" 
                      style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                      {profile?.name?.[0] || 'P'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl" style={{ color: colors.primary }}>{profile?.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 mt-2">
                  <Badge 
                    variant={profile?.isVerified ? "default" : "outline"} 
                    className="gap-1"
                    style={profile?.isVerified ? {
                      backgroundColor: colors.success + '20',
                      color: colors.success,
                      borderColor: colors.success + '30'
                    } : {
                      borderColor: colors.warning,
                      color: colors.warning
                    }}
                  >
                    {profile?.isVerified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending Verification
                      </>
                    )}
                  </Badge>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center gap-3 p-3 rounded-lg" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <Mail className="h-4 w-4" style={{ color: colors.secondary }} />
                  <span className="text-sm" style={{ color: colors.primary + '90' }}>{profile?.email}</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <DollarSign className="h-4 w-4" style={{ color: colors.secondary }} />
                  <span className="text-sm" style={{ color: colors.primary + '90' }}>
                    ${profile?.ratePerMin?.toFixed(2)}/min
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <User className="h-4 w-4" style={{ color: colors.secondary }} />
                  <span className="text-sm capitalize" style={{ color: colors.primary + '90' }}>
                    {profile?.gender}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <Calendar className="h-4 w-4" style={{ color: colors.secondary }} />
                  <span className="text-sm" style={{ color: colors.primary + '90' }}>
                    Joined {formatDate(profile?.createdAt)}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="w-full"
                  style={{ 
                    borderColor: colors.danger + '30',
                    color: colors.danger,
                    backgroundColor: colors.danger + '05'
                  }}
                >
                  Logout
                </Button>
              </CardFooter>
            </Card>

            {/* Stats Card */}
            <Card className="border shadow-sm" style={{ borderColor: colors.secondary + '30' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: colors.primary }}>
                  <Star className="h-4 w-4" style={{ color: colors.secondary }} />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <span className="text-sm" style={{ color: colors.primary + '70' }}>Status</span>
                  <Badge 
                    style={profile?.isVerified ? {
                      backgroundColor: colors.success + '20',
                      color: colors.success,
                    } : {
                      backgroundColor: colors.warning + '20',
                      color: colors.warning,
                    }}
                  >
                    {profile?.isVerified ? 'Active' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <span className="text-sm" style={{ color: colors.primary + '70' }}>Member Since</span>
                  <span className="text-sm font-medium" style={{ color: colors.primary }}>
                    {formatDate(profile?.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded" 
                  style={{ backgroundColor: colors.primary + '05' }}>
                  <span className="text-sm" style={{ color: colors.primary + '70' }}>Last Updated</span>
                  <span className="text-sm font-medium" style={{ color: colors.primary }}>
                    {formatDate(profile?.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Forms */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-3 bg-gray-100 p-1">
                <TabsTrigger 
                  value="profile"
                  className="data-[state=active]:shadow-sm"
                  style={{
                    color: colors.primary,
                  }}
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="security"
                  className="data-[state=active]:shadow-sm"
                  style={{
                    color: colors.primary,
                  }}
                >
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="danger"
                  className="data-[state=active]:shadow-sm"
                  style={{
                    color: colors.danger,
                  }}
                >
                  Danger Zone
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="border shadow-sm" style={{ borderColor: colors.secondary + '30' }}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle style={{ color: colors.primary }}>Profile Information</CardTitle>
                        <CardDescription style={{ color: colors.primary + '70' }}>
                          Update your personal information and bio
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)} 
                          variant="outline" 
                          className="gap-2"
                          style={{ 
                            borderColor: colors.secondary,
                            color: colors.secondary,
                            backgroundColor: colors.secondary + '05'
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setIsEditing(false)} 
                            variant="outline" 
                            className="gap-2"
                            style={{ 
                              borderColor: colors.primary + '30',
                              color: colors.primary,
                            }}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleUpdateProfile} 
                            className="gap-2"
                            disabled={loading}
                            style={{ backgroundColor: colors.secondary, color: colors.primary }}
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" style={{ color: colors.primary }}>
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter your full name"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email" style={{ color: colors.primary }}>
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              placeholder="Enter your email"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ratePerMin" style={{ color: colors.primary }}>
                              Rate per Minute ($) *
                            </Label>
                            <Input
                              id="ratePerMin"
                              name="ratePerMin"
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={formData.ratePerMin}
                              onChange={handleInputChange}
                              required
                              placeholder="e.g., 1.50"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="gender" style={{ color: colors.primary }}>
                              Gender *
                            </Label>
                            <Select 
                              value={formData.gender} 
                              onValueChange={(value) => handleSelectChange('gender', value)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio" style={{ color: colors.primary }}>
                            Bio *
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            required
                            placeholder="Tell clients about yourself..."
                            rows={4}
                            className="min-h-[120px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            style={{ color: colors.primary }}
                          />
                          <p className="text-xs" style={{ color: colors.primary + '70' }}>
                            Minimum 50 characters. Describe your skills, experience, and specialties.
                          </p>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label style={{ color: colors.primary + '70' }}>Full Name</Label>
                            <p className="font-medium" style={{ color: colors.primary }}>{profile?.name}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label style={{ color: colors.primary + '70' }}>Email Address</Label>
                            <p className="font-medium" style={{ color: colors.primary }}>{profile?.email}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label style={{ color: colors.primary + '70' }}>Rate per Minute</Label>
                            <p className="font-medium" style={{ color: colors.primary }}>
                              ${profile?.ratePerMin?.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label style={{ color: colors.primary + '70' }}>Gender</Label>
                            <p className="font-medium capitalize" style={{ color: colors.primary }}>
                              {profile?.gender}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label style={{ color: colors.primary + '70' }}>Bio</Label>
                          <div className="p-4 rounded-lg border" 
                            style={{ 
                              backgroundColor: colors.primary + '05',
                              borderColor: colors.secondary + '30'
                            }}>
                            <p className="whitespace-pre-wrap" style={{ color: colors.primary }}>
                              {profile?.bio}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="border shadow-sm" style={{ borderColor: colors.secondary + '30' }}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                      <Shield className="h-5 w-5" style={{ color: colors.secondary }} />
                      Security Settings
                    </CardTitle>
                    <CardDescription style={{ color: colors.primary + '70' }}>
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isChangingPassword ? (
                      <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword" style={{ color: colors.primary }}>
                              Current Password *
                            </Label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required
                              placeholder="Enter current password"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" style={{ color: colors.primary }}>
                              New Password *
                            </Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                              placeholder="Enter new password"
                              minLength={6}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                            <p className="text-xs" style={{ color: colors.primary + '70' }}>
                              Password must be at least 6 characters long
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" style={{ color: colors.primary }}>
                              Confirm New Password *
                            </Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              placeholder="Confirm new password"
                              minLength={6}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              style={{ color: colors.primary }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                            }}
                            variant="outline"
                            style={{ 
                              borderColor: colors.primary + '30',
                              color: colors.primary,
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: colors.secondary, color: colors.primary }}
                          >
                            Change Password
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="rounded-lg p-4" 
                          style={{ 
                            backgroundColor: colors.accent + '10',
                            borderColor: colors.accent + '30',
                            borderWidth: '1px'
                          }}>
                          <div className="flex items-start gap-3">
                            <Key className="h-5 w-5 mt-0.5" style={{ color: colors.accent }} />
                            <div>
                              <h4 className="font-medium" style={{ color: colors.primary }}>Password Security</h4>
                              <p className="text-sm mt-1" style={{ color: colors.primary + '70' }}>
                                Change your password regularly to keep your account secure.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator style={{ backgroundColor: colors.primary + '20' }} />
                        
                        <div className="flex justify-between items-center p-4 rounded-lg" 
                          style={{ backgroundColor: colors.primary + '05' }}>
                          <div>
                            <h4 className="font-medium" style={{ color: colors.primary }}>Password</h4>
                            <p className="text-sm mt-1" style={{ color: colors.primary + '70' }}>
                              Last changed: {formatDate(profile?.updatedAt)}
                            </p>
                          </div>
                          <Button 
                            onClick={() => setIsChangingPassword(true)}
                            variant="outline"
                            className="gap-2"
                            style={{ 
                              borderColor: colors.secondary,
                              color: colors.secondary,
                              backgroundColor: colors.secondary + '05'
                            }}
                          >
                            <Key className="h-4 w-4" />
                            Change Password
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Danger Zone Tab */}
              <TabsContent value="danger">
                <Card className="border shadow-sm" 
                  style={{ 
                    borderColor: colors.danger + '30',
                    backgroundColor: colors.danger + '05'
                  }}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.danger }}>
                      <AlertCircle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription style={{ color: colors.danger + '80' }}>
                      Irreversible actions. Proceed with caution.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {isDeleting ? (
                      <div className="space-y-4">
                        <div className="rounded-lg p-4" 
                          style={{ 
                            backgroundColor: colors.danger + '10',
                            borderColor: colors.danger + '30',
                            borderWidth: '1px'
                          }}>
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: colors.danger }} />
                            <div>
                              <h4 className="font-medium" style={{ color: colors.danger }}>Warning: This action cannot be undone</h4>
                              <p className="text-sm mt-1" style={{ color: colors.danger + '80' }}>
                                This will permanently delete your account, all chat sessions, and all associated data.
                                You will not be able to recover your account.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirm" style={{ color: colors.danger }}>
                            Type "DELETE" to confirm *
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="focus:border-red-500 focus:ring-red-500"
                            style={{ 
                              borderColor: colors.danger + '50',
                              color: colors.danger,
                            }}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setIsDeleting(false);
                              setDeleteConfirm('');
                            }}
                            variant="outline"
                            style={{ 
                              borderColor: colors.primary + '30',
                              color: colors.primary,
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleDeleteAccount}
                            variant="destructive"
                            disabled={loading || deleteConfirm !== 'DELETE'}
                            style={{ backgroundColor: colors.danger }}
                          >
                            {loading ? 'Deleting...' : 'Delete Account Permanently'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg p-4" 
                          style={{ 
                            backgroundColor: colors.warning + '10',
                            borderColor: colors.warning + '30',
                            borderWidth: '1px'
                          }}>
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 mt-0.5" style={{ color: colors.warning }} />
                            <div>
                              <h4 className="font-medium" style={{ color: colors.primary }}>Account Deletion</h4>
                              <p className="text-sm mt-1" style={{ color: colors.primary + '70' }}>
                                Once you delete your account, there is no going back. Please be certain.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 rounded-lg border" 
                          style={{ 
                            backgroundColor: colors.primary + '05',
                            borderColor: colors.danger + '30'
                          }}>
                          <div>
                            <h4 className="font-medium" style={{ color: colors.primary }}>Delete Account</h4>
                            <p className="text-sm mt-1" style={{ color: colors.primary + '70' }}>
                              Permanently remove your account and all data
                            </p>
                          </div>
                          <Button 
                            onClick={() => setIsDeleting(true)}
                            variant="destructive"
                            style={{ backgroundColor: colors.danger }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Verification Status Card */}
            {!profile?.isVerified && (
              <Card className="mt-6 border shadow-sm" 
                style={{ 
                  borderColor: colors.warning + '30',
                  backgroundColor: colors.warning + '05'
                }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.warning }}>
                    <Clock className="h-5 w-5" />
                    Account Verification Pending
                  </CardTitle>
                  <CardDescription style={{ color: colors.primary + '70' }}>
                    Your account is awaiting admin verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg p-4" 
                    style={{ 
                      backgroundColor: colors.warning + '10',
                      borderColor: colors.warning + '30',
                      borderWidth: '1px'
                    }}>
                    <p className="text-sm" style={{ color: colors.primary + '80' }}>
                      Your account is currently under review. Once verified by an administrator, 
                      you will be able to receive chat requests and start earning. 
                      This process usually takes 24-48 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanPsychicProfile;