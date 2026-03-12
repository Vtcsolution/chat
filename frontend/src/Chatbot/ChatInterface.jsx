import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Sparkles,
  Shield,
  Star,
  Check,
  CheckCheck,
  Clock,
  Smile,
  AlertCircle,
  CreditCard,
  Zap,
  User,
  DollarSign,
  Timer,
  AlertTriangle,
  Ban,
  ShieldAlert,
  EyeOff,
  Bell,
  BellOff,
  XCircle,
  Phone,
  Globe,Mail  
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import ChatRequestModal from "./ChatRequestModal";
import RatingModal from "./RatingModal";
import Picker from "@emoji-mart/react";
import PaymentModal from "@/All_Components/PaymentModal";

// ========== WARNING ALERT COMPONENT FOR USER ==========
// ========== WARNING ALERT COMPONENT FOR USER - FIXED ==========
const UserWarningAlert = ({ warning, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getWarningIcon = (type) => {
    switch(type) {
      case 'email': return <Mail className="h-6 w-6" />;
      case 'phone': return <Phone className="h-6 w-6" />;
      case 'link': return <Globe className="h-6 w-6" />;
      default: return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getWarningColor = (number) => {
    switch(number) {
      case 1: return 'yellow';
      case 2: return 'orange';
      case 3: return 'red';
      default: return 'yellow';
    }
  };

  const color = getWarningColor(warning.warningNumber);
  const IconComponent = getWarningIcon(warning.warningType);

  // Define color classes statically
  const borderColorClass = 
    color === 'yellow' ? 'border-yellow-500' :
    color === 'orange' ? 'border-orange-500' :
    color === 'red' ? 'border-red-500' : 'border-yellow-500';
  
  const textColorClass = 
    color === 'yellow' ? 'text-yellow-600' :
    color === 'orange' ? 'text-orange-600' :
    color === 'red' ? 'text-red-600' : 'text-yellow-600';
  
  const bgColorClass = 
    color === 'yellow' ? 'bg-yellow-100' :
    color === 'orange' ? 'bg-orange-100' :
    color === 'red' ? 'bg-red-100' : 'bg-yellow-100';
  
  const alertBorderClass = 
    color === 'yellow' ? 'border-yellow-300' :
    color === 'orange' ? 'border-orange-300' :
    color === 'red' ? 'border-red-300' : 'border-yellow-300';
  
  const alertBgClass = 
    color === 'yellow' ? 'bg-yellow-50' :
    color === 'orange' ? 'bg-orange-50' :
    color === 'red' ? 'bg-red-50' : 'bg-yellow-50';
  
  const alertTitleClass = 
    color === 'yellow' ? 'text-yellow-800' :
    color === 'orange' ? 'text-orange-800' :
    color === 'red' ? 'text-red-800' : 'text-yellow-800';
  
  const alertDescClass = 
    color === 'yellow' ? 'text-yellow-700' :
    color === 'orange' ? 'text-orange-700' :
    color === 'red' ? 'text-red-700' : 'text-yellow-700';
  
  const buttonBgClass = 
    color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
    color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
    color === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${borderColorClass} border-2`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-3 ${textColorClass}`}>
            <div className={`p-2 rounded-full ${bgColorClass}`}>
              {IconComponent}
            </div>
            <span>⚠️ Psychic Warning #{warning.warningNumber}</span>
          </DialogTitle>
          <DialogDescription className="pt-4">
            <Alert variant="destructive" className={`${alertBorderClass} ${alertBgClass}`}>
              <AlertTriangle className={`h-4 w-4 ${textColorClass}`} />
              <AlertTitle className={`${alertTitleClass} font-bold`}>
                Psychic Violated Terms of Service
              </AlertTitle>
              <AlertDescription className={`${alertDescClass} mt-2`}>
                The psychic attempted to share personal contact information, which is against our terms of service.
              </AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Warning issued: {new Date(warning.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldAlert className="h-4 w-4" />
                <span>Violation: {warning.warningType}</span>
              </div>

              {warning.warningNumber === 3 && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    🔴 This psychic has been deactivated due to multiple violations.
                  </p>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onClose}
            className={`w-full ${buttonBgClass} text-white`}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========== PSYCHIC DEACTIVATED NOTICE ==========
const PsychicDeactivatedNotice = ({ psychicName, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-red-500 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <Ban className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Psychic Deactivated</h2>
          
          <p className="text-gray-600 mb-6">
            {psychicName} has been deactivated due to multiple violations of our terms of service.
            Your chat session has been ended and you will not be charged for this session.
          </p>

          <div className="space-y-3 w-full">
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Return to Chats
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/psychics'}
            >
              Browse Other Psychics
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you have any concerns, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== BLOCKED MESSAGE INDICATOR ==========
// In your UserWarningAlert component, update BlockedMessageIndicator:
// ========== BLOCKED MESSAGE INDICATOR - UPDATED ==========
const BlockedMessageIndicator = ({ message }) => {
  return (
    <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg max-w-full">
      <div className="flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-800">Message Blocked</p>
          <p className="text-xs text-orange-600 mt-1">
            {message?.reason || 'Psychic attempted to share contact information'}
          </p>
          {message?.warningNumber && (
            <Badge className="mt-2 bg-orange-500 text-white text-xs">
              Warning #{message.warningNumber}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== CREDIT PROGRESS BAR ==========
const CreditProgressBar = ({ currentCredits, ratePerMin }) => {
  const maxCredits = Math.max(currentCredits, ratePerMin * 5);
  const percentage = maxCredits > 0 ? (currentCredits / maxCredits) * 100 : 0;
  const minutesLeft = ratePerMin > 0 ? Math.floor(currentCredits / ratePerMin) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Credits</span>
        <span className="text-xs font-medium text-blue-600">
          {currentCredits.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-800 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">
          {minutesLeft} min available
        </span>
        <span className="text-xs text-gray-500">
          {ratePerMin || 0}/min
        </span>
      </div>
    </div>
  );
};

// ========== REAL-TIME CREDIT DEDUCTION DISPLAY ==========
const RealTimeCreditDeductionDisplay = ({ deductionHistory, lastDeduction, lastDeductionTime }) => {
  if (!lastDeductionTime) return null;
  
  const timeSinceLastDeduction = Date.now() - new Date(lastDeductionTime).getTime();
  const showRecentDeduction = timeSinceLastDeduction < 10000;
  
  return (
    <div className="flex items-center gap-2">
      {showRecentDeduction && lastDeduction > 0 && (
        <div className="animate-pulse bg-red-50 border border-red-200 rounded-lg px-2 py-1 flex items-center gap-1">
          <span className="text-xs font-medium text-red-600">
            -{lastDeduction.toFixed(2)}
          </span>
          <CreditCard className="h-3 w-3 text-red-500" />
        </div>
      )}
      {deductionHistory.length > 0 && (
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-10">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Deductions</h4>
              <div className="space-y-2">
                {deductionHistory.slice().reverse().slice(0, 3).map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">
                        {new Date(deduction.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500 font-medium">
                        -{deduction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== ENHANCED TIMER DISPLAY ==========
const EnhancedTimerDisplay = ({
  countdownSeconds,
  ratePerMin,
  userCredits,
  onEndSession,
  estimatedCreditsUsed,
  psychicDeactivated
}) => {
  if (!countdownSeconds || countdownSeconds <= 0) return null;
  
  const creditsPerSecond = ratePerMin ? ratePerMin / 60 : 0;
  const estimatedCreditsLeft = countdownSeconds * creditsPerSecond;
  
  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-green-600" />
          <span className="text-xs text-gray-600">Time remaining:</span>
        </div>
        <div className="text-lg font-bold text-green-700 font-mono">
          {formatCountdown(countdownSeconds)}
        </div>
      </div>
      <div className="h-8 w-px bg-green-200"></div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3 text-blue-600" />
          <span className="text-xs text-gray-600">Credits used:</span>
        </div>
        <div className="text-lg font-bold text-blue-700">
          {estimatedCreditsUsed.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          {ratePerMin?.toFixed(2)}/min
        </div>
      </div>
      <div className="h-8 w-px bg-green-200"></div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-yellow-600" />
          <span className="text-xs text-gray-600">Credits remaining:</span>
        </div>
        <div className="text-lg font-bold text-yellow-700">
          {userCredits.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          ~{estimatedCreditsLeft.toFixed(2)} left
        </div>
      </div>
      <div className="h-8 w-px bg-green-200"></div>
      <Button
        onClick={onEndSession}
        variant="outline"
        className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
        disabled={psychicDeactivated}
      >
        End session
      </Button>
    </div>
  );
};

// ========== LIVE CREDIT INFO ==========
const LiveCreditInfo = ({ ratePerMin, userCredits, countdownSeconds, psychicDeactivated }) => {
  if (!ratePerMin || ratePerMin <= 0) return null;
  
  const creditsPerSecond = ratePerMin / 60;
  const estimatedCreditsLeft = countdownSeconds * creditsPerSecond;
  
  return (
    <div className="flex items-center justify-center mt-2">
      <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span className="font-medium">{ratePerMin.toFixed(2)} credits/min</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-yellow-500" />
          <span>Live: {userCredits.toFixed(2)} credits</span>
        </span>
        <span>•</span>
        <span>{Math.floor(userCredits / ratePerMin)} min left</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatCountdown(countdownSeconds)}
        </span>
        <span>•</span>
        <span className="text-blue-600 font-medium">
          ~{estimatedCreditsLeft.toFixed(2)} credits remaining
        </span>
        {psychicDeactivated && (
          <>
            <span>•</span>
            <span className="text-red-600 font-medium flex items-center gap-1">
              <Ban className="h-3 w-3" />
              Psychic Deactivated
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// ========== ACCEPT SESSION MODAL ==========
const AcceptSessionModal = ({
  selectedPsychic,
  ratePerMin,
  userCredits,
  pendingAcceptedRequest,
  showAcceptModal,
  setShowAcceptModal,
  handleAcceptSession,
  handleDeclineAccepted,
  ringtoneRef
}) => {
  const [isRinging, setIsRinging] = useState(false);
  const ringIntervalRef = useRef(null);

  useEffect(() => {
    if (showAcceptModal) {
      startRinging();
    }
    return () => {
      stopRinging();
    };
  }, [showAcceptModal]);

  const startRinging = () => {
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio('/new_chat_request.mp3');
      ringtoneRef.current.loop = false;
    }
    setIsRinging(true);
    
    ringIntervalRef.current = setInterval(() => {
      if (ringtoneRef.current) {
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current.play().catch(err => {
          console.log('Ringtone play error:', err);
        });
      }
    }, 2000);
  };

  const stopRinging = () => {
    setIsRinging(false);
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const handleAccept = () => {
    stopRinging();
    handleAcceptSession(pendingAcceptedRequest._id);
    setShowAcceptModal(false);
  };

  const handleDecline = () => {
    stopRinging();
    handleDeclineAccepted(pendingAcceptedRequest._id);
    setShowAcceptModal(false);
  };

  const handleClose = () => {
    stopRinging();
    setShowAcceptModal(false);
  };

  return (
    <Dialog open={showAcceptModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRinging && (
              <div className="animate-pulse">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            )}
            Start Paid Session?
            {isRinging && (
              <span className="text-sm font-normal text-amber-600 animate-pulse ml-2">
                Ringing...
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedPsychic?.image} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {selectedPsychic?.name?.[0] || "P"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800">
                {selectedPsychic.name} has accepted your chat request.
              </span>
            </div>
            <p className="mt-2">
              Do you want to start the paid session now?
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">Session Cost</span>
            </div>
            <div className="text-lg font-bold text-amber-700">
              {ratePerMin} credits/min
            </div>
            <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Your credits: {Number(userCredits).toFixed(2)}
            </div>
            {userCredits > 0 && (
              <div className="text-xs text-amber-700 mt-1 font-medium">
                Available time: {Math.floor(userCredits / ratePerMin)} minutes
              </div>
            )}
          </div>
          
          {isRinging && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-600">
                  Ringing... Please respond
                </span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span>Accept and start session</span>
                {userCredits > 0 && (
                  <span className="ml-2 bg-white text-amber-700 text-xs font-medium px-2 py-1 rounded">
                    {Math.floor(userCredits / ratePerMin)}m
                  </span>
                )}
              </div>
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 py-6"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span>Decline session</span>
              </div>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-2">
            <p>If you don't respond, the request will expire after 1 minute.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ========== UTILITY FUNCTIONS ==========
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

const formatLastMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase().replace(' ', '');
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else if ((now - date) / (1000 * 60 * 60 * 24) < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(':', '.');
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'sent':
      return <Check className="h-3 w-3" />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3" />;
    case 'read':
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const formatCountdown = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const containsOnlyEmoji = (str) => {
  const trimmedStr = str.trim();
  if (trimmedStr.length === 0) return false;
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)+$/u;
  return emojiRegex.test(trimmedStr);
};

// ========== MAIN CHAT INTERFACE COMPONENT ==========
export default function ChatInterface() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ========== STATE VARIABLES ==========
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChatList, setShowChatList] = useState(!isMobileView);

  // ========== WARNING SYSTEM STATE ==========
  const [psychicWarnings, setPsychicWarnings] = useState([]);
  const [psychicWarningCount, setPsychicWarningCount] = useState(0);
  const [isPsychicDeactivated, setIsPsychicDeactivated] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [blockedMessages, setBlockedMessages] = useState({});
  const [showDeactivatedNotice, setShowDeactivatedNotice] = useState(false);
  const [deactivatedPsychicName, setDeactivatedPsychicName] = useState('');

  // ========== CHAT REQUEST STATE ==========
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [pendingAcceptedRequest, setPendingAcceptedRequest] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [endedSessionData, setEndedSessionData] = useState(null);
  const [hasRatedThisSession, setHasRatedThisSession] = useState(false);
  const [statusSocket, setStatusSocket] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ========== REAL-TIME CREDIT DEDUCTION STATE ==========
  const [realTimeCreditDeduction, setRealTimeCreditDeduction] = useState({
    lastDeduction: 0,
    lastDeductionTime: null,
    remainingCredits: 0,
    deductionHistory: []
  });

  // ========== PSYCHIC STATUSES ==========
  const [psychicStatuses, setPsychicStatuses] = useState({});
  const [lastStatusUpdate, setLastStatusUpdate] = useState(Date.now());

  // ========== CALCULATED VALUES ==========
  const selectedPsychic = selectedSession?.psychic || null;
  const ratePerMin = selectedPsychic?.ratePerMin || 0;
  const allowedMinutes = ratePerMin > 0 ? Math.floor(userCredits / ratePerMin) : 0;
  const requiredForOneMinute = ratePerMin || 0;
  const missingAmount = Math.max(0, requiredForOneMinute - userCredits);
  const estimatedCreditsUsed = activeSession?.paidSession?.startTime && ratePerMin > 0
    ? ((Date.now() - new Date(activeSession.paidSession.startTime).getTime()) / 60000) * ratePerMin
    : 0;

  // ========== REFS ==========
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const ringtoneRef = useRef(null);
  const selectedSessionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const creditSimulationRef = useRef(null);
  const isMountedRef = useRef(true);

  // ========== AXIOS INSTANCE ==========
  const chatApi = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001',
    timeout: 10000,
  });

  chatApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ========== COMPONENT LIFECYCLE ==========
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearLocalTimer();
      clearCreditSimulation();
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // ========== FETCH PSYCHIC STATUSES FAST ==========
  const fetchPsychicStatusesFast = async (psychicIds) => {
    if (!psychicIds || psychicIds.length === 0) return {};
   
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/human-psychics/statuses-fast`,
        { psychicIds },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 1000
        }
      );
      if (response.data.success) {
        const statusMap = {};
        Object.keys(response.data.statuses).forEach(id => {
          statusMap[id] = response.data.statuses[id].status;
        });
        return statusMap;
      }
      return {};
    } catch (error) {
      console.warn('Fast status API failed:', error);
      return {};
    }
  };

  const fetchAllPsychicStatusesFast = async () => {
    const psychicIds = chatSessions
      .map(s => s.psychic?._id)
      .filter(id => id);
   
    if (psychicIds.length === 0) return;
    const statusMap = await fetchPsychicStatusesFast(psychicIds);
    setPsychicStatuses(prev => ({ ...prev, ...statusMap }));
    console.log(`⚡ Instantly loaded ${Object.keys(statusMap).length} psychic statuses`);
  };

  // ========== FETCH PSYCHIC WARNING STATUS ==========
// In ChatInterface.jsx, replace the fetchPsychicWarningStatus function (around line 810) with this:

// ========== FETCH PSYCHIC WARNING STATUS (FIXED// ========== FETCH PSYCHIC WARNING STATUS (FIXED) ==========
const fetchPsychicWarningStatus = useCallback(async (psychicId) => {
  if (!psychicId) return null;
  
  try {
    // Use the correct endpoint that users have access to
    const response = await chatApi.get(`/api/humanchat/psychic/${psychicId}/status`);
    if (response.data.success) {
      return {
        isActive: response.data.isActive,
        warningCount: response.data.warningCount,
        deactivatedAt: response.data.deactivatedAt
      };
    }
  } catch (error) {
    // Don't log 404 errors as they're expected if endpoint doesn't exist
    if (error.response?.status !== 404) {
      console.error('Failed to fetch psychic warning status:', error);
    }
  }
  return null;
}, [chatApi]);

// Update the useEffect that checks psychic status
useEffect(() => {
  if (selectedPsychic?._id) {
    fetchPsychicWarningStatus(selectedPsychic._id).then(status => {
      if (status) {
        setIsPsychicDeactivated(!status.isActive);
        setPsychicWarningCount(status.warningCount || 0);
        if (!status.isActive) {
          setDeactivatedPsychicName(selectedPsychic.name);
          setShowDeactivatedNotice(true);
        }
      }
    }).catch(err => {
      // Silently fail - user might not have permission to see warnings
      console.log('Could not fetch psychic warning status (normal if no permission)');
    });
  }
}, [selectedPsychic, fetchPsychicWarningStatus]);
  // ========== UPDATE STATUSES EFFECT ==========
  useEffect(() => {
    if (chatSessions.length > 0) {
      fetchAllPsychicStatusesFast();
     
      const intervalId = setInterval(() => {
        fetchAllPsychicStatusesFast();
      }, 10000);
     
      return () => clearInterval(intervalId);
    }
  }, [chatSessions.length]);

  // ========== STATUS SOCKET SETUP ==========
  useEffect(() => {
    if (!user || !user._id) return;
    const token = localStorage.getItem("accessToken");

    if (chatSessions.length > 0) {
      fetchAllPsychicStatusesFast();
    }

    const newStatusSocket = io(`${import.meta.env.VITE_BASE_URL}/status`, {
      auth: { token, userId: user._id, role: 'user' },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 1000,
      timeout: 10000,
    });

    setStatusSocket(newStatusSocket);

    newStatusSocket.on('connect', () => {
      console.log('✅ Status socket connected');
      fetchAllPsychicStatusesFast();
     
      const psychicIds = chatSessions
        .map(s => s.psychic?._id)
        .filter(id => id);
     
      if (psychicIds.length > 0) {
        newStatusSocket.emit('subscribe_psychic_status', {
          psychicIds,
          timestamp: Date.now()
        });
      }
    });

    newStatusSocket.on('psychic_status_change', (data) => {
      console.log('🔄 Real-time status change:', data);
      setPsychicStatuses(prev => ({
        ...prev,
        [data.psychicId]: data.status
      }));
     
      if (selectedPsychic?._id === data.psychicId) {
        if (data.status === 'offline' || data.status === 'busy') {
          // Check if deactivated
          fetchPsychicWarningStatus(data.psychicId).then(status => {
            if (status && !status.isActive) {
              setIsPsychicDeactivated(true);
              setDeactivatedPsychicName(selectedPsychic.name);
              setShowDeactivatedNotice(true);
            }
          });
        }
      }
    });

    newStatusSocket.on('psychic_status_batch', (data) => {
      console.log('📦 Batch status update:', data.statuses?.length || 0);
      if (data.statuses) {
        const newStatuses = {};
        data.statuses.forEach(status => {
          newStatuses[status.psychicId] = status.status;
        });
        setPsychicStatuses(prev => ({ ...prev, ...newStatuses }));
      }
    });

    newStatusSocket.on('status_sync_request', () => {
      console.log('🔄 Status sync requested');
      fetchAllPsychicStatusesFast();
    });

    return () => {
      if (newStatusSocket) {
        newStatusSocket.disconnect();
      }
    };
  }, [user]);

  // ========== SESSION ENDED HANDLER ==========
  useEffect(() => {
    const handleSessionEnded = (data) => {
      console.log('🏁 Session ended, showing rating modal:', data);
      if (activeSession?._id === data.requestId && selectedPsychic) {
        setEndedSessionData({
          psychic: selectedPsychic,
          sessionId: data.requestId,
          duration: formatCountdown(countdownSeconds),
          endedAt: new Date()
        });
       
        checkIfAlreadyRated(data.requestId, selectedPsychic._id);
       
        setTimeout(() => {
          setShowRatingModal(true);
        }, 1500);
      }
    };

    if (socketRef.current) {
      socketRef.current.on('session_ended', handleSessionEnded);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('session_ended', handleSessionEnded);
      }
    };
  }, [activeSession, selectedPsychic, countdownSeconds]);

  // ========== CHECK IF ALREADY RATED ==========
  const checkIfAlreadyRated = async (sessionId, psychicId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/ratings/check-rating`,
        {
          params: { psychicId, sessionId },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setHasRatedThisSession(response.data.hasRated);
      }
    } catch (error) {
      console.error('Error checking rating:', error);
    }
  };

  // ========== UPDATE REF ==========
  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  // ========== MOBILE VIEW ==========
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      setShowChatList(!mobile || !selectedSession);
    };
   
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };
   
    checkMobile();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [selectedSession]);

  // ========== AUTH CHECK ==========
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // ========== AUDIO INITIALIZATION ==========
  useEffect(() => {
    audioRef.current = new Audio('/message_ring.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ========== WALLET FUNCTIONS ==========
  const fetchUserWallet = useCallback(async () => {
    if (!user) return;
    try {
      const response = await chatApi.get('/api/chatrequest/wallet/balance');
      if (response.data.success) {
        const wallet = response.data.wallet;
        const newCredits = wallet?.credits || 0;
        setUserBalance(wallet?.balance || 0);
        setUserCredits(newCredits);
       
        setRealTimeCreditDeduction(prev => ({
          ...prev,
          remainingCredits: newCredits
        }));
       
        console.log('💰 Wallet fetched:', {
          balance: wallet?.balance,
          credits: newCredits,
          lock: wallet?.lock
        });
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  }, [user]);

  // ========== TIMER FUNCTIONS ==========
  const startLocalTimer = (initialSeconds) => {
    clearLocalTimer();
    if (initialSeconds <= 0) return;
    setCountdownSeconds(initialSeconds);
    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerIntervalRef.current = interval;
  };

  const clearLocalTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // ========== CREDIT SIMULATION FUNCTIONS ==========
  const startCreditSimulation = () => {
    clearCreditSimulation();
    if (!ratePerMin || ratePerMin <= 0) return;
    const creditsPerSecond = ratePerMin / 60;
    let lastUpdate = Date.now();
   
    creditSimulationRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdate) / 1000;
      if (elapsedSeconds >= 1) {
        const deductionAmount = creditsPerSecond * elapsedSeconds;
        const newCredits = Math.max(0, userCredits - deductionAmount);
        setUserCredits(newCredits);
       
        setRealTimeCreditDeduction(prev => ({
          ...prev,
          lastDeduction: deductionAmount,
          lastDeductionTime: new Date(),
          remainingCredits: newCredits,
          deductionHistory: [
            ...prev.deductionHistory.slice(-4),
            {
              amount: deductionAmount,
              time: new Date(),
              remaining: newCredits
            }
          ]
        }));
        lastUpdate = now;
      }
    }, 100);
  };

  const clearCreditSimulation = () => {
    if (creditSimulationRef.current) {
      clearInterval(creditSimulationRef.current);
      creditSimulationRef.current = null;
    }
  };

  useEffect(() => {
    if (activeSession && activeSession.status === 'active' && countdownSeconds > 0 && ratePerMin > 0) {
      startCreditSimulation();
    } else {
      clearCreditSimulation();
    }
    return () => clearCreditSimulation();
  }, [activeSession, countdownSeconds, ratePerMin]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      setRealTimeCreditDeduction({
        lastDeduction: 0,
        lastDeductionTime: null,
        remainingCredits: userCredits,
        deductionHistory: []
      });
    }
  }, [activeSession]);

  // ========== CHAT REQUEST FUNCTIONS ==========
  const checkActiveChatRequest = useCallback(async () => {
    if (!user) return;
    try {
      setSessionLoading(true);
      const response = await chatApi.get('/api/chatrequest/active-session');
      if (response.data.success && response.data.data) {
        const session = response.data.data;
        if (session.status === 'active') {
          console.log('✅ Found active session:', session);
          setActiveSession(session);
          
          if (session.paidSession?.remainingSeconds) {
            console.log('⏰ Setting countdown from active session:', session.paidSession.remainingSeconds);
            setCountdownSeconds(session.paidSession.remainingSeconds);
            startLocalTimer(session.paidSession.remainingSeconds);
          } else {
            const remainingSecs = session.remainingSeconds ||
                                 (session.totalMinutes * 60) ||
                                 Math.floor((session.remainingBalance || 0) / ratePerMin) * 60;
            if (remainingSecs > 0) {
              console.log('⏰ Setting countdown from calculated value:', remainingSecs);
              setCountdownSeconds(remainingSecs);
              startLocalTimer(remainingSecs);
            }
          }
        } else if (session.status === 'accepted') {
          setPendingAcceptedRequest(session);
          setShowAcceptModal(true);
        } else if (session.status === 'rejected') {
          setPendingAcceptedRequest(null);
          setPendingSession(null);
          setShowAcceptModal(false);
          toast.error("Your chat request was rejected by the psychic.");
        }
       
        setChatSessions(prev => prev.map(s =>
          s.psychic?._id === session.psychic?._id ? { ...s, chatRequest: session } : s
        ));
      } else {
        console.log('❌ No active session found');
        setActiveSession(null);
        setPendingAcceptedRequest(null);
        setCountdownSeconds(0);
        clearLocalTimer();
      }
    } catch (error) {
      console.error("Error checking active chat request:", error);
      setActiveSession(null);
      setPendingAcceptedRequest(null);
      setCountdownSeconds(0);
      clearLocalTimer();
    } finally {
      setSessionLoading(false);
    }
  }, [user, ratePerMin]);

  const checkPendingRequest = useCallback(async () => {
    if (!selectedSession?.psychic?._id || !user) return;
    try {
      const response = await chatApi.get(`/api/chatrequest/pending/${selectedSession.psychic._id}`);
      if (response.data.success && response.data.data) {
        setPendingSession(response.data.data);
      } else {
        setPendingSession(null);
      }
    } catch (error) {
      console.error("Error checking pending request:", error);
      setPendingSession(null);
    }
  }, [user, selectedSession]);

  const handleRequestSent = async (requestData) => {
    console.log('Chat request sent:', requestData);
    setPendingSession(requestData);
    await fetchUserWallet();
    await checkPendingRequest();
    toast.success("Chat request sent successfully!");
  };

  const handleSessionEnd = async (sessionData) => {
    console.log('Session ended:', sessionData);
    try {
      const response = await chatApi.post('/api/chatrequest/stop-timer', {
        requestId: activeSession?._id
      });
      if (response.data.success) {
        setActiveSession(null);
        setCountdownSeconds(0);
        clearLocalTimer();
        clearCreditSimulation();
        await fetchUserWallet();
        toast.success("Session ended successfully");
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error("Failed to end session");
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await fetchUserWallet();
    setIsRefreshing(false);
    toast.success("Balance refreshed successfully");
  };

  // ========== SOCKET.IO SETUP ==========
  useEffect(() => {
    if (!user || !isMountedRef.current) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    socketRef.current = io(import.meta.env.VITE_BASE_URL || 'http://localhost:5000', {
      auth: {
        token: token,
        userId: user._id,
        role: 'user'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
// ===== HANDLE BLOCKED MESSAGES FROM PSYCHIC =====
socketRef.current.on('message_blocked', (data) => {
  console.log('🚫 MESSAGE BLOCKED (user side):', data);
  
  setBlockedMessages(prev => ({
    ...prev,
    [data.messageId]: {
      reason: data.reason,
      redactedContent: data.redactedContent
    }
  }));
  
  toast.warning(
    <div className="flex items-center gap-2">
      <ShieldAlert className="h-5 w-5 text-orange-500" />
      <div>
        <p className="font-bold">Message Blocked</p>
        <p className="text-sm">A message from the psychic was blocked for containing prohibited content.</p>
      </div>
    </div>,
    { duration: 5000 }
  );
});

// ===== HANDLE WARNING IN CHAT =====
socketRef.current.on('warning_in_chat', (data) => {
  console.log('⚠️ WARNING IN CHAT (user side):', data);
  
  const warningMessage = {
    _id: `warning_${Date.now()}`,
    content: data.content,
    senderModel: 'System',
    messageType: 'system',
    createdAt: new Date().toISOString(),
    isWarning: true,
    warningNumber: data.warningNumber
  };
  
  setMessages(prev => {
    const sessionMessages = prev[data.chatSessionId] || [];
    return {
      ...prev,
      [data.chatSessionId]: [...sessionMessages, warningMessage]
    };
  });
});

// ===== HANDLE PSYCHIC DEACTIVATED =====
socketRef.current.on('psychic_deactivated', (data) => {
  console.log('🔴 PSYCHIC DEACTIVATED (user side):', data);
  setIsPsychicDeactivated(true);
  setDeactivatedPsychicName(data.psychicName || selectedPsychic?.name || 'Psychic');
  setShowDeactivatedNotice(true);
  
  toast.error(
    <div className="flex items-center gap-2">
      <Ban className="h-5 w-5 text-red-500" />
      <div>
        <p className="font-bold">Psychic Deactivated</p>
        <p className="text-sm">{data.message}</p>
      </div>
    </div>,
    { duration: 0 }
  );
});
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected as user:", user.name || user.username);
      socketRef.current.emit('join_user_room', { userId: user._id });
      
      if (chatSessions.length > 0) {
        const roomNames = chatSessions.map(session => `chat_${session._id}`);
        roomNames.forEach(roomName => {
          socketRef.current.emit('join_room', roomName);
        });
        console.log('👥 Joined chat rooms:', roomNames);
      }
      
      if (activeSession?._id) {
        socketRef.current.emit('join_chat_request', { chatRequestId: activeSession._id });
      }
    });

    // ===== WARNING SYSTEM SOCKET EVENTS =====
    socketRef.current.on('warning_issued_to_psychic', (data) => {
      console.log('⚠️ WARNING ISSUED TO PSYCHIC:', data);
      
      setCurrentWarning(data);
      setShowWarningModal(true);
      setPsychicWarningCount(prev => prev + 1);
      
      toast.warning(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <p className="font-bold">Warning Issued to Psychic</p>
            <p className="text-sm">The psychic has been warned for sharing contact information.</p>
          </div>
        </div>,
        { duration: 5000 }
      );

      if (data.deactivated) {
        setIsPsychicDeactivated(true);
        setDeactivatedPsychicName(selectedPsychic?.name || 'Psychic');
        setShowDeactivatedNotice(true);
        
        toast.error(
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-bold">Psychic Deactivated</p>
              <p className="text-sm">This psychic has been deactivated due to multiple violations.</p>
            </div>
          </div>,
          { duration: 0 }
        );
      }
    });

    socketRef.current.on('psychic_deactivated', (data) => {
      console.log('🔴 PSYCHIC DEACTIVATED:', data);
      setIsPsychicDeactivated(true);
      setDeactivatedPsychicName(data.psychicName || 'Psychic');
      setShowDeactivatedNotice(true);
      
      toast.error(
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-bold">Psychic Deactivated</p>
            <p className="text-sm">{data.message}</p>
          </div>
        </div>,
        { duration: 0 }
      );
    });

    socketRef.current.on('warning_in_chat', (data) => {
      console.log('⚠️ WARNING IN CHAT:', data);
      
      const warningMessage = {
        _id: `warning_${Date.now()}`,
        content: data.content,
        senderModel: 'System',
        messageType: 'system',
        createdAt: new Date().toISOString(),
        isWarning: true,
        warningNumber: data.warningNumber
      };
      
      setMessages(prev => {
        const sessionMessages = prev[data.chatSessionId] || [];
        return {
          ...prev,
          [data.chatSessionId]: [...sessionMessages, warningMessage]
        };
      });
    });

    // ===== NEW MESSAGE HANDLER =====
  // ===== NEW MESSAGE HANDLER - COMPLETE FIXED VERSION =====
// ===== NEW MESSAGE HANDLER - COMPLETE FIXED VERSION =====
socketRef.current.on('new_message', (data) => {
  console.log('📩 NEW MESSAGE RECEIVED VIA SOCKET:', data);
  const { message, chatSessionId, senderId, senderRole } = data;
  
  // Only process messages from psychics
  if (senderRole !== 'psychic') {
    console.log("Ignoring message from non-psychic (probably own message)");
    return;
  }

  // Check if message is blocked
  if (message.isBlocked) {
    console.log('🚫 Blocked message detected:', message);
    
    // Store in blockedMessages state
    setBlockedMessages(prev => ({
      ...prev,
      [message._id]: {
        reason: message.blockReason || 'Message contained prohibited content',
        redactedContent: message.redactedContent || '[Message blocked - contains prohibited content]',
        warningNumber: message.warningNumber
      }
    }));
    
    // Add to messages array with blocked flag
    if (chatSessionId === selectedSessionRef.current?._id) {
      setMessages(prev => {
        const currentMsgs = prev[chatSessionId] || [];
        // Check if message already exists
        if (!currentMsgs.some(m => m._id === message._id)) {
          return {
            ...prev,
            [chatSessionId]: [...currentMsgs, { ...message, isBlocked: true }]
          };
        }
        return prev;
      });
    }
    
    // Show toast notification
    toast.warning(
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-orange-500" />
        <div>
          <p className="font-bold">Message Blocked</p>
          <p className="text-sm">A message from the psychic was blocked for containing prohibited content.</p>
          {message.warningNumber && (
            <p className="text-xs mt-1">Warning #{message.warningNumber} issued to psychic</p>
          )}
        </div>
      </div>,
      { duration: 5000 }
    );
  } else {
    // Normal message - add to chat
    if (senderId.toString() !== user._id.toString() && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play error:', err));
    }

    if (chatSessionId === selectedSessionRef.current?._id) {
      console.log("Adding message to current session messages");
      setMessages(prev => {
        const currentMsgs = prev[chatSessionId] || [];
        if (!currentMsgs.some(m => m._id === message._id)) {
          return {
            ...prev,
            [chatSessionId]: [...currentMsgs, message]
          };
        }
        return prev;
      });
      
      socketRef.current.emit('message_read', {
        messageId: message._id,
        chatSessionId
      });
    }
  }

  // Update chat sessions (for both blocked and normal messages)
  setChatSessions(prev => prev.map(session => {
    if (session._id === chatSessionId) {
      const isSelected = selectedSessionRef.current?._id === chatSessionId;
      return {
        ...session,
        lastMessage: message,
        lastMessageAt: new Date(),
        unreadCounts: {
          ...session.unreadCounts,
          user: isSelected ? 0 : (session.unreadCounts?.user || 0) + 1
        }
      };
    }
    return session;
  }));

  // Show notification for non-selected sessions
  if (chatSessionId !== selectedSessionRef.current?._id) {
    const psychicName = chatSessions.find(s => s._id === chatSessionId)?.psychic?.name || 'Psychic';
    if (message.isBlocked) {
      toast.info(`Blocked message from ${psychicName}`, { duration: 3000 });
    } else {
      toast.info(`New message from ${psychicName}`, { duration: 3000 });
    }
  }
});

    socketRef.current.on('typing_indicator', ({ chatSessionId, isTyping }) => {
      if (chatSessionId === selectedSessionRef.current?._id) {
        setIsTyping(isTyping);
      }
    });

    // ===== CHAT REQUEST EVENTS =====
    socketRef.current.on('chat_request_accepted', (data) => {
      console.log('✅ Chat request accepted received:', data);
      if (pendingSession?._id === data.chatRequest._id) {
        setPendingSession(null);
        setPendingAcceptedRequest(data.chatRequest);
        setShowAcceptModal(true);
      }
      
      setChatSessions(prev => prev.map(session =>
        session.psychic?._id === data.psychicId
          ? { ...session, chatRequest: data.chatRequest }
          : session
      ));
      
      toast.success(`🎉 ${data.psychicName} accepted your chat request!`, {
        duration: 5000,
        action: {
          label: 'Start Session',
          onClick: () => {
            setShowAcceptModal(true);
          }
        }
      });
    });

    socketRef.current.on('chat_request_rejected', (data) => {
      console.log('❌ Chat request rejected received:', data);
      if (pendingSession?._id === data.requestId) {
        setPendingSession(null);
      }
      toast.error(`❌ ${data.psychicName} rejected your chat request`);
    });

    socketRef.current.on('timer_tick', (data) => {
      console.log('⏰ Timer tick:', data);
      if (activeSession?._id === data.requestId) {
        setCountdownSeconds(data.remainingSeconds);
        if (data.currentBalance !== undefined) {
          setUserCredits(data.currentBalance);
        }
      }
    });

    socketRef.current.on('credit_deduction', (data) => {
      console.log('💰 Credit deduction received:', data);
      if (activeSession?._id === data.requestId) {
        setUserCredits(data.newBalance);
        setRealTimeCreditDeduction(prev => ({
          ...prev,
          lastDeduction: data.deductedAmount,
          lastDeductionTime: new Date(),
          remainingCredits: data.newBalance,
          deductionHistory: [
            ...prev.deductionHistory.slice(-4),
            {
              amount: data.deductedAmount,
              time: new Date(),
              remaining: data.newBalance
            }
          ]
        }));
        
        if (data.deductedAmount > 0) {
          toast.info(`-${data.deductedAmount.toFixed(2)} credits deducted`, {
            duration: 2000,
            icon: <CreditCard className="h-4 w-4" />
          });
        }
      }
    });

    socketRef.current.on('session_started', (data) => {
      console.log('🚀 Session started via socket:', data);
      const psychicId = data.psychicId || data.chatRequest?.psychic?._id;
      
      if (selectedPsychic?._id === psychicId) {
        console.log('✅ Matching psychic, updating UI');
        setPendingSession(null);
        setPendingAcceptedRequest(null);
        setShowAcceptModal(false);
        setActiveSession(data.chatRequest);
        
        const remainingSecs = data.remainingSeconds ||
                             data.chatRequest?.paidSession?.remainingSeconds ||
                             (data.chatRequest?.totalMinutes * 60) || 0;
        
        console.log('⏰ Socket remaining seconds:', remainingSecs);
        if (remainingSecs > 0) {
          setCountdownSeconds(remainingSecs);
          startLocalTimer(remainingSecs);
        }
        
        setChatSessions(prev => prev.map(session =>
          session.psychic?._id === psychicId
            ? {
                ...session,
                chatRequest: data.chatRequest,
                lastMessage: 'Paid session started',
                lastMessageAt: new Date()
              }
            : session
        ));
        
        toast.success("✅ Paid session started! Timer is running.", {
          duration: 3000
        });
      }
    });

    socketRef.current.on('session_ended', (data) => {
      console.log('🏁 Session ended:', data);
      if (activeSession?._id === data.requestId) {
        setActiveSession(null);
        setCountdownSeconds(0);
        clearLocalTimer();
        clearCreditSimulation();
        fetchUserWallet();
        toast.success("Session ended successfully", {
          duration: 3000
        });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error("Connection error. Trying to reconnect...");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearLocalTimer();
      clearCreditSimulation();
    };
  }, [user, chatSessions, activeSession, pendingSession, ratePerMin, selectedPsychic]);

  // ========== POLL ACTIVE SESSION ==========
  useEffect(() => {
    if (activeSession?.status === 'active') {
      const pollInterval = setInterval(() => {
        checkActiveChatRequest();
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [activeSession, checkActiveChatRequest]);

  // ========== SYNC MESSAGES ==========
  useEffect(() => {
    const syncMessages = async () => {
      if (!selectedSession?._id || !socketRef.current?.connected) return;
      try {
        console.log('🔄 Checking for missed messages...');
        const lastMessage = messages[selectedSession._id]?.[messages[selectedSession._id]?.length - 1];
        const lastMessageId = lastMessage?._id;
        
        socketRef.current.timeout(5000).emit('sync_messages', {
          chatSessionId: selectedSession._id,
          lastMessageId
        }, (err, response) => {
          if (err) {
            console.error('Sync error:', err);
            return;
          }
          if (response.success && response.messages?.length > 0) {
            console.log(`📥 Synced ${response.messages.length} missed messages`);
            setMessages(prev => {
              const currentMsgs = prev[selectedSession._id] || [];
              const newMessages = response.messages.filter(newMsg =>
                !currentMsgs.some(existingMsg => existingMsg._id === newMsg._id)
              );
              if (newMessages.length > 0) {
                console.log(`✅ Adding ${newMessages.length} synced messages`);
                return {
                  ...prev,
                  [selectedSession._id]: [...currentMsgs, ...newMessages]
                };
              }
              return prev;
            });
          }
        });
      } catch (error) {
        console.error('Sync failed:', error);
      }
    };

    const syncInterval = setInterval(syncMessages, 30000);
    
    const handleReconnect = () => {
      setTimeout(syncMessages, 2000);
    };

    if (socketRef.current) {
      socketRef.current.on('reconnect', handleReconnect);
    }

    return () => {
      clearInterval(syncInterval);
      if (socketRef.current) {
        socketRef.current.off('reconnect', handleReconnect);
      }
    };
  }, [selectedSession, messages]);

  // ========== FETCH CHATS ==========
  const fetchChats = useCallback(async () => {
    if (!user || !user._id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await chatApi.get('/api/humanchat/sessions');
      console.log("User chats response:", data);
      if (data.success) {
        const sessions = data.chatSessions || [];
        setChatSessions(sessions);
        
        const psychicIds = sessions
          .map(s => s.psychic?._id)
          .filter(id => id);
        
        if (psychicIds.length > 0) {
          const statusMap = await fetchPsychicStatusesFast(psychicIds);
          setPsychicStatuses(statusMap);
          console.log(`⚡ Loaded ${Object.keys(statusMap).length} psychic statuses`);
        }
        
        await fetchUserWallet();
        
        if (selectedSession) {
          await checkActiveChatRequest();
          await checkPendingRequest();
        }
      } else {
        throw new Error(data.message || "Failed to load chats");
      }
    } catch (err) {
      console.error("Fetch user chats error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load chats";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, selectedSession, fetchUserWallet, checkActiveChatRequest, checkPendingRequest]);

  // ========== INITIAL FETCH ==========
  useEffect(() => {
    if (user && user._id) {
      fetchChats();
    }
  }, [user, fetchChats]);

  useEffect(() => {
    if (selectedSession) {
      checkActiveChatRequest();
      checkPendingRequest();
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_room', `chat_${selectedSession._id}`);
      }
    }
  }, [selectedSession]);

  // ========== FETCH MESSAGES ==========
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId || !user) return;
    try {
      const { data } = await chatApi.get(`/api/humanchat/messages/${sessionId}`);
      console.log("User messages response:", data);
      if (data.success) {
        setMessages(prev => ({
          ...prev,
          [sessionId]: data.messages || []
        }));
        
        await chatApi.put(`/api/humanchat/messages/${sessionId}/read`);
        
        setChatSessions(prev =>
          prev.map(session =>
            session._id === sessionId
              ? { ...session, unreadCounts: { ...session.unreadCounts, user: 0 } }
              : session
          )
        );
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession._id);
    }
  }, [selectedSession, fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      setTimeout(() => {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
          const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
      }, 100);
    }
  }, [messages[selectedSession?._id], isTyping]);

  // ========== SEND MESSAGE ==========
  const handleSend = async () => {
    if (isPsychicDeactivated) {
      toast.error("This psychic has been deactivated. You cannot send messages.");
      return;
    }

    const messageContent = input.trim();
    if (!messageContent || !selectedSession || !user) {
      return;
    }

    if (activeSession && activeSession.status === 'active' && countdownSeconds <= 0) {
      toast.error("Session time has expired. Please add more credits to continue.");
      return;
    }

    if (activeSession && activeSession.status === 'active' && userCredits < (ratePerMin / 60)) {
      toast.error("Insufficient credits to send message. Please add more credits.");
      return;
    }

    try {
      const { data } = await chatApi.post('/api/humanchat/messages', {
        chatSessionId: selectedSession._id,
        content: messageContent,
        messageType: "text",
      });
      
      console.log("✅ User send message response:", data);
      
      if (data.success && data.message) {
        const newMessage = data.message;
        
        setMessages(prev => ({
          ...prev,
          [selectedSession._id]: [...(prev[selectedSession._id] || []), newMessage],
        }));
        
        setChatSessions(prev =>
          prev.map(session =>
            session._id === selectedSession._id
              ? {
                  ...session,
                  lastMessage: newMessage,
                  lastMessageAt: new Date(),
                }
              : session
          )
        );
        
        setInput("");
        
        if (socketRef.current?.connected) {
          socketRef.current.emit("typing", {
            chatSessionId: selectedSession._id,
            isTyping: false
          });
          
          socketRef.current.emit("send_message", {
            chatSessionId: selectedSession._id,
            message: newMessage,
            senderId: user._id,
            senderRole: 'user'
          });
        }
        
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (err) {
      console.error("❌ Failed to send message", err);
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };
// Add this function near your other handlers
const handleRetryMessage = async (failedMessage) => {
  if (!selectedSession || !failedMessage.content) return;
  
  try {
    const { data } = await chatApi.post('/api/humanchat/messages', {
      chatSessionId: selectedSession._id,
      content: failedMessage.content,
      messageType: "text",
    });
    
    if (data.success && data.message) {
      // Replace failed message with new one
      setMessages(prev => {
        const sessionMessages = prev[selectedSession._id] || [];
        const updatedMessages = sessionMessages.map(msg =>
          msg._id === failedMessage._id ? data.message : msg
        );
        return {
          ...prev,
          [selectedSession._id]: updatedMessages
        };
      });
      
      toast.success("Message resent successfully");
    }
  } catch (error) {
    console.error("Failed to retry message:", error);
    toast.error("Failed to resend message");
  }
};
  // ========== INPUT HANDLERS ==========
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (selectedSession && socketRef.current?.connected) {
      socketRef.current.emit("typing", {
        chatSessionId: selectedSession._id,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ========== SESSION HANDLERS ==========
  const handleAcceptSession = async (requestId) => {
    try {
      console.log('🚀 Starting session for request:', requestId);
      const response = await chatApi.post('/api/chatrequest/start-session', { requestId });
      
      if (response.data.success) {
        const sessionData = response.data.data;
        console.log('✅ Session started API response:', sessionData);
        
        setPendingSession(null);
        setPendingAcceptedRequest(null);
        setShowAcceptModal(false);
        setActiveSession(sessionData);
        
        let remainingSecs = 0;
        if (sessionData.paidSession?.remainingSeconds) {
          remainingSecs = sessionData.paidSession.remainingSeconds;
          console.log('⏰ Found in paidSession.remainingSeconds:', remainingSecs);
        } else if (sessionData.remainingSeconds) {
          remainingSecs = sessionData.remainingSeconds;
          console.log('⏰ Found in remainingSeconds:', remainingSecs);
        } else if (sessionData.totalMinutes) {
          remainingSecs = sessionData.totalMinutes * 60;
          console.log('⏰ Calculated from totalMinutes:', remainingSecs);
        } else if (sessionData.remainingBalance && ratePerMin) {
          remainingSecs = Math.floor(sessionData.remainingBalance / ratePerMin) * 60;
          console.log('⏰ Calculated from remainingBalance:', remainingSecs);
        }
        
        console.log('⏰ Final remaining seconds:', remainingSecs);
        
        if (remainingSecs > 0) {
          setCountdownSeconds(remainingSecs);
          startLocalTimer(remainingSecs);
        }
        
        setChatSessions(prev => prev.map(session =>
          session.psychic?._id === selectedPsychic?._id
            ? {
                ...session,
                chatRequest: sessionData,
                lastMessage: 'Paid session started',
                lastMessageAt: new Date()
              }
            : session
        ));
        
        await fetchUserWallet();
        toast.success("✅ Session started! Timer is running.", {
          duration: 3000
        });
        
        if (socketRef.current?.connected) {
          socketRef.current.emit('session_started', {
            requestId: requestId,
            chatRequest: sessionData,
            psychicId: selectedPsychic?._id,
            remainingSeconds: remainingSecs
          });
        }
        
        setTimeout(() => {
          console.log('🔄 Checking session state after start');
          checkActiveChatRequest();
        }, 500);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const handleDeclineAccepted = async (requestId) => {
    try {
      const response = await chatApi.post('/api/chatrequest/decline-accepted', { requestId });
      if (response.data.success) {
        toast.success("Session declined successfully");
        setShowAcceptModal(false);
        setPendingAcceptedRequest(null);
        checkActiveChatRequest();
      }
    } catch (error) {
      console.error('Error declining session:', error);
      toast.error(error.response?.data?.message || 'Failed to decline session');
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!window.confirm("Are you sure you want to end this paid session?")) {
      return;
    }
    try {
      const response = await chatApi.post('/api/chatrequest/stop-timer', {
        requestId: activeSession._id
      });
      if (response.data.success) {
        const sessionToRate = {
          psychic: selectedPsychic,
          sessionId: activeSession._id,
          duration: formatCountdown(countdownSeconds),
          endedAt: new Date()
        };
        
        setActiveSession(null);
        setCountdownSeconds(0);
        clearLocalTimer();
        clearCreditSimulation();
        await fetchUserWallet();
        
        setEndedSessionData(sessionToRate);
        checkIfAlreadyRated(activeSession._id, selectedPsychic._id);
        
        setTimeout(() => {
          setShowRatingModal(true);
        }, 1000);
        
        toast.success("Session ended successfully");
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error("Failed to end session");
    }
  };

  const handleRatingSubmitted = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    setHasRatedThisSession(true);
    toast.success("Thank you for your feedback!");
    
    if (selectedPsychic) {
      setChatSessions(prev => prev.map(session =>
        session.psychic?._id === selectedPsychic._id
          ? {
              ...session,
              psychic: {
                ...session.psychic,
                rating: ratingData.averageRating || session.psychic.rating,
                totalRatings: ratingData.totalRatings || session.psychic.totalRatings
              }
            }
          : session
      ));
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingSession) return;
    if (!window.confirm("Are you sure you want to cancel this request?")) {
      return;
    }
    try {
      const response = await chatApi.delete(`/api/chatrequest/requests/${pendingSession._id}`);
      if (response.data.success) {
        setPendingSession(null);
        toast.success("Request cancelled successfully");
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error("Failed to cancel request");
    }
  };

  // ========== FILTER SESSIONS ==========
  const filteredSessions = chatSessions.filter((session) => {
    const psychicName = session.psychic?.name?.toLowerCase() || '';
    const psychicBio = session.psychic?.bio?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return psychicName.includes(query) || psychicBio.includes(query);
  });

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  const handleBackToChatList = () => {
    if (isMobileView) {
      setShowChatList(true);
      setSelectedSession(null);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji.native + " ");
    setShowPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // ========== RENDER STATES ==========
  if (authLoading || loading) {
    return (
      <div className="h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error && chatSessions.length === 0) {
    return (
      <div className="h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 mb-4">
            <Sparkles className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Chats</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#00a884] hover:bg-[#128c7e]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const currentMessages = messages[selectedSession?._id] || [];

  // ========== MAIN RENDER ==========
  return (
    <div className="h-screen bg-[#f0f2f5] overflow-hidden">
      {/* Warning Modal */}
      {currentWarning && (
        <UserWarningAlert
          warning={currentWarning}
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
        />
      )}

      {/* Psychic Deactivated Notice */}
      {showDeactivatedNotice && (
        <PsychicDeactivatedNotice
          psychicName={deactivatedPsychicName}
          onClose={() => setShowDeactivatedNotice(false)}
        />
      )}

      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className={cn(
          "flex flex-col w-full md:w-96 bg-white border-r border-[#e9edef] transition-all duration-300 ease-in-out h-full",
          showChatList ? "flex" : "hidden md:flex"
        )}>
          {/* Header */}
          <div className="p-4 bg-[#f0f2f5]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search psychics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-gray-300 focus:border-[#00a884] rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 bg-white">
            <div className="p-1">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-[#f5f6f6] flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No chats yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchQuery ? "No psychics match your search" : "Start chatting with a psychic"}
                  </p>
                  <Button
                    onClick={() => navigate('/psychics')}
                    className="mt-4 bg-[#00a884] hover:bg-[#128c7e]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Browse Psychics
                  </Button>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const hasActiveRequest = activeSession?.psychic?._id === session.psychic?._id &&
                                          activeSession?.status === 'active';
                  const hasPendingRequest = pendingSession?.psychic?._id === session.psychic?._id &&
                                           pendingSession?.status === 'pending';
                  const isDeactivated = psychicStatuses[session.psychic?._id] === 'deactivated' || 
                                        (session.psychic?.isActive === false);
                  
                  return (
                    <div
                      key={session._id}
                      onClick={() => handleSelectSession(session)}
                      className={cn(
                        "flex items-center p-3 hover:bg-[#f5f6f6] cursor-pointer border-b border-[#f0f2f5]",
                        selectedSession?._id === session._id && "bg-[#f0f2f5]",
                        hasActiveRequest && "border-l-4 border-l-[#00a884]",
                        hasPendingRequest && "border-l-4 border-l-[#ffcc00]",
                        isDeactivated && "opacity-60"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.psychic?.image} />
                          <AvatarFallback className="bg-gradient-to-br from-[#00a884] to-[#128c7e] text-white">
                            {session.psychic?.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>
                        {hasActiveRequest && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white font-bold">$</span>
                          </div>
                        )}
                        {hasPendingRequest && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                            <Clock className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {isDeactivated && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                            <Ban className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800 text-sm">
                              {session.psychic?.name || "Psychic"}
                            </h3>
                            <div className="flex items-center">
                              {psychicStatuses[session.psychic?._id] ? (
                                <>
                                  <div className={`h-2 w-2 rounded-full mr-1 ${
                                    isDeactivated ? 'bg-red-500' :
                                    psychicStatuses[session.psychic?._id] === 'online'
                                      ? 'bg-green-500 animate-pulse'
                                      : psychicStatuses[session.psychic?._id] === 'away'
                                      ? 'bg-yellow-500'
                                      : psychicStatuses[session.psychic?._id] === 'busy'
                                      ? 'bg-orange-500'
                                      : 'bg-gray-400'
                                  }`} />
                                  <span className="text-xs text-gray-500 capitalize">
                                    {isDeactivated ? 'Deactivated' : psychicStatuses[session.psychic?._id]}
                                  </span>
                                </>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                  <span className="text-xs text-gray-400">...</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs text-gray-700">{session.psychic?.rating || 4.8}</span>
                            </div>
                            {hasActiveRequest && (
                              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                            {hasPendingRequest && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded animate-pulse">
                                Pending
                              </span>
                            )}
                            {isDeactivated && (
                              <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                Deactivated
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatLastMessageTime(session.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate max-w-[180px]">
                            {hasActiveRequest ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-green-600" />
                                Paid session: {formatCountdown(countdownSeconds)}
                              </span>
                            ) : hasPendingRequest ? (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Clock className="h-3 w-3" />
                                Waiting for acceptance
                              </span>
                            ) : isDeactivated ? (
                              <span className="flex items-center gap-1 text-red-600">
                                <Ban className="h-3 w-3" />
                                Psychic deactivated
                              </span>
                            ) : session.lastMessage?.content || "Start Chat"}
                          </p>
                          {session.unreadCounts?.user > 0 && (
                            <span className="bg-[#00a884] text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                              {session.unreadCounts.user}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-[#efeae2] bg-chat-pattern transition-all duration-300 ease-in-out h-full",
          !showChatList ? "flex" : "hidden md:flex"
        )}>
          {selectedSession ? (
            <div className="flex flex-col h-full">
              {/* Unified Header */}
              <div className="bg-white border-b border-[#e9edef]">
                <div className="px-3 md:px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      {isMobileView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleBackToChatList}
                          className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      )}
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <AvatarImage src={selectedPsychic?.image} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {selectedPsychic?.name?.[0] || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 md:gap-2">
                          <h2 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                            {selectedPsychic?.name || "Psychic"}
                          </h2>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-gray-700">{selectedPsychic?.rating || 4.8}</span>
                          </div>
                          {isPsychicDeactivated && (
                            <Badge className="bg-red-600 text-white text-xs">
                              <Ban className="h-3 w-3 mr-1" />
                              Deactivated
                            </Badge>
                          )}
{psychicWarningCount > 0 && !isPsychicDeactivated && (
  <Badge className="bg-amber-500 text-white text-xs">
    <AlertTriangle className="h-3 w-3 mr-1" />
    Psychic Warning {psychicWarningCount}/3
  </Badge>
)}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {isPsychicDeactivated ? (
                            <span className="text-red-600">Psychic deactivated - session ended</span>
                          ) : onlineStatus[selectedPsychic?._id] ? (
                            <span className="text-green-600">Online</span>
                          ) : (
                            `Last seen ${formatTime(selectedSession.lastMessageAt)}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      {isMobileView ? (
                        <>
                          {activeSession && activeSession.status === 'active' ? (
                            <div className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                              {formatCountdown(countdownSeconds)}
                            </div>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10 text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4",
                    isMobileView && "space-y-2"
                  )}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 flex-shrink-0">
                        <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="font-medium truncate">{ratePerMin} credits/min</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={cn(
                          "min-w-0",
                          isMobileView ? "w-32" : "w-40 md:w-48"
                        )}>
                          <CreditProgressBar
                            currentCredits={userCredits}
                            ratePerMin={ratePerMin}
                          />
                        </div>
                        {!isMobileView && (
                          <RealTimeCreditDeductionDisplay
                            deductionHistory={realTimeCreditDeduction.deductionHistory}
                            lastDeduction={realTimeCreditDeduction.lastDeduction}
                            lastDeductionTime={realTimeCreditDeduction.lastDeductionTime}
                          />
                        )}
                        <Button
                          onClick={handleRefreshBalance}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          disabled={isRefreshing}
                        >
                          {isRefreshing ? (
                            <div className="h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="h-3 w-3 text-gray-500 hover:text-gray-700">⟳</div>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      {activeSession && activeSession.status === 'active' ? (
                        <div className={cn(
                          "w-full md:w-auto",
                          isMobileView ? "scale-95" : ""
                        )}>
                          <EnhancedTimerDisplay
                            countdownSeconds={countdownSeconds}
                            ratePerMin={ratePerMin}
                            userCredits={userCredits}
                            estimatedCreditsUsed={estimatedCreditsUsed}
                            onEndSession={handleEndSession}
                            psychicDeactivated={isPsychicDeactivated}
                          />
                        </div>
                      ) : pendingSession ? (
                        <div className={cn(
                          "flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg px-2 md:px-3 py-1 md:py-1.5 animate-pulse",
                          isMobileView && "scale-90"
                        )}>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                            <span className="text-xs md:text-sm font-medium text-yellow-700">Pending</span>
                          </div>
                          <Button
                            onClick={handleCancelRequest}
                            size="sm"
                            variant="outline"
                            className="h-6 md:h-7 text-xs border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : pendingAcceptedRequest ? (
                        <div className={cn(
                          "flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-2 md:px-3 py-1 md:py-1.5",
                          isMobileView && "scale-90"
                        )}>
                          <Button
                            onClick={() => handleAcceptSession(pendingAcceptedRequest._id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm"
                            size="sm"
                          >
                            <Sparkles className="mr-1 md:mr-2 h-3 w-3" />
                            Start Session
                            {ratePerMin > 0 && userCredits > 0 && (
                              <span className="ml-1 md:ml-2 bg-white text-green-700 text-xs font-medium px-1 py-0.5 rounded">
                                {Math.floor(userCredits / ratePerMin)}m
                              </span>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeclineAccepted(pendingAcceptedRequest._id)}
                            variant="outline"
                            size="sm"
                            className="h-6 md:h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowRequestModal(true)}
                          disabled={userCredits < ratePerMin || isPsychicDeactivated}
                          className="bg-gradient-to-r from-yellow-700 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-xs md:text-sm"
                          size="sm"
                        >
                          <Sparkles className="mr-1 md:mr-2 h-3 w-3" />
                          Start Chat
                          {allowedMinutes > 0 && (
                            <span className="ml-1 md:ml-2 bg-white text-amber-700 text-xs font-medium px-1 py-0.5 rounded">
                              {allowedMinutes}m
                            </span>
                          )}
                        </Button>
                      )}

                      {!activeSession && !pendingSession && !pendingAcceptedRequest &&
                      userCredits < ratePerMin && (
                        <Button
                          onClick={() => setShowPaymentModal(true)}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "border-amber-300 text-amber-700 hover:bg-amber-50 text-xs md:text-sm",
                            isMobileView && "scale-90"
                          )}
                        >
                          <AlertCircle className="mr-1 md:mr-2 h-3 w-3" />
                          Add Credits
                        </Button>
                      )}

                      {activeSession && !isMobileView && (
                        <Button
                          onClick={async () => {
                            console.log('🔄 Manually refreshing timer');
                            await checkActiveChatRequest();
                            toast.info("Timer refreshed");
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                          title="Refresh timer"
                        >
                          ⟳
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-4">
                  <div className="space-y-2 max-w-3xl mx-auto">
                    {currentMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto h-16 w-16 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                          <Sparkles className="h-8 w-8 text-[#00a884]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          {isPsychicDeactivated ? "Psychic Deactivated" :
                           activeSession ? "Paid Session Active!" :
                           pendingSession ? "Request Pending..." :
                           pendingAcceptedRequest ? "Session Accepted!" :
                           "Start a conversation"}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          {isPsychicDeactivated ? (
                            "This psychic has been deactivated. Please select another psychic to continue."
                          ) : activeSession ? (
                            `You have ${Math.floor(userCredits / ratePerMin)} minutes available. Chat freely!`
                          ) : pendingSession ? (
                            `Waiting for ${selectedPsychic?.name || "the psychic"} to accept your request...`
                          ) : pendingAcceptedRequest ? (
                            `${selectedPsychic?.name || "Psychic"} accepted! Click "Start Session" to begin.`
                          ) : (
                            `Send your first message to ${selectedPsychic?.name || "the psychic"}`
                          )}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center my-4">
                          <span className="bg-[#e1f5d5] text-gray-600 text-xs px-3 py-1 rounded-full">
                            Today
                          </span>
                        </div>
          {currentMessages.map((msg, index) => {
  const isUser = msg.senderModel === 'User';
  const isSystem = msg.senderModel === 'System';
  const isWarning = msg.isWarning;
  
  // CRITICAL: Check both blockedMessages state AND msg.isBlocked flag
  const isBlocked = blockedMessages[msg._id] || msg.isBlocked === true;
  
  const showTime = index === currentMessages.length - 1 ||
                  currentMessages[index + 1]?.senderModel !== msg.senderModel;

  // System/Warning messages (centered)
  if (isSystem || isWarning) {
    return (
      <div key={msg._id || `system-${index}`} className="flex justify-center">
        <div className={cn(
          "px-4 py-2 rounded-lg max-w-[80%] text-center",
          isWarning ? "bg-red-100 border border-red-300" : "bg-gray-100 border border-gray-300"
        )}>
          <div className="flex items-center justify-center gap-2">
            {isWarning && <AlertTriangle className="h-4 w-4 text-red-500" />}
            <p className="text-sm text-gray-700">{msg.content}</p>
            {isWarning && msg.warningNumber && (
              <Badge className="bg-red-500 text-white text-xs ml-2">
                Warning #{msg.warningNumber}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Blocked messages from psychic
  if (isBlocked && !isUser) {
    return (
      <div key={msg._id || `blocked-${index}`} className="flex justify-start">
        <div className="max-w-[65%]">
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {msg.sender?.name || 'Psychic'}
          </span>
          <BlockedMessageIndicator 
            message={blockedMessages[msg._id] || { 
              reason: msg.blockReason || 'Message contained prohibited content',
              redactedContent: msg.redactedContent,
              warningNumber: msg.warningNumber
            }} 
          />
          {showTime && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 ml-1">
              <span>{formatMessageTime(msg.createdAt)}</span>
              {msg.warningNumber && (
                <Badge className="bg-orange-500 text-white text-xs ml-2">
                  ⚠️ Warning #{msg.warningNumber}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal message rendering
  return (
    <div
      key={msg._id || `msg-${index}`}
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="max-w-[65%]">
        {!isUser && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {msg.sender?.name || 'Psychic'}
          </span>
        )}
        
        <div
          className={cn(
            "px-3 py-2 rounded-lg relative",
            isUser
              ? "bg-[#d9fdd3] rounded-br-none"
              : "bg-white rounded-bl-none shadow-sm",
            msg.status === 'failed' && "border border-red-300",
            msg.warningIssued && !isUser && "border-l-4 border-l-orange-500"
          )}
        >
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {msg.content}
          </p>
          
          <div className={cn(
            "flex items-center gap-2 mt-1 text-xs flex-wrap",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="text-gray-500">
              {formatMessageTime(msg.createdAt)}
            </span>
            
            {isUser && (
              <span className="ml-1">
                {getStatusIcon(msg.status)}
              </span>
            )}
            
            {msg.warningIssued && !isUser && (
              <Badge className="bg-orange-500 text-white text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning #{msg.warningNumber}
              </Badge>
            )}
            
            {msg.sender?.isActive === false && !isUser && (
              <Badge className="bg-red-600 text-white text-xs">
                <Ban className="h-3 w-3 mr-1" />
                Deactivated
              </Badge>
            )}
          </div>
          
          {msg.status === 'failed' && isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 px-2 text-xs text-red-600 hover:text-red-700"
              onClick={() => handleRetryMessage(msg)}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
})}
                        {isTyping && !isPsychicDeactivated && (
                          <div className="flex justify-start">
                            <div className="bg-white px-3 py-2 rounded-lg rounded-bl-none shadow-sm max-w-[120px]">
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] p-3">
                <div className="flex items-center gap-2 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPicker(!showPicker)}
                    disabled={isPsychicDeactivated}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  {showPicker && (
                    <div className="absolute bottom-14 left-0 z-50">
                      <Picker
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                      />
                    </div>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder={
                        isPsychicDeactivated 
                          ? "Psychic deactivated - cannot send messages"
                          : activeSession 
                            ? "Type a message (Paid session active)" 
                            : "Type a message"
                      }
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="h-12 pl-4 pr-12 bg-white border-none rounded-full focus-visible:ring-0"
                      disabled={!(activeSession && activeSession.status === 'active' && countdownSeconds > 0) || isPsychicDeactivated}
                    />
                    {isPsychicDeactivated && (
                      <div className="absolute inset-0 bg-gray-100/80 rounded-full flex items-center justify-center">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Ban className="h-3 w-3" />
                          Psychic deactivated - chat ended
                        </span>
                      </div>
                    )}
                    {!isPsychicDeactivated && !(activeSession && activeSession.status === 'active' && countdownSeconds > 0) && (
                      <div className="absolute inset-0 bg-gray-100/80 rounded-full flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {activeSession ? "Add credits to continue chatting" : "Start a paid chat session."}
                        </span>
                      </div>
                    )}
                  </div>
                  {input.trim() && (
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="h-12 w-12 rounded-full bg-[#00a884] hover:bg-[#128c7e]"
                      disabled={!(activeSession && activeSession.status === 'active' && countdownSeconds > 0) || isPsychicDeactivated}
                    >
                      <Send className="h-5 w-5 text-white" />
                    </Button>
                  )}
                </div>
                {activeSession && activeSession.status === 'active' && (
                  <LiveCreditInfo
                    ratePerMin={ratePerMin}
                    userCredits={userCredits}
                    countdownSeconds={countdownSeconds}
                    psychicDeactivated={isPsychicDeactivated}
                  />
                )}
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center bg-[#efeae2] bg-chat-pattern">
              <div className="max-w-md text-center px-4">
                <div className="mx-auto h-24 w-24 rounded-full bg-white/80 flex items-center justify-center mb-6 shadow-lg">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#00a884]/20 to-[#128c7e]/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-[#00a884]" />
                  </div>
                </div>
                <h1 className="text-3xl font-light text-gray-700 mb-2">
                  Spiritual Connection
                </h1>
                <p className="text-gray-500 mb-8 text-base">
                  {chatSessions.length === 0
                    ? "Connect with psychics for guidance and insights"
                    : "Select a chat to start messaging"}
                </p>
                <div className="mb-6 p-4 bg-white/80 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Your Credits</span>
                    <span className="text-xl font-bold text-blue-600">
                      {Number(userCredits).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-2">
                    <Zap className="h-4 w-4" />
                    <span>For chat sessions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userCredits > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      <Zap className="h-3 w-3" />
                      <span>{Number(userCredits).toFixed(2)} credits</span>
                    </div>
                  )}
                  <Button
                    onClick={handleRefreshBalance}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <div className="h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-3 w-3 text-gray-500 hover:text-gray-700">⟳</div>
                    )}
                  </Button>
                </div>
                {activeSession && activeSession.status === 'active' && (
                  <div className="flex items-center justify-center mt-4">
                    <EnhancedTimerDisplay
                      countdownSeconds={countdownSeconds}
                      ratePerMin={ratePerMin}
                      userCredits={userCredits}
                      estimatedCreditsUsed={estimatedCreditsUsed}
                      onEndSession={handleEndSession}
                      psychicDeactivated={isPsychicDeactivated}
                    />
                  </div>
                )}
                {chatSessions.length === 0 ? (
                  <Button
                    onClick={() => navigate('/psychics')}
                    className="bg-[#00a884] hover:bg-[#128c7e] text-white mt-6"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Browse Psychics
                  </Button>
                ) : null}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
                  <Shield className="h-4 w-4" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {endedSessionData && (
        <RatingModal
          isOpen={showRatingModal && !hasRatedThisSession}
          onClose={() => {
            setShowRatingModal(false);
            setEndedSessionData(null);
          }}
          psychic={endedSessionData.psychic}
          sessionId={endedSessionData.sessionId}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {selectedPsychic && (
        <ChatRequestModal
          psychic={selectedPsychic}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onRequestSent={handleRequestSent}
          userBalance={userBalance}
          userCredits={userCredits}
        />
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onPaymentSuccess={fetchUserWallet}
      />

      {selectedPsychic && showAcceptModal && pendingAcceptedRequest && (
        <AcceptSessionModal
          selectedPsychic={selectedPsychic}
          ratePerMin={ratePerMin}
          userCredits={userCredits}
          pendingAcceptedRequest={pendingAcceptedRequest}
          showAcceptModal={showAcceptModal}
          setShowAcceptModal={setShowAcceptModal}
          handleAcceptSession={handleAcceptSession}
          handleDeclineAccepted={handleDeclineAccepted}
          ringtoneRef={ringtoneRef}
        />
      )}
    </div>
  );
}