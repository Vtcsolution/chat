import React, { useEffect, useState } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { toast } from "sonner";
import { Loader2, CameraIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useAuth } from "./screen/AuthContext";

const UpdateProfile = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dob: "",
    bio: "",
    imageFile: null,
    imagePublicId: null,
  });
  const cld = new Cloudinary({ cloud: { cloudName: "dovyqaltq" } });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const formatDateOnly = (dobObj) => {
    if (!dobObj) return "";
    if (typeof dobObj === "string") return dobObj.slice(0, 10);
    if (dobObj.$date) return dobObj.$date.slice(0, 10);
    if (dobObj instanceof Date) return dobObj.toISOString().slice(0, 10);
    return "";
  };

  const extractPublicId = (url) => {
    if (!url) return null;
    const match = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return match ? match[1] : null;
  };

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
    } catch (err) {
      throw new Error("Image upload failed: " + err.message);
    }
  };

  useEffect(() => {
    if (!user || !user._id) return;

    setIsLoading(true);
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/users/user/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          username: data.username || "",
          email: data.email || "",
          dob: formatDateOnly(data.dob) || "",
          bio: data.bio || "",
          imageFile: null,
          imagePublicId: extractPublicId(data.image) || null,
        });
        setImagePreviewUrl(data.image || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to fetch user profile");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user?._id, user?.token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file, imagePublicId: null });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let publicId = formData.imagePublicId;

      if (formData.imageFile) {
        publicId = await uploadToCloudinary(formData.imageFile);
        setFormData((prev) => ({ ...prev, imagePublicId: extractPublicId(publicId) }));
        setImagePreviewUrl(null);
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        image: publicId || "",
        dob: formData.dob || "",
        bio: formData.bio || "",
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/update-user/${user._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success(response.data.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const cldImage = formData.imagePublicId
    ? cld
        .image(formData.imagePublicId)
        .format("auto")
        .quality("auto")
        .resize(auto().gravity(autoGravity()).width(128).height(128))
    : null;

  if (!user || !user._id || (isLoading && !formData.username)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information.</p>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  {cldImage ? (
                    <AdvancedImage cldImg={cldImage} />
                  ) : imagePreviewUrl ? (
                    <AvatarImage src={imagePreviewUrl} alt="Preview" />
                  ) : (
                    <AvatarFallback>{formData.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer"
                >
                  <CameraIcon className="h-5 w-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">Bio</label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a little bit about yourself"
                className="resize-none min-h-[120px]"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;