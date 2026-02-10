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
  ChevronRight,
  Users,           // ← changed from Fence to more appropriate icon
} from 'lucide-react';
import { MdOutlineAttachEmail } from "react-icons/md";

const Doctor_Side_Bar = ({ side }) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [openSubmenu, setOpenSubmenu] = useState(null);

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

  // Determine active item & open submenu based on current path
  useEffect(() => {
    const path = location.pathname;

    // Psychics section (parent + all children)
    if (
      path.includes('/admin/dashboard/add-humancoach') ||
      path.includes('/admin/dashboard/humancoach') ||
      path.includes('/admin/dashboard/newcoach')
    ) {
      setActiveItem('psychics');
      setOpenSubmenu('psychics'); // ← auto-open submenu when on child route
    }
    else if (path.includes('/admin/dashboard/transactions')) {
      setActiveItem('transactions');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/human-chat')) {
      setActiveItem('human-chats');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/allusers')) {
      setActiveItem('users');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/reviews')) {
      setActiveItem('reviews');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/human-reviews')) {
      setActiveItem('coach-reviews');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/video_update')) {
      setActiveItem('video-thumbnail');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard/sendmail')) {
      setActiveItem('send-email');
      setOpenSubmenu(null);
    }
    else if (path.includes('/admin/dashboard')) {
      setActiveItem('dashboard');
      setOpenSubmenu(null);
    }
  }, [location.pathname]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin/dashboard',
      hasSubmenu: false
    },
    {
      id: 'psychics',
      label: 'Psychics',
      icon: <Users className="h-5 w-5" />, // more professional than Fence
      path: null,
      hasSubmenu: true,
      submenu: [
        { label: 'Add Human Psychic', path: '/admin/dashboard/add-humancoach' },
        { label: 'All Psychics',       path: '/admin/dashboard/humancoach' },
        { label: 'New Psychics',       path: '/admin/dashboard/newcoach' },
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <BadgeDollarSign className="h-5 w-5" />,
      path: '/admin/dashboard/transactions',
      hasSubmenu: false
    },
    {
      id: 'human-chats',
      label: 'Human Chats',
      icon: <MessageCircle className="h-5 w-5" />,
      path: '/admin/dashboard/human-chat',
      hasSubmenu: false
    },
    {
      id: 'users',
      label: 'Users',
      icon: <User className="h-5 w-5" />,
      path: '/admin/dashboard/allusers',
      hasSubmenu: false
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star className="h-5 w-5" />,
      path: '/admin/dashboard/reviews',
      hasSubmenu: false
    },
    {
      id: 'coach-reviews',
      label: 'Psychic Reviews',
      icon: <Star className="h-5 w-5" />,
      path: '/admin/dashboard/human-reviews',
      hasSubmenu: false
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: <MdOutlineAttachEmail className="h-5 w-5" />,
      path: '/admin/dashboard/sendmail',
      hasSubmenu: false
    },
  ];

  const toggleSubmenu = (id) => {
    setOpenSubmenu(prev => (prev === id ? null : id));
  };

  const isActive = (item) => {
    if (item.hasSubmenu) {
      return activeItem === item.id;
    }
    return activeItem === item.id;
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
          <ul className="px-3 py-5 space-y-1.5 flex-1">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.hasSubmenu ? (
                  <>
                    {/* Parent item - Psychics */}
                    <div
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isActive(item) || openSubmenu === item.id
                          ? 'bg-white/10 shadow-md'
                          : 'hover:bg-white/5'
                      }`}
                      style={{
                        color: (isActive(item) || openSubmenu === item.id)
                          ? colors.textLight
                          : 'white',
                      }}
                      onClick={() => toggleSubmenu(item.id)}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor:
                              isActive(item) || openSubmenu === item.id
                                ? colors.secondary + '30'
                                : colors.bgLight + '60',
                          }}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium text-[15px]">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 transition-transform duration-300 ${
                          openSubmenu === item.id ? 'rotate-90' : ''
                        }`}
                        style={{ opacity: 0.7 }}
                      />
                    </div>

                    {/* Submenu - slides down smoothly */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openSubmenu === item.id ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <ul className="pl-12 py-2 space-y-1 border-l border-white/10 ml-4">
                        {item.submenu.map((sub, idx) => (
                          <li key={idx}>
                            <Link
                              to={sub.path}
                              className={`block px-4 py-2.5 rounded-lg text-sm transition-all ${
                                location.pathname === sub.path
                                  ? 'bg-white/10 text-white font-medium'
                                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  /* Regular menu item */
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 ${
                      isActive(item)
                        ? 'bg-white/10 shadow-md scale-[1.02]'
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      color: isActive(item) ? colors.textLight : 'white',
                    }}
                    onClick={() => setActiveItem(item.id)}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: isActive(item)
                          ? colors.secondary + '30'
                          : colors.bgLight + '60',
                      }}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium text-[15px]">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div className="px-4 py-6 border-t mt-auto" style={{ borderColor: colors.bgLight }}>
            <div
              className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
              style={{ color: colors.danger }}
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  // logout logic here
                  // logout();
                  // navigate('/admin/login');
                }
              }}
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