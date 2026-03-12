import {
  AlignJustify,
  Wallet,
  Check,
  CreditCard,
  DollarSign,
  Award,
  Sparkles,
  Zap,
  ChevronLeft,
  Menu,
  X,
  User,
  UserCircle,
  Star,
  LogIn,
  UserPlus,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

export default function Navbar({ onOpenPaymentModal }) {
  const [menubar, setMenubar] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [calculatedCredits, setCalculatedCredits] = useState(null);

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Predefined USD credit plans
  const usdCreditPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      amount: 10, // $10 USD
      credits: 10,
      totalCredits: 10,
      bonusCredits: 0,
      description: '10 Credits for $10',
      pricePerCredit: 1.00,
      popular: false
    },
    {
      id: 'popular',
      name: 'Popular Plan',
      amount: 20, // $20 USD
      credits: 20,
      totalCredits: 22,
      bonusCredits: 2,
      description: '20 Credits + 2 Bonus = 22 Credits for $20',
      pricePerCredit: 0.91,
      popular: true
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      amount: 50, // $50 USD
      credits: 50,
      totalCredits: 60,
      bonusCredits: 10,
      description: '50 Credits + 10 Bonus = 60 Credits for $50',
      pricePerCredit: 0.83,
      popular: false
    }
  ];

  const openPaymentModal = useCallback(() => {
    setIsPaymentModalOpen(true);
    // Set default plan
    setSelectedPlan(usdCreditPlans[0]);
    setCustomAmount('');
    setCalculatedCredits(null);
  }, []);

  useEffect(() => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal(openPaymentModal);
    }
  }, [onOpenPaymentModal, openPaymentModal]);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoadingBalance(false);
      return;
    }
    // Initialize Socket.IO connection
    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);
    // Handle connection
    newSocket.on("connect", () => {
      console.log("Socket.IO connected, joining room:", user._id);
      newSocket.emit("join", user._id);
    });
    // Listen for walletUpdate event
    newSocket.on("walletUpdate", (data) => {
      console.log("Received walletUpdate:", data);
      setWalletBalance(data.credits || 0);
      setIsLoadingBalance(false);
    });
    // Handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection issue. Please check your network.");
      setIsLoadingBalance(false);
    });
    // Fetch initial wallet balance
    const fetchWalletBalance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setIsLoadingBalance(false);
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/wallet/balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        console.log("Fetched wallet balance:", response.data);
        setWalletBalance(response.data.credits || 0);
        setIsLoadingBalance(false);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setWalletBalance(0);
        setIsLoadingBalance(false);
      }
    };
    fetchWalletBalance();
    // Polling every 30 seconds as a fallback
    const pollingInterval = setInterval(fetchWalletBalance, 30000);
    // Cleanup on unmount
    return () => {
      console.log("Disconnecting Socket.IO and clearing polling");
      newSocket.disconnect();
      setSocket(null);
      clearInterval(pollingInterval);
    };
  }, [user, authLoading]);

  const handleMenu = useCallback(() => {
    setMenubar((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Logout successful");
    navigate("/");
  }, [logout, navigate]);

  // Calculate bonus credits
  const calculateBonusCredits = (amount) => {
    if (amount >= 100) return 25;
    if (amount >= 50) return 10;
    if (amount >= 25) return 2;
    return 0;
  };

  // Handle custom amount calculation
  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      if (value && parseFloat(value) >= 5) {
        const amount = parseFloat(value);
        const baseCredits = Math.floor(amount);
        const bonusCredits = calculateBonusCredits(amount);
        const totalCredits = baseCredits + bonusCredits;
        const bonusPercentage = bonusCredits > 0 ? Math.round((bonusCredits / baseCredits) * 100) : 0;
       
        setCalculatedCredits({
          amount,
          baseCredits,
          bonusCredits,
          totalCredits,
          bonusPercentage
        });
      } else {
        setCalculatedCredits(null);
      }
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setCustomAmount('');
    setCalculatedCredits(null);
  };

  const handlePayment = useCallback(async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    // Validate custom amount
    if (selectedPlan.id === 'custom') {
      if (!customAmount || parseFloat(customAmount) < 5) {
        toast.error('Minimum amount is $5');
        return;
      }
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to make a purchase");
        navigate("/login");
        return;
      }
      let paymentData;
      if (selectedPlan.id !== 'custom') {
        // Handle predefined plan
        paymentData = {
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.amount,
          credits: selectedPlan.credits,
          totalCredits: selectedPlan.totalCredits,
          bonusCredits: selectedPlan.bonusCredits,
          paymentMethod: 'stripe_checkout'
        };
      } else {
        // Handle custom amount
        const finalAmount = parseFloat(customAmount);
        const baseCredits = Math.floor(finalAmount);
        const bonusCredits = calculateBonusCredits(finalAmount);
        const totalCredits = baseCredits + bonusCredits;
        paymentData = {
          planId: 'custom',
          planName: 'Custom Amount',
          amount: finalAmount,
          credits: baseCredits,
          totalCredits: totalCredits,
          bonusCredits: bonusCredits,
          paymentMethod: 'stripe'
        };
      }
      // Create Stripe payment
      const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/api/payments/topup`,
    paymentData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );
  console.log('Payment response:', response.data);
      if (response.data.success) {
    if (response.data.url) {
      // Store the payment ID for later reference
      if (response.data.paymentId) {
        localStorage.setItem('lastPaymentId', response.data.paymentId);
      }
     
      // Redirect to Stripe Checkout
      toast.success('Redirecting to Stripe checkout...');
      setTimeout(() => {
        window.location.href = response.data.url;
      }, 1000);
    } else if (response.data.clientSecret) {
      // Store payment intent for card payment page
      localStorage.setItem('paymentIntent', response.data.clientSecret);
      localStorage.setItem('paymentId', response.data.paymentId);
      localStorage.setItem('paymentAmount', paymentData.amount);
     
      toast.success('Please complete your payment on the next page...');
      window.location.href = `/payment/card?paymentId=${response.data.paymentId}`;
    }
   else {
          toast.success('Payment initiated successfully!');
          setIsPaymentModalOpen(false);
        }
      } else {
        toast.error(response.data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, customAmount, navigate]);

  // Animation variants
  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };
  const balanceVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const renderPlanBenefits = (plan) => {
    if (plan.bonusCredits > 0) {
      return (
        <div className="mt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" style={{ color: colors.antiqueGold }} />
          <span className="text-xs font-medium" style={{ color: colors.antiqueGold }}>
            +{plan.bonusCredits} bonus credits
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {menubar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMenu}
        />
      )}
     
      <div
        className={`w-full lg:hidden duration-300 transition-all fixed top-[95px] z-50 ${
          menubar ? "left-0" : "left-[-100%]"
        }`}
      >
        <motion.ul
          className="w-full flex flex-col gap-4 py-4 px-4 h-screen"
          style={{ backgroundColor: colors.softIvory }}
          initial="hidden"
          animate={menubar ? "visible" : "hidden"}
          exit="exit"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/" className="block py-2">
              <span className="text-lg font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                Home
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/about" className="block py-2">
              <span className="text-lg font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                About
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/psychics" className="block py-2">
              <span className="text-lg font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                Psychics
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/contact" className="block py-2">
              <span className="text-lg font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                Contact
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/terms-&-conditions" className="block py-2">
              <span className="text-lg font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                Terms & Conditions
              </span>
            </Link>
          </motion.li>
          
          {/* Mobile Authentication Section */}
          {user && (
            <>
              <motion.li variants={menuItemVariants} className="py-2 border-t pt-4" style={{ borderColor: colors.antiqueGold + "30" }}>
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                  <span className="font-medium" style={{ color: colors.deepPurple }}>{user.name || user.email}</span>
                </div>
              </motion.li>
              <motion.li variants={menuItemVariants} className="py-2">
                <Link
                  onClick={handleMenu}
                  to="/dashboard"
                  className="inline-block text-lg font-medium px-4 py-2 rounded-md transition-all duration-200 border w-full"
                  style={{
                    backgroundColor: colors.softIvory,
                    color: colors.deepPurple,
                    borderColor: colors.antiqueGold
                  }}
                >
                  User Dashboard
                </Link>
              </motion.li>
              <motion.li variants={menuItemVariants} className="py-2">
                <Link
                  onClick={handleMenu}
                  to="/psychic/dashboard"
                  className="inline-block text-lg font-medium px-4 py-2 rounded-md transition-all duration-200 border w-full"
                  style={{
                    backgroundColor: colors.softIvory,
                    color: colors.deepPurple,
                    borderColor: colors.antiqueGold
                  }}
                >
                  Psychic Dashboard
                </Link>
              </motion.li>
              <motion.li variants={menuItemVariants} className="py-2">
                <button
                  onClick={() => {
                    handleMenu();
                    handleLogout();
                  }}
                  className="inline-block text-lg font-medium px-4 py-2 rounded-md transition-all duration-200 w-full text-left border"
                  style={{
                    backgroundColor: colors.softIvory,
                    color: '#dc2626',
                    borderColor: '#dc2626'
                  }}
                >
                  Logout
                </button>
              </motion.li>
            </>
          )}
          
          {!user && (
            <>
              <motion.li variants={menuItemVariants} className="py-2 border-t pt-4" style={{ borderColor: colors.antiqueGold + "30" }}>
                <span className="text-sm font-medium block mb-2" style={{ color: colors.antiqueGold }}>USER ACCESS</span>
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={handleMenu}>
                    <Button
                      variant="outline"
                      className="text-sm w-full justify-start transition-colors duration-300 px-4 py-2"
                      style={{
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderColor: colors.antiqueGold
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      User Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={handleMenu}>
                    <Button
                      variant="outline"
                      className="text-sm w-full justify-start transition-colors duration-300 px-4 py-2"
                      style={{
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderColor: colors.antiqueGold
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      User Sign Up
                    </Button>
                  </Link>
                </div>
              </motion.li>
              
              <motion.li variants={menuItemVariants} className="py-2">
                <span className="text-sm font-medium block mb-2" style={{ color: colors.antiqueGold }}>PSYCHIC ACCESS</span>
                <div className="flex flex-col gap-2">
                  <Link to="/psychic/login" onClick={handleMenu}>
                    <Button
                      variant="outline"
                      className="text-sm w-full justify-start transition-colors duration-300 px-4 py-2"
                      style={{
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderColor: colors.antiqueGold
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Psychic Sign In
                    </Button>
                  </Link>
                  <Link to="/psychic/register" onClick={handleMenu}>
                    <Button
                      variant="outline"
                      className="text-sm w-full justify-start transition-colors duration-300 px-4 py-2"
                      style={{
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderColor: colors.antiqueGold
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Psychic Sign Up
                    </Button>
                  </Link>
                </div>
              </motion.li>
            </>
          )}
        </motion.ul>
      </div>
     
      {/* Main Header */}
      <header className="overflow-hidden border-b top-0 z-[100] shadow-sm relative" style={{ backgroundColor: colors.softIvory }}>
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex justify-between items-center">
            {/* Left: Company Name */}
            <div className="flex items-center min-w-0 flex-1">
              <Link to="/" className="min-w-0">
                <motion.div
                  className="flex flex-col items-start min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-2xl font-serif font-bold tracking-tight truncate" style={{ color: colors.deepPurple }}>
                    HecateVoyance
                  </span>
                  <span className="text-xs font-medium tracking-wider truncate" style={{ color: colors.antiqueGold }}>
                    SPIRITUAL GUIDANCE
                  </span>
                </motion.div>
              </Link>
            </div>
            
            {/* Center: Navigation Links (Desktop only) */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <motion.ul
                className="flex items-center gap-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.li variants={menuItemVariants}>
                  <Link to="/">
                    <span className="text-base font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                      Home
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/about">
                    <span className="text-base font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                      About
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/psychics">
                    <span className="text-base font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                      Psychics
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/contact">
                    <span className="text-base font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                      Contact
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/terms-&-conditions">
                    <span className="text-base font-medium hover:opacity-80 transition-opacity cursor-pointer" style={{ color: colors.deepPurple }}>
                      Terms & Conditions
                    </span>
                  </Link>
                </motion.li>
              </motion.ul>
            </div>
           
            {/* Right: Auth Dropdown, Wallet & Mobile Menu */}
            <div className="flex items-center gap-4 min-w-0 justify-end flex-1">
              {/* Desktop Auth Dropdown */}
              <div className="hidden lg:flex items-center gap-4">
                {user && (
                  <>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/dashboard"
                        className="inline-block text-base font-medium px-4 py-2 rounded-md transition-all duration-200 border"
                        style={{
                          backgroundColor: colors.softIvory,
                          color: colors.deepPurple,
                          borderColor: colors.antiqueGold
                        }}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                  
                    <motion.div variants={menuItemVariants}>
                      <button
                        onClick={handleLogout}
                        className="inline-block text-base font-medium px-4 py-2 rounded-md transition-all duration-200 border"
                        style={{
                          backgroundColor: colors.softIvory,
                          color: '#dc2626',
                          borderColor: '#dc2626'
                        }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
               
                {!user && (
                  <motion.div variants={menuItemVariants}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-sm px-4 py-2 transition-all duration-200 border flex items-center gap-2"
                          style={{
                            backgroundColor: colors.softIvory,
                            color: colors.deepPurple,
                            borderColor: colors.antiqueGold
                          }}
                        >
                          <User className="w-4 h-4" />
                          <span>Sign In / Register</span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 p-2"
                        style={{
                          backgroundColor: colors.softIvory,
                          borderColor: colors.antiqueGold
                        }}
                      >
                        <DropdownMenuLabel style={{ color: colors.antiqueGold }}>
                          User Access
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/login" 
                            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-opacity-10"
                            style={{ color: colors.deepPurple }}
                          >
                            <LogIn className="w-4 h-4" />
                            <span>User Sign In</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/register" 
                            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-opacity-10"
                            style={{ color: colors.deepPurple }}
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>User Sign Up</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator style={{ backgroundColor: colors.antiqueGold + "30" }} />
                        
                        <DropdownMenuLabel style={{ color: colors.antiqueGold }}>
                          Psychic Access
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/psychic/login" 
                            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-opacity-10"
                            style={{ color: colors.deepPurple }}
                          >
                            <Star className="w-4 h-4" />
                            <span>Psychic Sign In</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/psychic/register" 
                            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-opacity-10"
                            style={{ color: colors.deepPurple }}
                          >
                            <Star className="w-4 h-4" />
                            <span>Psychic Sign Up</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                )}
              </div>
             
              {/* Wallet Button (only for logged-in users) */}
              {user && (
                <div className="flex items-center gap-2">
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        className="inline-block text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.darkPurple})`,
                          color: colors.softIvory
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openPaymentModal}
                      >
                        <Wallet className="h-5 w-5" />
                        {authLoading || isLoadingBalance ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <motion.span
                            key={walletBalance}
                            variants={balanceVariants}
                            initial="initial"
                            animate="animate"
                            className="font-semibold"
                          >
                            {walletBalance.toFixed(0)} Credits
                          </motion.span>
                        )}
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[450px] max-h-[85vh] overflow-y-auto p-6"
                      style={{
                        backgroundColor: colors.softIvory,
                        borderColor: colors.antiqueGold
                      }}>
                      <DialogHeader>
                        <DialogTitle className="text-lg md:text-xl flex items-center gap-2" style={{ color: colors.deepPurple }}>
                          <Award className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                          Buy Chat Credits
                        </DialogTitle>
                        <p className="text-sm mt-1" style={{ color: colors.deepPurple + "CC" }}>
                          1 credit = $1 USD • 1 credit = 1 minute chat
                        </p>
                      </DialogHeader>
                     
                      <div className="space-y-6">
                        {/* Credit Packages Section */}
                        <div className="space-y-3">
                          <h3 className="text-base font-medium flex items-center gap-2" style={{ color: colors.deepPurple }}>
                            <DollarSign className="w-4 h-4" style={{ color: colors.antiqueGold }} />
                            Choose a credit package
                          </h3>
                          <div className="grid gap-3">
                            {usdCreditPlans.map((plan) => (
                              <motion.div
                                key={plan.id}
                                className={`border rounded-xl p-4 cursor-pointer transition-all relative ${
                                  selectedPlan?.id === plan.id
                                    ? "bg-gradient-to-br from-white to-gray-50 shadow-md ring-2"
                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                                style={{
                                  borderColor: selectedPlan?.id === plan.id ? colors.antiqueGold : undefined,
                                  ringColor: selectedPlan?.id === plan.id ? colors.antiqueGold + "40" : undefined
                                }}
                                onClick={() => handlePlanSelect(plan)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                {plan.popular && (
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <div className="px-3 py-1 rounded-full shadow-sm text-xs font-bold"
                                      style={{
                                        background: `linear-gradient(135deg, ${colors.antiqueGold}, ${colors.lightGold})`,
                                        color: colors.deepPurple
                                      }}>
                                      🏆 POPULAR
                                    </div>
                                  </div>
                                )}
                               
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-base" style={{ color: colors.deepPurple }}>{plan.name}</h4>
                                      {plan.bonusCredits > 0 && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                                          style={{
                                            backgroundColor: colors.lightGold,
                                            color: colors.deepPurple,
                                            borderColor: colors.antiqueGold
                                          }}>
                                          +{plan.bonusCredits} BONUS
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm mb-2" style={{ color: colors.deepPurple + "CC" }}>
                                      {plan.totalCredits} credits ({plan.totalCredits} minutes)
                                    </p>
                                    {renderPlanBenefits(plan)}
                                  </div>
                                  <div className="text-right min-w-[100px]">
                                    <div className="mb-1">
                                      <p className="font-extrabold text-lg" style={{ color: colors.deepPurple }}>${plan.amount}</p>
                                      <p className="text-xs font-medium" style={{ color: colors.deepPurple + "CC" }}>
                                        USD
                                      </p>
                                    </div>
                                    <div className="rounded-lg p-1.5" style={{ backgroundColor: colors.lightGold }}>
                                      <p className="text-xs font-semibold" style={{ color: colors.deepPurple }}>
                                        ${plan.pricePerCredit.toFixed(2)}/credit
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {selectedPlan?.id === plan.id && (
                                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.antiqueGold + "30" }}>
                                    <div className="flex items-center justify-center gap-2 font-medium"
                                      style={{ color: colors.antiqueGold }}>
                                      <Check className="w-4 h-4" />
                                      <span className="text-sm">Selected</span>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                            {/* Custom Amount Option */}
                            <motion.div
                              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                selectedPlan?.id === 'custom'
                                  ? "bg-gradient-to-br from-white to-gray-50 shadow-md ring-2"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              }`}
                              style={{
                                borderColor: selectedPlan?.id === 'custom' ? colors.antiqueGold : undefined,
                                ringColor: selectedPlan?.id === 'custom' ? colors.antiqueGold + "40" : undefined
                              }}
                              onClick={() => handlePlanSelect({ id: 'custom', name: 'Custom Amount' })}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl" style={{ backgroundColor: colors.lightGold }}>
                                    <DollarSign className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-base" style={{ color: colors.deepPurple }}>Custom Amount</h4>
                                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Choose your own amount (min $5)</p>
                                  </div>
                                </div>
                                {selectedPlan?.id === 'custom' && (
                                  <div className="p-1 rounded-full" style={{ backgroundColor: colors.lightGold }}>
                                    <Check className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                                  </div>
                                )}
                              </div>
                             
                              {selectedPlan?.id === 'custom' && (
                                <div className="mt-4 space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: colors.deepPurple }}>
                                      Enter amount in USD (Minimum $5)
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="font-bold" style={{ color: colors.deepPurple }}>$</span>
                                      </div>
                                      <input
                                        type="text"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        placeholder="Enter amount"
                                        className="block w-full pl-7 pr-12 py-3 border rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                          borderColor: colors.antiqueGold,
                                          backgroundColor: 'white',
                                          color: colors.deepPurple,
                                          focusRingColor: colors.antiqueGold
                                        }}
                                      />
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="font-medium" style={{ color: colors.deepPurple + "CC" }}>USD</span>
                                      </div>
                                    </div>
                                  </div>
                                 
                                  {/* Preview for custom amount */}
                                  {calculatedCredits && (
                                    <div className="border rounded-xl p-4 animate-in fade-in duration-300"
                                      style={{
                                        backgroundColor: colors.lightGold,
                                        borderColor: colors.antiqueGold + "30"
                                      }}>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-1">
                                          <p className="font-medium" style={{ color: colors.deepPurple }}>Amount:</p>
                                          <p className="font-bold text-lg" style={{ color: colors.deepPurple }}>
                                            ${calculatedCredits.amount.toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="font-medium" style={{ color: colors.deepPurple }}>Base Credits:</p>
                                          <p className="font-bold text-lg" style={{ color: colors.deepPurple }}>
                                            {calculatedCredits.baseCredits} credits
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="font-medium" style={{ color: colors.deepPurple }}>Bonus Credits:</p>
                                          <p className="font-bold text-lg" style={{ color: colors.antiqueGold }}>
                                            +{calculatedCredits.bonusCredits} credits
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="font-medium" style={{ color: colors.deepPurple }}>Total Credits:</p>
                                          <p className="font-bold text-lg" style={{ color: colors.deepPurple }}>
                                            {calculatedCredits.totalCredits} credits
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                 
                                  {customAmount && parseFloat(customAmount) < 5 && (
                                    <div className="mt-2 border rounded-lg p-3"
                                      style={{
                                        backgroundColor: '#fef2f2',
                                        borderColor: '#dc2626'
                                      }}>
                                      <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                                        ⚠️ Minimum amount is $5 USD
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </div>
                        {/* Payment Method Section */}
                        <div className="space-y-3">
                          <h3 className="text-base font-medium flex items-center gap-2" style={{ color: colors.deepPurple }}>
                            <CreditCard className="w-4 h-4" style={{ color: colors.antiqueGold }} />
                            Select Payment Method
                          </h3>
                          <div className="space-y-2">
                            <motion.button
                              className={`w-full flex justify-between items-center py-3 px-4 border rounded-lg text-base transition-all ${
                                selectedPaymentMethod === "card"
                                  ? "bg-gradient-to-br from-white to-gray-50 shadow-sm ring-2"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              }`}
                              style={{
                                borderColor: selectedPaymentMethod === "card" ? colors.antiqueGold : undefined,
                                ringColor: selectedPaymentMethod === "card" ? colors.antiqueGold + "40" : undefined
                              }}
                              onClick={() => setSelectedPaymentMethod("card")}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                                  <CreditCard className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                                </div>
                                <div className="text-left">
                                  <span className="font-bold block" style={{ color: colors.deepPurple }}>Credit/Debit Card</span>
                                  <span className="text-xs" style={{ color: colors.deepPurple + "CC" }}>Pay securely with Visa, Mastercard, Amex</span>
                                </div>
                              </div>
                              {selectedPaymentMethod === "card" && (
                                <div className="p-1 rounded-full" style={{ backgroundColor: colors.lightGold }}>
                                  <Check className="w-5 h-5" style={{ color: colors.antiqueGold }} />
                                </div>
                              )}
                            </motion.button>
                            {/* Payment Icons */}
                            <div className="flex items-center justify-center gap-4 pt-3 px-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src="https://js.stripe.com/v3/fingerprinted/img/visa-3659c4f5c0968b2b4c5c8a0e5e8b8c7b.svg"
                                  alt="Visa"
                                  className="h-6"
                                />
                                <img
                                  src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
                                  alt="Mastercard"
                                  className="h-6"
                                />
                                <img
                                  src="https://js.stripe.com/v3/fingerprinted/img/amex-a8a6aef5a7bd4bdc99b14fcb4f2c5d5d.svg"
                                  alt="American Express"
                                  className="h-6"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Summary and Payment Button */}
                        <div className="space-y-4 pt-2 border-t">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Selected:</span>
                              <span className="font-bold text-gray-900">
                                {selectedPlan?.name || 'No plan selected'}
                              </span>
                            </div>
                           
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Amount:</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                ${(selectedPlan?.id === 'custom' && customAmount ? parseFloat(customAmount) : selectedPlan?.amount || 0).toFixed(2)} USD
                              </span>
                            </div>
                           
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">You Receive:</span>
                              <span className="text-xl font-extrabold text-blue-600 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                {selectedPlan?.id === 'custom' && calculatedCredits
                                  ? `${calculatedCredits.totalCredits} credits`
                                  : selectedPlan?.totalCredits
                                    ? `${selectedPlan.totalCredits} credits`
                                    : '0 credits'
                                }
                              </span>
                            </div>
                           
                            {selectedPlan?.bonusCredits > 0 && (
                              <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-2">
                                <span className="text-gray-700 font-medium">Bonus Included:</span>
                                <span className="font-bold text-yellow-600">
                                  +{selectedPlan.bonusCredits} credits
                                </span>
                              </div>
                            )}
                          </div>
                          <motion.button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            disabled={
                              isProcessing ||
                              !selectedPlan ||
                              (selectedPlan?.id === 'custom' && (!customAmount || parseFloat(customAmount) < 5))
                            }
                            onClick={handlePayment}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isProcessing ? (
                              <div className="flex items-center gap-2 justify-center">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="font-semibold">Processing Payment...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                <span>
                                  {selectedPlan?.id === 'custom'
                                    ? `Pay $${parseFloat(customAmount || 0).toFixed(2)} USD`
                                    : `Pay $${selectedPlan?.amount?.toFixed(2) || 0} USD`
                                  }
                                </span>
                              </div>
                            )}
                          </motion.button>
                         
                          <div className="text-center space-y-1.5">
                            <p className="text-xs text-gray-500">
                              🔒 Secure payment powered by Stripe
                            </p>
                            <p className="text-xs text-gray-500">
                              💳 Your payment information is encrypted and secure
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={handleMenu}
                aria-label="Toggle menu"
              >
                {menubar ? (
                  <X className="h-6 w-6" style={{ color: colors.deepPurple }} />
                ) : (
                  <Menu className="h-6 w-6" style={{ color: colors.deepPurple }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}