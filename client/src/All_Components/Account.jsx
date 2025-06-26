import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Bell, Eye, Mail, MessageSquare, Settings } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import { Cloudinary } from "@cloudinary/url-gen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CameraIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

const Account = () => {
  const [amount, setAmount] = useState(0)
  const fee = 0.5
  const total = amount + fee
const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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


  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      return toast.error("User not logged in");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Adjust based on your auth setup
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/update-password/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token if required
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" px-2 sm:px-4">
      <div className=" max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <div className="card-1 shadow-sm p-2 rounded-sm sm:p-4 border flex justify-start items-center border-gray-200 bg-white">
             <div className="w-full flex items-start gap-6">
  
  <div className="w-full space-y-6">
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

            </div>
         
          <Card className="w-full mx-auto shadow-none rounded-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
        <CardDescription>Enter your current password and choose a new password</CardDescription>
      </CardHeader>
      <form onSubmit={handleChangePassword}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                className="pr-10"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Eye />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className="pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Eye />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Password Repeat</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Eye />
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-2">
          <Button variant="brand" type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
            <Lock className="mr-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
          <div className="card-5 shadow-sm bg-white rounded-sm border border-gray-200">
            <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <span className="text-lg font-medium">Transfer money</span>
            {/* <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200" /> */}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="bank-account" className="block text-sm font-medium text-gray-900">
                  Select your bank account
                </label>
                <Select>
                  <SelectTrigger id="bank-account" className="w-full border-gray-300">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account1">Girokonto ••••1234</SelectItem>
                    <SelectItem value="account2">Sparkonto ••••5678</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Wählen Sie einen Betrag</label>
                <div className="text-lg font-medium mb-4">
                  € {amount.toFixed(2)} + € {fee.toFixed(2)} = € {total.toFixed(2)}
                </div>
                <Slider
                  defaultValue={[0]}
                  max={1000}
                  step={1}
                  value={[amount]}
                  onValueChange={(values) => setAmount(values[0])}
                  className="py-4"
                  thumbClassName="h-5 w-5 bg-blue-500"
                  trackClassName="h-2 bg-blue-100"
                />
              </div>

              <Button variant="brand" className=" text-white px-6 py-2 rounded uppercase text-sm font-medium">
                Lift Up
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
          </div>
         
          </div>

          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
