/* eslint-disable no-unused-vars */
import {
  AlignJustify,
  Settings,
  User,
  Wallet,
  X,
  Minus,
  Plus,
  BanknoteIcon as Bank,
  Check,
  ChevronDown,
  ChevronUp,
  LogOutIcon,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  Heart,
  Calendar,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";

export default function Navbar() {
  const [menubar, setMenubar] = useState(false);
  const {user, logout} = useAuth();
  const navigate = useNavigate();

  const handleMenu = () => {
    setMenubar(!menubar);
  };

 const handleLogout = () =>{
 logout();
 toast.success('Logout successful');
 navigate('/');

 }
  const [openDropdown, setOpenDropdown] = useState(null);


  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Message",
      message: "Sarah sent you a message: 'Hey, how are you doing?'",
      time: "2 min ago",
      read: false,
      type: "message",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      title: "Order Confirmed",
      message: "Your order #12345 has been confirmed and is being processed.",
      time: "15 min ago",
      read: false,
      type: "purchase",
    },
    {
      id: "3",
      title: "New Like",
      message: "Michael liked your recent post 'My new project launch'",
      time: "1 hour ago",
      read: false,
      type: "like",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      title: "Meeting Reminder",
      message: "You have a team meeting scheduled in 30 minutes.",
      time: "2 hours ago",
      read: true,
      type: "reminder",
    },
    {
      id: "5",
      title: "Security Alert",
      message: "Unusual login attempt detected from a new device.",
      time: "Yesterday",
      read: true,
      type: "alert",
    },
    {
      id: "6",
      title: "System Update",
      message:
        "The platform will be updated tonight at 2 AM. Expect 10 minutes downtime.",
      time: "2 days ago",
      read: true,
      type: "info",
    },
  ]);
  // const [navbarb, setNavbarb] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)

   const closeAllMenus = () => {
    // setOpenMenus({})
    setIsMobileProfileOpen(false)
    setMenubar(false)

  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    closeAllMenus()
  }

  const toggleMobileProfile = () => {
    setIsMobileProfileOpen(!isMobileProfileOpen)
  }
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };
  const toggleDropdown1 = () => {
    setIsOpen(!isOpen)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-rose-500" />;
      case "reminder":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
        return <Info className="h-4 w-4 text-sky-500" />;
    }
  };
  const [amount, setAmount] = useState(5);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const handleAmountChange = (value) => {
    if (value >= 1) {
      setAmount(value);
    }
  };

  const handlePresetAmount = (value) => {
    setAmount(value);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };
  
 

  return (
    <>
      <div
        className={`w-full lg:hidden duration-300 transition-all ${
          menubar ? "left-0" : "left-[-100%]"
        } absolute top-[95px] z-50`}
      >
        <ul className="w-full flex flex-col gap-4 bg-[#EEEEEE] py-4 px-4">
        

               <Link onClick={closeAllMenus} to="/about">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  About
                </li>
               </Link>
        <Link onClick={closeAllMenus} to="/vedic-astrologers">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Vedic Astrologer
                </li>
                </Link>
                <Link onClick={closeAllMenus} to="/numerology">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Numerology
                </li>
                </Link>
                 <Link onClick={closeAllMenus} to="/tarot-readers">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Tarot Readers
                </li>
                </Link>
               <Link onClick={closeAllMenus} to="love-astrologer">
                 <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Love Astrologer
                </li>
               </Link>
               <Link onClick={closeAllMenus} to="/contact">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Contact
                </li>
               </Link>
               <Link onClick={closeAllMenus} to="terms-&-conditions">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Terms & Conditions
                </li>
               </Link>
                <div className=" flex items-center gap-1">
                <Button variant="outline" className="text-sm w-full">Sign In / Up</Button>
                </div>
          <li>
                    <div className="pt-4 pb-3 w-full border border-gray-200 rouned-md shadow-sm">
             <div className="flex items-center px-5">
               <div className="flex-shrink-0">
                 <div className="relative">
                   <img className="w-10 h-10 rounded-full" src="" alt="User Avatar" />
                   <span className="top-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
                 </div>
               </div>
               <div className="ml-3">
                 <div className="text-base font-medium text-gray-800">ali</div>
                 <div className="text-sm font-medium text-gray-500">ali@gmail.com</div>
               </div>
             </div>
             (user && {
                    <div className='p-2'>
                     <Link to="/dashboard" onClick={()=>{toggleMobileProfile();toggleMobileMenu()}}><p className='flex items-center gap-1 cursor-pointer my-4 text-black'> <LayoutDashboard/> 
 DashBoad</p></Link>
                     <Link to="/update-profile" onClick={()=>{toggleMobileProfile();toggleMobileMenu()}}><p className='flex items-center gap-1 cursor-pointer my-4 text-black'><User/> Update Profile</p></Link>
                     <p className=' cursor-pointer my-4 text-black flex items-center gap-1' ><LogOutIcon/> Logout</p>
                   </div>
                   })
           </div>
                  </li>
                  
        </ul>
      </div>
      <header className="overflow-hidden border-b top-0 bg-[#EEEEEE] z-[100] shadow-sm">
        <div className="container mx-auto px-4 py-3  max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Link to="/">
                <img
                  src="/images/newLogo.jpg"
                  alt="logo"
                  className="h-18 w-18 rounded-full object-cover"
                />
              </Link>
              {/* <span className="font-bold text-xl text-white">Advisor</span> */}
            </div>
            <div className=" flex items-center gap-4">
              <ul className="flex max-lg:hidden items-center gap-2 w-full">
                {/* Desktop Dropdown 1 */}
              

                <Link to="/about">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  About
                </li>
                </Link>
                <Link to="/vedic-astrologers">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Vedic Astrologer
                </li>
                </Link>
                <Link to="/numerology">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Numerology
                </li>
                </Link>
                 <Link to="/tarot-readers">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Tarot Readers
                </li>
                </Link>
               <Link to="love-astrologer">
                 <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Love Astrologer
                </li>
               </Link>
                <Link to="/contact">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  Contact
                </li>
                </Link>
                <Link to="/terms-&-conditions">
                  <li className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer">
                  <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="bg-transparent" asChild>
          <Button variant="outline"><ReceiptText/></Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Terms and Conditions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
                </li>
                </Link>
                {!user && (
               <div className=" flex items-center gap-1">
                <Link to="/login"><Button variant="outline" className="text-sm">Sign In / Sign Up</Button></Link>
                </div>
                )}
              </ul>
                <div className="lg:hidden z-[50]">
                  <AlignJustify onClick={handleMenu} />
                </div>
              <div className="flex items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative group w-full flex px-2 text-white bg-[#3B5EB7] rounded-sm py-1 items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      <span>$0.00</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Make Payment</DialogTitle>
                    </DialogHeader>
                    <Card className="w-full max-w-md mx-auto">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xl font-bold">
                          Wallet auffüllen
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Amount Selection */}
                        <div className="space-y-3">
                          <h3 className="text-base font-medium">
                            Wählen Sie einen Betrag
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant={amount === 15 ? "default" : "outline"}
                              className="w-full"
                              onClick={() => handlePresetAmount(15)}
                            >
                              € 15
                            </Button>
                            <Button
                              variant={amount === 30 ? "default" : "outline"}
                              className="w-full"
                              onClick={() => handlePresetAmount(30)}
                            >
                              € 30
                            </Button>
                            <Button
                              variant={amount === 60 ? "default" : "outline"}
                              className="w-full"
                              onClick={() => handlePresetAmount(60)}
                            >
                              € 60
                            </Button>
                          </div>

                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-r-none h-10"
                              onClick={() => handleAmountChange(amount - 1)}
                            >
                              <Minus className="w-4 h-4" />
                              <span className="sr-only">Decrease</span>
                            </Button>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                €
                              </span>
                              <Input
                                type="number"
                                value={amount}
                                onChange={(e) =>
                                  handleAmountChange(Number(e.target.value))
                                }
                                className="pl-8 rounded-none h-10 text-center"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-l-none h-10"
                              onClick={() => handleAmountChange(amount + 1)}
                            >
                              <Plus className="w-4 h-4" />
                              <span className="sr-only">Increase</span>
                            </Button>
                          </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-3">
                          <h3 className="text-base font-medium">
                            Wählen Sie Ihre Zahlungsmethode
                          </h3>

                          <div className="space-y-3">
                            <Button
                              variant="outline"
                              className={`w-full justify-between h-auto py-3 px-4 ${
                                selectedPaymentMethod === "paypal"
                                  ? "border-blue-500 bg-blue-50"
                                  : ""
                              }`}
                              onClick={() =>
                                handlePaymentMethodSelect("paypal")
                              }
                            >
                              <div className="flex items-center space-x-3">
                                <div className="bg-white border border-gray-200 p-1 rounded-md flex items-center justify-center w-10 h-6">
                                  <div className="flex items-center">
                                    <div className="text-[#253b80] font-bold text-xs">
                                      Pay
                                    </div>
                                    <div className="text-[#179bd7] font-bold text-xs">
                                      Pal
                                    </div>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">PAYPAL</div>
                                  <div className="text-xs text-gray-500">
                                    (+3.4%, +45 CENT)
                                  </div>
                                </div>
                              </div>
                              {selectedPaymentMethod === "paypal" && (
                                <Check className="w-5 h-5 text-blue-500" />
                              )}
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <Button
                              variant="outline"
                              className={`w-full justify-between h-auto py-3 px-4 ${
                                selectedPaymentMethod === "ideal"
                                  ? "border-blue-500 bg-blue-50"
                                  : ""
                              }`}
                              onClick={() =>
                                handlePaymentMethodSelect("ideal")
                              }
                            >
                              <div className="flex items-center space-x-3">
                                <div className="bg-white border border-gray-200 p-1 rounded-md flex items-center justify-center w-10 h-6">
                                  <div className="flex items-center">
                                    <div className="text-gray-800 font-bold text-xs">
                                      Ide
                                    </div>
                                    <div className="text-[#d71717] font-bold text-xs">
                                      al
                                    </div>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Ideal</div>
                                  <div className="text-xs text-gray-500">
                                    (+3.4%, +45 CENT)
                                  </div>
                                </div>
                              </div>
                              {selectedPaymentMethod === "ideal" && (
                                <Check className="w-5 h-5 text-blue-500" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          disabled={!selectedPaymentMethod}
                        >
                          Bezahlen
                        </Button>
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>

            
       
{user && (
    <div className="lg:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.image || ""}
                alt="User"
              />
              <AvatarFallback className="bg-[#3B5EB7] text-white">
              {user?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to="/dashboard">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem  className="text-red-600" onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )}
    <div className="flex items-center gap-1">
      <Link to="/login">
      </Link>
    </div>
      </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
