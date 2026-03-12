"use client";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Users,
  MessageSquare,
  Phone,
  CreditCard,
  Home,
  Bell,
  History,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  X,
  Menu,
  ChevronDown
} from "lucide-react";

export default function Navigation() {
  const { pathname } = useLocation();
  const [firstPsychicId, setFirstPsychicId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Set dummy first psychic ID
  useEffect(() => {
    setFirstPsychicId("1");
  }, []);

  const essentialNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      matchPrefix: "/dashboard"
    },
    {
      name: "Account",
      href: "/account",
      icon: <User className="h-5 w-5" />,
      matchPrefix: "/account"
    },
    {
      name: "Update Profile",
      href: "/update-profile",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Sessions",
      href: "/chat-sessions",
      icon: <MessageSquare className="h-5 w-5" />,
      matchPrefix: "/message",
      // badge removed
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Navigation */}
      <nav className="rounded-xl max-w-7xl mt-4 mx-auto p-4 sm:p-6 shadow-sm relative z-30" 
        style={{ 
          backgroundColor: "white",
          border: `1px solid ${colors.antiqueGold}20`,
        }}>
        
        {/* Mobile Header with Menu Toggle */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.antiqueGold }}>
              <Sparkles className="h-5 w-5" style={{ color: colors.deepPurple }} />
            </div>
            <span className="font-bold" style={{ color: colors.deepPurple }}>Menu</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: mobileMenuOpen ? colors.antiqueGold + '20' : 'transparent',
              color: colors.deepPurple
            }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:block">
          <div className="flex flex-wrap justify-center gap-3">
            {essentialNavItems.map((item) => {
              const isActive = item.matchPrefix
                ? pathname.startsWith(item.matchPrefix)
                : pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-3 relative min-w-[140px] justify-center",
                    isActive
                      ? "shadow-lg transform scale-105"
                      : "hover:shadow-md hover:scale-105"
                  )}
                  style={{
                    backgroundColor: isActive ? colors.antiqueGold : colors.deepPurple,
                    color: isActive ? colors.deepPurple : colors.softIvory,
                    border: `2px solid ${isActive ? colors.antiqueGold : colors.deepPurple}20`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  
                  {/* Badge removed from desktop view */}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-2 py-2">
            {essentialNavItems.map((item) => {
              const isActive = item.matchPrefix
                ? pathname.startsWith(item.matchPrefix)
                : pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all relative",
                    isActive
                      ? "shadow-md"
                      : "hover:shadow-sm hover:scale-[1.02]"
                  )}
                  style={{
                    backgroundColor: isActive ? colors.antiqueGold + '20' : 'transparent',
                    color: isActive ? colors.antiqueGold : colors.deepPurple,
                    border: `1px solid ${isActive ? colors.antiqueGold : colors.deepPurple}20`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: isActive ? colors.antiqueGold : colors.deepPurple }}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold flex-1">{item.name}</span>
                    {/* Badge removed from mobile view */}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* User Info and Quick Actions - Simplified for mobile */}
        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 px-2"
          style={{ borderColor: colors.antiqueGold + "20" }}>
          
          {/* Quick Action Buttons - Mobile optimized */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors flex items-center gap-2 flex-1 sm:flex-initial justify-center"
              style={{ 
                backgroundColor: colors.deepPurple + "05",
                color: colors.deepPurple
              }}
              title="Home"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4" />
              <span className="text-xs font-medium sm:hidden">Home</span>
            </button>
            
            <button
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors flex items-center gap-2 flex-1 sm:flex-initial justify-center"
              style={{ 
                backgroundColor: colors.deepPurple + "05",
                color: colors.deepPurple
              }}
              title="History"
              onClick={() => window.location.href = '/history'}
            >
              <History className="h-4 w-4" />
              <span className="text-xs font-medium sm:hidden">History</span>
            </button>
          </div>

          {/* Mobile Menu Close Button - Only visible when menu is open */}
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
              style={{ 
                backgroundColor: colors.antiqueGold,
                color: colors.deepPurple
              }}
            >
              Close Menu
            </button>
          )}
        </div>
      </nav>

      {/* Floating Mobile Action Button - Optional quick access */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          style={{ 
            backgroundColor: colors.antiqueGold,
            color: colors.deepPurple
          }}
        >
          <ChevronDown className="h-6 w-6 rotate-180" />
        </button>
      </div>
    </>
  );
}