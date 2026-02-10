// src/pages/psychic/PsychicRegister.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePsychicAuth } from "@/context/PsychicAuthContext";
import { Loader2, Upload, X, Sparkles, UserPlus, Mail, Lock, DollarSign, User, Award, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

// Define the same color scheme
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

export default function PsychicRegister() {
  const { register, loading } = usePsychicAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ratePerMin: "",
    bio: "",
    gender: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value });
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
      toast.error("Image upload failed: " + error.message);
      throw error;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.gender) {
      toast.error("Please select your gender");
      return;
    }

    if (parseFloat(formData.ratePerMin) < 0.99) {
      toast.error("Minimum rate is $0.99 per minute");
      return;
    }

    try {
      let finalImageUrl = formData.image;
      
      if (imageFile) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadToCloudinary(imageFile);
        setIsUploadingImage(false);
      }

      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ratePerMin: formData.ratePerMin,
        bio: formData.bio,
        gender: formData.gender,
        image: finalImageUrl
      };

      const result = await register(registrationData);

      if (result?.success) {
        toast.success("Application submitted successfully! Awaiting admin approval.", {
          duration: 5000,
          action: {
            label: "Login",
            onClick: () => navigate("/psychic/login"),
          },
        });
        setTimeout(() => {
          navigate("/psychic/login");
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full" 
          style={{ backgroundColor: colors.accent, filter: 'blur(60px)' }}></div>
        <div className="absolute bottom-20 right-10 h-60 w-60 rounded-full" 
          style={{ backgroundColor: colors.secondary, filter: 'blur(80px)' }}></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        {/* Header */}
       

        <div className="grid md:grid-cols-1 gap-8">
          {/* Left Column - Information */}
        

          {/* Right Column - Registration Form */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="pb-6 border-b"
              style={{ borderColor: colors.secondary + '20' }}>
              <CardTitle className="text-2xl font-bold flex items-center gap-3"
                style={{ color: colors.primary }}>
                <UserPlus className="h-6 w-6" style={{ color: colors.secondary }} />
                Application Form
              </CardTitle>
              <CardDescription>
                Fill in your details to apply. All fields are required.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Section */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 font-bold"
                    style={{ color: colors.primary }}>
                    <User className="h-4 w-4" />
                    Profile Image
                  </Label>
                  <div className="flex items-center gap-6">
                    <div 
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div className="h-20 w-20 rounded-full border-4 overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        style={{ 
                          borderColor: colors.secondary,
                          backgroundColor: colors.secondary + '10'
                        }}>
                        {imagePreviewUrl ? (
                          <img 
                            src={imagePreviewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : formData.image ? (
                          <img 
                            src={formData.image} 
                            alt="Current" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8" style={{ color: colors.secondary + '50' }} />
                          </div>
                        )}
                      </div>
                      
                      {(imagePreviewUrl || formData.image) && (
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                          onClick={removeImage}
                          style={{ 
                            backgroundColor: colors.danger,
                            color: 'white'
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Upload className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="profile-image"
                        onChange={handleImageChange}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Label 
                        htmlFor="profile-image"
                        className="cursor-pointer flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105 inline-block"
                        style={{ color: colors.secondary }}
                      >
                        <Upload className="w-4 h-4" />
                        {imageFile ? "Change Image" : "Upload Image"}
                      </Label>
                      <p className="text-xs mt-1" style={{ color: colors.bgLight }}>
                        Recommended: 400x400px, JPG or PNG
                      </p>
                      
                      {/* Image URL Input */}
                      <div className="mt-3">
                        <Input 
                          type="text" 
                          id="image" 
                          value={formData.image} 
                          onChange={handleChange} 
                          placeholder="Or enter image URL" 
                          disabled={!!imageFile}
                          className="text-sm"
                          style={{ 
                            borderColor: colors.secondary + '30',
                            color: colors.primary
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" style={{ color: colors.secondary }} />
                      Full Name *
                    </Label>
                    <Input 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      style={{ 
                        borderColor: colors.secondary + '30',
                        color: colors.primary
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" style={{ color: colors.secondary }} />
                      Email Address *
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      style={{ 
                        borderColor: colors.secondary + '30',
                        color: colors.primary
                      }}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" style={{ color: colors.secondary }} />
                      Password *
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      style={{ 
                        borderColor: colors.secondary + '30',
                        color: colors.primary
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" style={{ color: colors.secondary }} />
                      Confirm Password *
                    </Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      required 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      style={{ 
                        borderColor: colors.secondary + '30',
                        color: colors.primary
                      }}
                    />
                  </div>
                </div>

                {/* Rate and Gender */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ratePerMin" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" style={{ color: colors.secondary }} />
                      Rate per Minute ($) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-bold"
                        style={{ color: colors.secondary }}>
                        $
                      </span>
                      <Input
                        id="ratePerMin"
                        type="number"
                        step="0.01"
                        min="0.99"
                        required
                        value={formData.ratePerMin}
                        onChange={handleChange}
                        placeholder="3.99"
                        className="pl-8"
                        style={{ 
                          borderColor: colors.secondary + '30',
                          color: colors.primary
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.bgLight }}>
                      Minimum: $0.99 per minute
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" style={{ color: colors.secondary }} />
                      Gender *
                    </Label>
                    <Select onValueChange={handleGenderChange} required>
                      <SelectTrigger style={{ 
                        borderColor: colors.secondary + '30',
                        color: colors.primary
                      }}>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other / Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: colors.secondary }} />
                    Bio / Specialization *
                  </Label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 resize-none transition-all duration-200 focus:scale-[1.01]"
                    placeholder="Tell us about your spiritual gifts, experience, and areas of expertise..."
                    required
                    value={formData.bio}
                    onChange={handleChange}
                    style={{ 
                      borderColor: colors.secondary + '30',
                      color: colors.primary,
                      minHeight: '100px'
                    }}
                  />
                  <p className="text-xs" style={{ color: colors.bgLight }}>
                    Describe your psychic abilities, reading styles, and what clients can expect
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full font-bold text-lg py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: colors.primary
                  }}
                  disabled={loading || isUploadingImage}
                >
                  {(loading || isUploadingImage) ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isUploadingImage ? "Uploading Image..." : "Submitting Application..."}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Apply to Become a Psychic
                    </>
                  )}
                </Button>
              </form>

              {/* Terms Note */}
              <div className="text-center text-sm pt-4 border-t"
                style={{ borderColor: colors.secondary + '20', color: colors.bgLight }}>
                <p className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" style={{ color: colors.success }} />
                  Your information is secure and encrypted
                </p>
                <p className="mt-1 text-xs">
                  By applying, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: colors.bgLight }}>
            <span className="font-bold" style={{ color: colors.primary }}>Note:</span> 
            {" "}All applications are reviewed manually. Approval may take 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}