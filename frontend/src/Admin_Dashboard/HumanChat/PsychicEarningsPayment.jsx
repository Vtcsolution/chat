import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { 
  Loader2, 
  X, 
  DollarSign, 
  Wallet, 
  History, 
  Eye,
  CheckCircle,
  Image as ImageIcon,
  User,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Phone,
  CreditCard,
  Banknote,
  Upload,
  Download
} from "lucide-react";
import { toast } from "sonner";
import Dashboard_Navbar from "../Admin_Navbar";
import Doctor_Side_Bar from "../SideBar";

// Color scheme matching your app
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

export default function PsychicEarningsPayment() {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [side, setSide] = useState(false);
  
  // State for psychics list
  const [psychics, setPsychics] = useState([]);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPsychics, setLoadingPsychics] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");
  
  // Image upload states
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [paymentPreviewUrl, setPaymentPreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // View payment details modal
  const [viewPaymentModal, setViewPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch all psychics on component mount
  useEffect(() => {
    fetchAllPsychics();
  }, []);

  // Fetch earnings when psychic is selected
  useEffect(() => {
    if (selectedPsychic) {
      fetchPsychicEarningsDetails(selectedPsychic._id);
      fetchPsychicPaymentHistory(selectedPsychic._id);
    }
  }, [selectedPsychic]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (paymentPreviewUrl) {
        URL.revokeObjectURL(paymentPreviewUrl);
      }
    };
  }, [paymentPreviewUrl]);

  // Fetch all psychics from the admin payments endpoint
  const fetchAllPsychics = async () => {
    setLoadingPsychics(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/payments/psychics`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Transform the data to match your frontend structure
        const psychicsList = result.data.map(item => ({
          _id: item._id,
          name: item.name,
          email: item.email,
          image: item.image,
          phone: item.phone,
          category: item.category || 'Psychic',
          currentBalance: item.earnings?.totalPsychicEarnings - (item.paymentSummary?.totalPaid || 0) || 0,
          totalEarned: item.earnings?.totalPsychicEarnings || 0,
          totalPaid: item.paymentSummary?.totalPaid || 0,
          lastPaymentDate: item.paymentSummary?.lastPaymentDate
        }));
        
        setPsychics(psychicsList);
      } else {
        toast.error(result.message || "Failed to fetch psychics");
      }
    } catch (error) {
      console.error("Error fetching psychics:", error);
      toast.error("Failed to connect to server");
    } finally {
      setLoadingPsychics(false);
    }
  };

  // Fetch psychic earnings details
  const fetchPsychicEarningsDetails = async (psychicId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/payments/psychic/${psychicId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const data = result.data;
        
        setEarningsData({
          summary: data.earnings,
          breakdown: {
            chatEarnings: data.earnings?.chatEarnings || 0,
            callEarnings: data.earnings?.callEarnings || 0,
            totalPsychicEarnings: data.earnings?.totalPsychicEarnings || 0,
            platformCommission: data.earnings?.totalPlatformCommission || 0
          },
          recentActivity: {
            totalRecentEarnings: data.sessions
              ?.filter(s => {
                const sessionDate = new Date(s.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return sessionDate >= thirtyDaysAgo;
              })
              .reduce((sum, s) => sum + s.amount, 0) || 0,
            chatSessions: data.sessions?.filter(s => s.type === 'chat') || [],
            callSessions: data.sessions?.filter(s => s.type === 'call') || []
          },
          sessions: data.sessions || [],
          paymentHistory: data.paymentHistory || [],
          splitRatio: data.splitRatio
        });
      } else {
        toast.error(result.message || "Failed to fetch earnings");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch psychic payment history
  const fetchPsychicPaymentHistory = async (psychicId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/payments/psychic/${psychicId}/payments`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Transform payment history
        const paymentHistory = result.data.payments?.map(p => ({
          amount: p.amount,
          paymentId: p.paymentId,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          notes: p.notes,
          paymentScreenshot: p.paymentScreenshot,
          processedBy: p.processedBy,
          status: p.status
        })) || [];
        
        setEarningsData(prev => prev ? {
          ...prev,
          paymentHistory
        } : null);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
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

  // Handle payment screenshot file selection
  const handlePaymentScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file (JPG, PNG, GIF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setPaymentScreenshotFile(file);
      
      // Create preview URL
      if (paymentPreviewUrl) {
        URL.revokeObjectURL(paymentPreviewUrl);
      }
      setPaymentPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Remove payment screenshot
  const removePaymentScreenshot = () => {
    if (paymentPreviewUrl) {
      URL.revokeObjectURL(paymentPreviewUrl);
    }
    setPaymentScreenshotFile(null);
    setPaymentPreviewUrl(null);
  };

  // Process payment
  const handleProcessPayment = async (e) => {
    e.preventDefault();

    if (!selectedPsychic) {
      toast.error("Please select a psychic first");
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!paymentId.trim()) {
      toast.error("Please enter a payment ID/Reference");
      return;
    }

    if (!paymentScreenshotFile) {
      toast.error("Please upload payment screenshot");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > earningsData?.summary?.pendingAmount) {
      toast.error(`Amount ($${amount}) exceeds available balance ($${earningsData?.summary?.pendingAmount?.toFixed(2)})`);
      return;
    }

    setIsProcessingPayment(true);
    setIsUploadingImage(true);

    try {
      // Upload screenshot to Cloudinary first
      toast.info("Uploading payment screenshot...");
      const screenshotUrl = await uploadToCloudinary(paymentScreenshotFile);
      
      toast.info("Processing payment...");

      // Process payment
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/payments/psychic/${selectedPsychic._id}/pay`,
        {
          method: 'POST',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            paymentMethod: paymentMethod,
            paymentId: paymentId,
            notes: paymentNotes,
            paymentScreenshot: screenshotUrl
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Payment of $${amount.toFixed(2)} processed successfully!`);
        
        // Reset form
        setPaymentAmount("");
        setPaymentId("");
        setPaymentMethod("bank_transfer");
        setPaymentNotes("");
        removePaymentScreenshot();
        setIsPaymentModalOpen(false);
        
        // Refresh data
        fetchPsychicEarningsDetails(selectedPsychic._id);
        fetchPsychicPaymentHistory(selectedPsychic._id);
        fetchAllPsychics();
      } else {
        toast.error(result.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment: " + (error.message || "Unknown error"));
    } finally {
      setIsProcessingPayment(false);
      setIsUploadingImage(false);
    }
  };

  // Filter psychics based on search and balance status
  const filteredPsychics = psychics.filter(psychic => {
    const matchesSearch = psychic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         psychic.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "positive") return psychic.currentBalance > 0 && matchesSearch;
    if (filterStatus === "zero") return psychic.currentBalance === 0 && matchesSearch;
    
    return matchesSearch;
  });

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setViewPaymentModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div>
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-side min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/dashboard")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
                  Psychic Earnings & Payments
                </h1>
              </div>
              <Button
                onClick={fetchAllPsychics}
                variant="outline"
                className="border-purple-300 text-purple-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pending Payments</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>
                        {formatCurrency(psychics.reduce((sum, p) => sum + (p.currentBalance || 0), 0))}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Across {psychics.filter(p => p.currentBalance > 0).length} psychics
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Paid</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {formatCurrency(psychics.reduce((sum, p) => sum + (p.totalPaid || 0), 0))}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Lifetime payments to all psychics
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Psychics</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {psychics.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {psychics.filter(p => p.currentBalance > 0).length} with pending balance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Psychics List */}
              <Card className="lg:col-span-1 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-amber-50 border-b border-amber-200">
                  <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: colors.primary }}>
                    <User className="h-5 w-5" style={{ color: colors.secondary }} />
                    Psychics List
                  </CardTitle>
                  <CardDescription>
                    Select a psychic to view details
                  </CardDescription>
                  
                  {/* Search and Filter */}
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by balance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Psychics</SelectItem>
                        <SelectItem value="positive">With Balance</SelectItem>
                        <SelectItem value="zero">Zero Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 max-h-[500px] overflow-y-auto">
                  {loadingPsychics ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : filteredPsychics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No psychics found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPsychics.map((psychic) => (
                        <div
                          key={psychic._id}
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedPsychic?._id === psychic._id
                              ? 'bg-purple-50 border-2 border-purple-300'
                              : 'bg-gray-50 hover:bg-purple-50/50'
                          }`}
                          onClick={() => setSelectedPsychic(psychic)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-100 flex-shrink-0">
                              {psychic.image ? (
                                <img 
                                  src={psychic.image} 
                                  alt={psychic.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-purple-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate" style={{ color: colors.primary }}>
                                {psychic.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {psychic.email}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold" style={{ color: colors.secondary }}>
                                {formatCurrency(psychic.currentBalance)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Balance
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Column - Psychic Details */}
              <Card className="lg:col-span-2 border-0 shadow-xl">
                {selectedPsychic ? (
                  <>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-amber-50 border-b border-amber-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-amber-300">
                            {selectedPsychic.image ? (
                              <img 
                                src={selectedPsychic.image} 
                                alt={selectedPsychic.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-purple-100 flex items-center justify-center">
                                <User className="h-8 w-8 text-purple-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold" style={{ color: colors.primary }}>
                              {selectedPsychic.name}
                            </CardTitle>
                            <CardDescription>
                              {selectedPsychic.email} • {selectedPsychic.category || 'Psychic'}
                            </CardDescription>
                          </div>
                        </div>
                        
                        {/* Payment Button */}
                        {earningsData?.summary?.pendingAmount > 0 && (
                          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Process Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold" style={{ color: colors.primary }}>
                                  Process Payment to {selectedPsychic.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Available Balance: {formatCurrency(earningsData?.summary?.pendingAmount)}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <form onSubmit={handleProcessPayment} className="space-y-4">
                                {/* Amount */}
                                <div className="space-y-2">
                                  <Label htmlFor="amount" className="font-semibold">
                                    Payment Amount ($)
                                  </Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={earningsData?.summary?.pendingAmount}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                  />
                                </div>

                                {/* Payment ID/Reference */}
                                <div className="space-y-2">
                                  <Label htmlFor="paymentId" className="font-semibold">
                                    Payment ID / Reference
                                  </Label>
                                  <Input
                                    id="paymentId"
                                    value={paymentId}
                                    onChange={(e) => setPaymentId(e.target.value)}
                                    placeholder="e.g., TRX123456, Bank Transfer #"
                                    required
                                  />
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                  <Label htmlFor="paymentMethod" className="font-semibold">
                                    Payment Method
                                  </Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                      <SelectItem value="paypal">PayPal</SelectItem>
                                      <SelectItem value="stripe">Stripe</SelectItem>
                                      <SelectItem value="cash">Cash</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Payment Screenshot - Updated with upload functionality */}
                                <div className="space-y-2">
                                  <Label className="font-semibold">
                                    Payment Screenshot *
                                  </Label>
                                  
                                  {!paymentScreenshotFile ? (
                                    <div 
                                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                                      onMouseEnter={() => setIsHovered(true)}
                                      onMouseLeave={() => setIsHovered(false)}
                                      onClick={() => document.getElementById('screenshot-upload').click()}
                                    >
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="screenshot-upload"
                                        onChange={handlePaymentScreenshotChange}
                                      />
                                      <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${isHovered ? 'text-purple-600' : 'text-gray-400'}`} />
                                      <span className="text-sm font-medium text-purple-600 block mb-1">
                                        Click to upload screenshot
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5MB
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="relative rounded-lg overflow-hidden border group">
                                        <img
                                          src={paymentPreviewUrl}
                                          alt="Payment preview"
                                          className="w-full h-40 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="bg-white"
                                            onClick={() => window.open(paymentPreviewUrl, '_blank')}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={removePaymentScreenshot}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      <p className="text-xs mt-1 text-green-600">
                                        ✓ {paymentScreenshotFile.name} ({(paymentScreenshotFile.size / 1024).toFixed(1)} KB)
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                  <Label htmlFor="notes" className="font-semibold">
                                    Notes (Optional)
                                  </Label>
                                  <Textarea
                                    id="notes"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Any additional notes about this payment"
                                    rows={2}
                                  />
                                </div>

                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setIsPaymentModalOpen(false);
                                      removePaymentScreenshot();
                                      setPaymentAmount("");
                                      setPaymentId("");
                                      setPaymentNotes("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={isProcessingPayment || isUploadingImage}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isProcessingPayment || isUploadingImage ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isUploadingImage ? "Uploading..." : "Processing..."}
                                      </>
                                    ) : (
                                      <>
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Process Payment
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                      ) : earningsData ? (
                        <Tabs defaultValue="summary" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                            <TabsTrigger value="history">Payment History</TabsTrigger>
                          </TabsList>

                          {/* Summary Tab */}
                          <TabsContent value="summary" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="border-0 bg-purple-50">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Total Earnings</p>
                                  <p className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
                                    {formatCurrency(earningsData.summary.totalEarnings)}
                                  </p>
                                </CardContent>
                              </Card>
                              
                              <Card className="border-0 bg-green-50">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Total Paid</p>
                                  <p className="text-2xl font-bold text-green-600 mt-1">
                                    {formatCurrency(earningsData.summary.totalPaid)}
                                  </p>
                                </CardContent>
                              </Card>
                              
                              <Card className="border-0 bg-amber-50">
                                <CardContent className="p-4 text-center">
                                  <p className="text-sm text-gray-600">Current Balance</p>
                                  <p className="text-2xl font-bold mt-1" style={{ color: colors.secondary }}>
                                    {formatCurrency(earningsData.summary.pendingAmount)}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Progress Bar */}
                            {earningsData.summary.totalEarnings > 0 && (
                              <Card className="border-0">
                                <CardContent className="p-4">
                                  <div className="flex justify-between text-sm mb-2">
                                    <span>Paid: {formatCurrency(earningsData.summary.totalPaid)}</span>
                                    <span>Remaining: {formatCurrency(earningsData.summary.pendingAmount)}</span>
                                  </div>
                                  <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                      style={{ 
                                        width: `${(earningsData.summary.totalPaid / earningsData.summary.totalEarnings) * 100}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-center mt-2 text-gray-500">
                                    {((earningsData.summary.totalPaid / earningsData.summary.totalEarnings) * 100).toFixed(1)}% Paid
                                  </p>
                                </CardContent>
                              </Card>
                            )}

                            {/* Split Ratio Info */}
                            {earningsData.splitRatio && (
                              <Card className="border-0 bg-gradient-to-r from-purple-50 to-amber-50">
                                <CardContent className="p-4">
                                  <p className="text-sm font-medium mb-2">Revenue Split</p>
                                  <div className="flex justify-between text-sm">
                                    <span>Psychic ({(earningsData.splitRatio.psychic * 100).toFixed(0)}%):</span>
                                    <span className="font-semibold" style={{ color: colors.primary }}>
                                      {formatCurrency(earningsData.breakdown.totalPsychicEarnings)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span>Platform ({(earningsData.splitRatio.platform * 100).toFixed(0)}%):</span>
                                    <span className="font-semibold text-amber-600">
                                      {formatCurrency(earningsData.breakdown.platformCommission)}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Recent Activity */}
                            {earningsData.recentActivity && (
                              <Card className="border-0">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Recent Activity (30 Days)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Chat Sessions:</span>
                                      <span className="font-semibold">{earningsData.recentActivity.chatSessions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Call Sessions:</span>
                                      <span className="font-semibold">{earningsData.recentActivity.callSessions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                      <span>Recent Earnings:</span>
                                      <span style={{ color: colors.secondary }}>
                                        {formatCurrency(earningsData.recentActivity.totalRecentEarnings)}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>

                          {/* Breakdown Tab */}
                          <TabsContent value="breakdown" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="border-0">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" style={{ color: colors.secondary }} />
                                    Chat Earnings
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                                    {formatCurrency(earningsData.breakdown.chatEarnings)}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    From {earningsData.recentActivity?.chatSessions?.length || 0} recent sessions
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="border-0">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Phone className="h-4 w-4" style={{ color: colors.secondary }} />
                                    Call Earnings
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                                    {formatCurrency(earningsData.breakdown.callEarnings)}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    From {earningsData.recentActivity?.callSessions?.length || 0} recent calls
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Sessions List */}
                            {earningsData.sessions && earningsData.sessions.length > 0 && (
                              <Card className="border-0">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Recent Sessions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {earningsData.sessions.slice(0, 5).map((session, idx) => (
                                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                              {session.type === 'chat' ? '💬 Chat' : '📞 Call'}
                                            </span>
                                            <p className="text-sm mt-1">
                                              Amount: {formatCurrency(session.amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {formatDate(session.date)} • {session.duration} min
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>

                          {/* Payment History Tab */}
                          <TabsContent value="history">
                            <Card className="border-0">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <History className="h-4 w-4" style={{ color: colors.secondary }} />
                                  Payment History
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {earningsData.paymentHistory?.length > 0 ? (
                                  <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {earningsData.paymentHistory.map((payment, idx) => (
                                      <div
                                        key={idx}
                                        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                                        onClick={() => viewPaymentDetails(payment)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-semibold text-green-600">
                                              +{formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              ID: {payment.paymentId}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {payment.paymentMethod?.replace('_', ' ')}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {formatDate(payment.paymentDate)}
                                              </span>
                                            </div>
                                            {payment.paymentScreenshot && (
                                              <div className="mt-2">
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                  <ImageIcon className="h-3 w-3" />
                                                  Screenshot attached
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-center text-gray-500 py-4">
                                    No payment history yet
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          Select a psychic to view earnings details
                        </div>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select a psychic from the list to view details</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* View Payment Details Modal - Updated with image viewer */}
      <Dialog open={viewPaymentModal} onOpenChange={setViewPaymentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: colors.primary }}>
              Payment Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-green-600">+{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedPayment.paymentMethod?.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Payment ID</p>
                <p className="font-mono text-sm p-2 bg-gray-50 rounded-lg">{selectedPayment.paymentId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Payment Date</p>
                <p>{formatDate(selectedPayment.paymentDate)}</p>
              </div>

              {selectedPayment.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="p-3 bg-gray-50 rounded-lg">{selectedPayment.notes}</p>
                </div>
              )}

              {selectedPayment.paymentScreenshot && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Payment Screenshot</p>
                  <div className="relative group">
                    <img
                      src={selectedPayment.paymentScreenshot}
                      alt="Payment proof"
                      className="w-full rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                      onClick={() => window.open(selectedPayment.paymentScreenshot, '_blank')}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(selectedPayment.paymentScreenshot, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedPayment.status === 'processed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedPayment.status || 'Processed'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewPaymentModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}