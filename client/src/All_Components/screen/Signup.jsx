
import React, { useState, useEffect } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import { useAuth } from "./AuthContext";

// Initialize Cloudinary instance once
const cld = new Cloudinary({ cloud: { cloudName: "dovyqaltq" } });

export default function Signup() {
  const { register, user, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    imageFile: null,
    imagePublicId: null,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      setIsLoading(true);
      const url = await uploadToCloudinary(file);
      setAvatar(url); // set Cloudinary image URL
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }
};

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle image file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file, imagePublicId: null });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload image file to Cloudinary using unsigned preset
const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default"); // your unsigned preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dovyqaltq/image/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Upload failed");
  return json.secure_url;
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let publicId = formData.imagePublicId;

      // Upload image if a new file is selected
      if (formData.imageFile) {
        publicId = await uploadToCloudinary(formData.imageFile);
        setFormData((prev) => ({ ...prev, imagePublicId: publicId }));
        setImagePreviewUrl(null);
      }

      // Prepare payload with Cloudinary image URL or empty string
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        image: publicId || "",
      };

      // Call register from AuthContext
      await register(payload);
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    }
  };

  // React to auth changes & errors
  useEffect(() => {
    if (user) {
      toast.success("Account created successfully!");
      setFormData({
        username: "",
        email: "",
        password: "",
        imageFile: null,
        imagePublicId: null,
      });
      setImagePreviewUrl(null);
       navigate("/");
    }
    if (error) {
      toast.error(error);
    }
  }, [user, error]);

  // Prepare Cloudinary image object for display (with transformations)
  const cldImage = formData.imagePublicId
    ? cld
        .image(formData.imagePublicId)
        .format("auto")
        .quality("auto")
        .resize(auto().gravity(autoGravity()).width(80).height(80))
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  {cldImage ? (
                    <AdvancedImage cldImg={cldImage} />
                  ) : imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="profile-image"
                  onChange={handleImageChange}
                />
              </div>
              <Label
                htmlFor="profile-image"
                className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload Photo
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

