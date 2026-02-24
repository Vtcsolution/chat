// components/Doctor_Side_Bar.jsx  (Admin version - Psychics focused)
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BadgeDollarSign,
  MessageCircle,
  Star,
  User,
  Video,
  LogOut,
  Users,           
  UserPlus,        // ← added for Add Psychic
  UserCheck,       // ← added for All Psychics
  UserCog,         // ← added for New Psychics
} from 'lucide-react';
import { MdOutlineAttachEmail } from "react-icons/md";
import { Card } from "@mui/material";

const Doctor_Side_Bar = ({ side }) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");

  // Color scheme
  const colors = {
    primary: "#2B1B3F",
    secondary: "#C9A24D",
    accent: "#9B7EDE",
    bgLight: "#3A2B4F",
    textLight: "#E8D9B0",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  };

  // Determine active item based on current path
  useEffect(() => {
    const path = location.pathname;

    // Individual psychic pages (no dropdown now)
    if (path.includes('/admin/dashboard/add-humancoach')) {
      setActiveItem('add-psychic');
    }
    else if (path.includes('/admin/dashboard/humancoach')) {
      setActiveItem('all-psychics');
    }
    else if (path.includes('/admin/dashboard/newcoach')) {
      setActiveItem('new-psychics');
    }
    else if (path.includes('/admin/dashboard/transactions')) {
      setActiveItem('transactions');
    }
    else if (path.includes('/admin/dashboard/human-chat')) {
      setActiveItem('human-chats');
    }
    else if (path.includes('/admin/dashboard/allusers')) {
      setActiveItem('users');
    }
    else if (path.includes('/admin/dashboard/psychic-earnings')) {
      setActiveItem('psychic-earning');
    }
    else if (path.includes('/admin/dashboard/human-reviews')) {
      setActiveItem('coach-reviews');
    }
    else if (path.includes('/admin/dashboard/sendmail')) {
      setActiveItem('send-email');
    }
    else if (path.includes('/admin/dashboard')) {
      setActiveItem('dashboard');
    }
  }, [location.pathname]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin/dashboard',
    },
    // Psychics - separate pages instead of dropdown
    {
      id: 'add-psychic',
      label: 'Add Psychic',
      icon: <UserPlus className="h-5 w-5" />,
      path: '/admin/dashboard/add-humancoach',
    },
    {
      id: 'all-psychics',
      label: 'All Psychics',
      icon: <UserCheck className="h-5 w-5" />,
      path: '/admin/dashboard/humancoach',
    },
    {
      id: 'new-psychics',
      label: 'New Psychics',
      icon: <UserCog className="h-5 w-5" />,
      path: '/admin/dashboard/newcoach',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <BadgeDollarSign className="h-5 w-5" />,
      path: '/admin/dashboard/transactions',
    },
    {
      id: 'human-chats',
      label: 'Chat / Calls',
      icon: <MessageCircle className="h-5 w-5" />,
      path: '/admin/dashboard/human-chat',
    },
    {
      id: 'psychic-earning',
      label: 'Psychic Earnings',
      icon: <Card className="h-5 w-5" />,
      path: '/admin/dashboard/psychic-earnings',
    },
    {
      id: 'users',
      label: 'Users',
      icon: <User className="h-5 w-5" />,
      path: '/admin/dashboard/allusers',
    },
    {
      id: 'coach-reviews',
      label: 'Psychic Reviews',
      icon: <Star className="h-5 w-5" />,
      path: '/admin/dashboard/human-reviews',
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: <MdOutlineAttachEmail className="h-5 w-5" />,
      path: '/admin/dashboard/sendmail',
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear any stored auth tokens/session
      localStorage.removeItem('adminToken');
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = '/admin/login';
    }
  };

  return (
    <div>
      <div
        id="sidebar-wrapper"
        className={`${side ? "open" : ""}`}
        style={{ backgroundColor: colors.primary }}
      >
        <div className="sidebar h-full flex flex-col hover:overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: colors.bgLight }}>
            <h2 className="font-bold text-xl tracking-tight" style={{ color: colors.secondary }}>
              Admin Panel
            </h2>
          </div>

          {/* Navigation */}
          <ul className="px-3 py-5 space-y-1 flex-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 ${
                    activeItem === item.id
                      ? 'bg-white/10 shadow-md scale-[1.02]'
                      : 'hover:bg-white/5'
                  }`}
                  style={{
                    color: activeItem === item.id ? colors.textLight : 'white',
                  }}
                  onClick={() => setActiveItem(item.id)}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: activeItem === item.id
                        ? colors.secondary + '30'
                        : colors.bgLight + '60',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium text-[15px]">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div className="px-4 py-6 border-t mt-auto" style={{ borderColor: colors.bgLight }}>
            <div
              className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
              style={{ color: colors.danger }}
              onClick={handleLogout}
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: colors.danger + '20' }}>
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-medium">Logout</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        #sidebar-wrapper {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: -260px;
          transition: left 0.3s ease-in-out;
          z-index: 1000;
        }

        #sidebar-wrapper.open {
          left: 0;
        }

        @media (min-width: 768px) {
          #sidebar-wrapper {
            left: 0;
          }
        }

        .sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Doctor_Side_Bar;