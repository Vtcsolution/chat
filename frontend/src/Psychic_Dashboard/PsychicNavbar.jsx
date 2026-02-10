// components/PsychicNavbar.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { 
  AlertTriangle, Bell, Calendar, Heart, Info, LayoutDashboard, 
  LogOut, Menu, MessageSquare, Settings, ShoppingCart, User, 
  ExternalLink, Home, Star, Sparkles, Crown
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const PsychicNavbar = ({ side, setSide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  // Website URL from environment variables
  const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://www.spiritueelchatten.nl';

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/human-psychics/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
      navigate("/psychic/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Failed to logout");
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle visit website redirect
  const handleVisitWebsite = () => {
    window.open(WEBSITE_URL, '_blank');
  };

  // For static page, use placeholder image or fallback
  const placeholderImage = "/images/placeholder-avatar.jpg";

  return (
    <div className="h-[70px] border-b fixed top-0 left-0 right-0 z-[100] flex justify-between items-center lg:px-8 md:px-6 px-4"
      style={{ 
        backgroundColor: colors.primary,
        borderColor: colors.secondary + '30',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.bgLight} 100%)`
      }}>
      
      {/* Logo + Menu Button */}
      <div className="logo flex items-center gap-2 md:gap-4">
        <div className='my-2 border p-2 min-[950px]:hidden inline-block rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md'
          style={{ 
            backgroundColor: colors.secondary,
            borderColor: colors.secondary,
            color: colors.primary
          }}>
          <Menu onClick={() => setSide(!side)} className="h-5 w-5" />
        </div>
        
       <div 
  className="w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200"
  style={{ 
    borderColor: colors.secondary,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.bgLight} 100%)`,
  }}
  title="Hecatevoyance"
>
  <span 
    className="text-sm font-bold uppercase"
    style={{ color: colors.textLight }}
  >
    H
  </span>
</div>
      </div>

      {/* Center Section - Visit Website Button */}
      <div className="flex-1 flex justify-center items-center mx-4 hidden md:flex">
        <Button
          size="sm"
          onClick={handleVisitWebsite}
          className="flex items-center gap-3 px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-[1.05] hover:shadow-lg"
          style={{
            backgroundColor: colors.secondary,
            color: colors.primary
          }}
        >
          <Home className="h-4 w-4" />
          Visit Main Website
          <ExternalLink className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Psychic Avatar Dropdown */}
      <div className="flex items-center gap-4 relative">
        {/* Mobile Visit Website Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleVisitWebsite}
          className="md:hidden transition-all duration-200 hover:scale-110"
          title="Visit Website"
          style={{ color: colors.textLight }}
        >
          <Home className="h-5 w-5" />
        </Button>

        {/* Notifications Bell (Optional) */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full transition-all duration-200 hover:scale-110"
            style={{ color: colors.textLight }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ 
                backgroundColor: colors.danger,
                color: 'white'
              }}>
              3
            </span>
          </Button>
        </div>

        {/* Psychic Avatar */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{ 
            borderColor: colors.secondary,
            backgroundColor: colors.secondary + '10'
          }}
          onClick={toggleDropdown}
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={placeholderImage} alt="psychic avatar" />
              <AvatarFallback className="text-lg font-bold"
                style={{ 
                  backgroundColor: colors.secondary,
                  color: colors.primary
                }}>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: colors.success,
                borderColor: colors.primary,
                color: 'white'
              }}>
              <Star className="h-3 w-3" />
            </div>
          </div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-16 z-50 w-72 rounded-xl shadow-2xl overflow-hidden border"
              style={{ 
                backgroundColor: colors.primary,
                borderColor: colors.secondary + '30',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.bgLight} 100%)`
              }}
            >
              {/* Profile Header */}
              <div className="p-4 border-b"
                style={{ borderColor: colors.secondary + '20' }}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2"
                    style={{ borderColor: colors.secondary }}>
                    <AvatarImage src={placeholderImage} alt="psychic avatar" />
                    <AvatarFallback className="font-bold"
                      style={{ 
                        backgroundColor: colors.secondary,
                        color: colors.primary
                      }}>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-white">Your Account</h3>
                    <p className="text-sm" style={{ color: colors.textLight }}>Verified Psychic</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <ul className="p-2">
                <Link to="/psychic/dashboard">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <LayoutDashboard className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Dashboard</span>
                  </li>
                </Link>
                
                <Link to="/psychic/dashboard/profile">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <User className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Profile Settings</span>
                  </li>
                </Link>

                <Link to="/psychic/dashboard/golive">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <Sparkles className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Go Live</span>
                    <span className="ml-auto px-2 py-1 text-xs rounded-full font-bold"
                      style={{ 
                        backgroundColor: colors.success + '20',
                        color: colors.success
                      }}>
                      Online
                    </span>
                  </li>
                </Link>

                <Link to="/psychic/dashboard/call-history">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <MessageSquare className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Call Sessions</span>
                  </li>
                </Link>

                <Link to="/psychic/dashboard/earning">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <Crown className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Earnings</span>
                    <span className="ml-auto px-2 py-1 text-xs rounded-full font-bold"
                      style={{ 
                        backgroundColor: colors.success,
                        color: 'white'
                      }}>
                      $1,234
                    </span>
                  </li>
                </Link>

                <Link to="/psychic/dashboard/reviews">
                  <li className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                    style={{ 
                      color: colors.textLight,
                      backgroundColor: colors.secondary + '10'
                    }}>
                    <Star className="h-5 w-5" style={{ color: colors.secondary }} /> 
                    <span className="font-medium">Reviews</span>
                  </li>
                </Link>
                
                {/* Divider */}
                <div className="h-px my-2" style={{ backgroundColor: colors.secondary + '20' }}></div>

                {/* Website Link */}
                <li 
                  onClick={handleVisitWebsite}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mb-1"
                  style={{ 
                    color: colors.textLight,
                    backgroundColor: colors.accent + '20'
                  }}>
                  <ExternalLink className="h-5 w-5" style={{ color: colors.accent }} /> 
                  <span className="font-medium">Visit Website</span>
                </li>

                {/* Logout Button */}
                <li 
                  onClick={handleLogout}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] mt-2"
                  style={{ 
                    color: colors.danger,
                    backgroundColor: colors.danger + '10',
                    borderColor: colors.danger + '30'
                  }}>
                  <LogOut className="h-5 w-5" /> 
                  <span className="font-medium">Logout</span>
                </li>
              </ul>

              {/* Footer */}
              <div className="p-3 border-t text-center text-xs"
                style={{ 
                  borderColor: colors.secondary + '20',
                  color: colors.textLight + '70'
                }}>
                <p>Psychic Platform v2.0</p>
                <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PsychicNavbar;