"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  X
} from "lucide-react";

export default function Navigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [firstPsychicId, setFirstPsychicId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  

  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  // Dummy notifications data
  const dummyNotifications = [
    {
      id: 1,
      type: "message",
      title: "New message from KRS",
      description: "Your psychic has responded to your question",
      time: "5 minutes ago",
      unread: true,
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 2,
      type: "credit",
      title: "Credit Added",
      description: "Successfully added 20 credits to your wallet",
      time: "2 hours ago",
      unread: true,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      id: 3,
      type: "appointment",
      title: "Upcoming Session",
      description: "Your session with Arkana starts in 30 minutes",
      time: "3 hours ago",
      unread: false,
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 4,
      type: "review",
      title: "New Review Received",
      description: "Arkana left you a 5-star review",
      time: "1 day ago",
      unread: false,
      icon: <Star className="h-4 w-4" />
    },
    {
      id: 5,
      type: "system",
      title: "System Update",
      description: "New features added to the psychic chat system",
      time: "2 days ago",
      unread: false,
      icon: <Sparkles className="h-4 w-4" />
    }
  ];

  // Set dummy first psychic ID
  useEffect(() => {
    setFirstPsychicId("1");
  }, []);

  // Set dummy unread count
  useEffect(() => {
    setUnreadCount(2);
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    setNotifications(dummyNotifications);
    // Calculate unread notifications count
    const unreadNotifications = dummyNotifications.filter(n => n.unread).length;
    // You could set this to a separate state if needed
  }, []);

  const essentialNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      matchPrefix: "/dashboard"
    },
    {
      name: "Account",
      href: "/account",
      icon: <User className="h-4 w-4" />,
      matchPrefix: "/account"
    },
    {
      name: "Update Profile",
      href: "/update-profile",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Sessions",
      href: "/chat-sessions",
      icon: <MessageSquare className="h-4 w-4" />,
      matchPrefix: "/message",
      badge: unreadCount > 0 ? unreadCount : null
    },
    
    {
      name: "Wallet",
      href: "/wallet",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const unreadNotificationCount = notifications.filter(n => n.unread).length;

  return (
    <>
      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Notifications Panel */}
          <div className="fixed top-24 right-4 md:right-8 lg:right-12 xl:right-16 z-50 w-96 max-w-[90vw]">
            <div className="bg-white rounded-xl shadow-2xl border overflow-hidden"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              {/* Notifications Header */}
              <div className="p-4 border-b flex justify-between items-center"
                style={{ backgroundColor: colors.deepPurple, borderColor: colors.antiqueGold + "30" }}>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" style={{ color: colors.softIvory }} />
                  <h3 className="font-bold text-white">Notifications</h3>
                  {unreadNotificationCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse"
                      style={{ backgroundColor: colors.antiqueGold, color: colors.deepPurple }}>
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs px-3 py-1 rounded-full hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colors.antiqueGold + "30", color: colors.softIvory }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" style={{ color: colors.softIvory }} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: colors.antiqueGold + "20" }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-opacity-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          handleMarkAsRead(notification.id);
                          setShowNotifications(false);
                          // Navigate based on notification type
                          if (notification.type === 'message') {
                            navigate('/chat-sessions');
                          }
                        }}
                        style={{ 
                          backgroundColor: notification.unread ? colors.softIvory : 'white',
                          borderColor: colors.antiqueGold + "20"
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${notification.unread ? 'animate-pulse' : ''}`}
                            style={{ 
                              backgroundColor: notification.unread ? colors.antiqueGold : colors.deepPurple + "10"
                            }}>
                            <div style={{ color: notification.unread ? colors.deepPurple : colors.antiqueGold }}>
                              {notification.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm truncate" style={{ color: colors.deepPurple }}>
                                {notification.title}
                              </h4>
                              {notification.unread && (
                                <span className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                                  style={{ backgroundColor: colors.antiqueGold }}></span>
                              )}
                            </div>
                            <p className="text-xs mt-1 truncate" style={{ color: colors.deepPurple + "CC" }}>
                              {notification.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs" style={{ color: colors.deepPurple + "80" }}>
                                {notification.time}
                              </span>
                              {notification.unread && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="text-xs px-2 py-1 rounded hover:opacity-90 transition-opacity"
                                  style={{ 
                                    backgroundColor: colors.antiqueGold + "20",
                                    color: colors.antiqueGold
                                  }}
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-3" style={{ color: colors.lightGold }} />
                    <p className="font-medium" style={{ color: colors.deepPurple }}>No notifications</p>
                    <p className="text-sm mt-1" style={{ color: colors.deepPurple + "CC" }}>
                      You're all caught up!
                    </p>
                  </div>
                )}
              </div>

              {/* Notifications Footer */}
              <div className="p-3 border-t text-center"
                style={{ backgroundColor: colors.lightGold, borderColor: colors.antiqueGold + "30" }}>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('');
                  }}
                  className="text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ color: colors.deepPurple }}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Navigation */}
      <nav className="rounded-xl max-w-7xl mt-4 mx-auto p-6 shadow-sm relative" 
        style={{ 
          backgroundColor: "white",
          border: `1px solid ${colors.antiqueGold}20`,
          zIndex: 30
        }}>
        
        {/* Main Navigation Buttons */}
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
                
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
                    style={{ 
                      backgroundColor: '#EF4444',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* User Info and Quick Actions */}
        <div className="mt-6 pt-6 border-t flex flex-wrap justify-between items-center gap-4 px-2"
          style={{ borderColor: colors.antiqueGold + "20" }}>
          
          {/* User Profile */}
        
        
          {/* Quick Action Buttons */}
          <div className="flex items-right gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors flex items-center gap-2 relative"
              style={{ 
                backgroundColor: colors.deepPurple + "05",
                color: colors.deepPurple
              }}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="text-xs font-medium">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
                  style={{ 
                    backgroundColor: '#EF4444',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                  {unreadNotificationCount}
                </span>
              )}
            </button>
            
          
          </div>
        </div>
      </nav>
    </>
  );
}