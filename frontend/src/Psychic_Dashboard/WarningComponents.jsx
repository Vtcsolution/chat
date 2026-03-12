// components/WarningComponents.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Ban,
  ShieldAlert,
  Mail,
  Phone,
  Globe,
  Clock,
  XCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  User,
  Users,
  CreditCard,
  Zap,
  DollarSign,
  Sparkles,
  Shield,
  MoreVertical,
  Search,
  ArrowLeft,
  Send,
  Smile,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Pause,
  Play,
  StopCircle,
  Phone as PhoneIcon,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";

// ========== USER WARNING ALERT ==========
export const UserWarningAlert = ({ warning, isOpen, onClose }) => {
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
  const Icon = getWarningIcon(warning.warningType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md border-${color}-500 border-2`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-3 text-${color}-600`}>
            <div className={`p-2 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <span>⚠️ Psychic Warning #{warning.warningNumber}</span>
          </DialogTitle>
          <DialogDescription className="pt-4">
            <Alert variant="destructive" className={`border-${color}-300 bg-${color}-50`}>
              <AlertTriangle className={`h-4 w-4 text-${color}-600`} />
              <AlertTitle className={`text-${color}-800 font-bold`}>
                Psychic Violated Terms of Service
              </AlertTitle>
              <AlertDescription className={`text-${color}-700 mt-2`}>
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
            className={`w-full bg-${color}-600 hover:bg-${color}-700 text-white`}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========== PSYCHIC WARNING ALERT ==========
export const PsychicWarningAlert = ({ warning, onAcknowledge, isOpen, onClose }) => {
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
  const Icon = getWarningIcon(warning.warningType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md border-${color}-500 border-2`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-3 text-${color}-600`}>
            <div className={`p-2 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <span>⚠️ Warning #{warning.warningNumber}</span>
          </DialogTitle>
          <DialogDescription className="pt-4">
            <Alert variant="destructive" className={`border-${color}-300 bg-${color}-50`}>
              <AlertTriangle className={`h-4 w-4 text-${color}-600`} />
              <AlertTitle className={`text-${color}-800 font-bold`}>
                Do Not Share Personal Contact Information
              </AlertTitle>
              <AlertDescription className={`text-${color}-700 mt-2`}>
                {warning.message}
              </AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Issued: {new Date(warning.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldAlert className="h-4 w-4" />
                <span>Violation: {warning.warningType}</span>
              </div>

              {warning.warningNumber === 2 && (
                <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ This is your second warning. One more violation will result in immediate account deactivation.
                  </p>
                </div>
              )}

              {warning.warningNumber === 3 && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    🔴 Your account has been deactivated due to multiple violations.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Progress 
                value={((warning.warningNumber) / 3) * 100} 
                className={`h-2 ${warning.warningNumber === 3 ? 'bg-red-200' : 'bg-gray-200'}`}
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Warning 1</span>
                <span>Warning 2</span>
                <span>Warning 3</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              onAcknowledge(warning.warningId);
              onClose();
            }}
            className={`w-full bg-${color}-600 hover:bg-${color}-700 text-white`}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========== PSYCHIC DEACTIVATED NOTICE ==========
export const PsychicDeactivatedNotice = ({ psychicName, onClose }) => {
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

// ========== USER DEACTIVATED NOTICE ==========
export const UserDeactivatedNotice = ({ userName, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-orange-500 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center mb-6">
            <Ban className="h-12 w-12 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Deactivated</h2>
          
          <p className="text-gray-600 mb-6">
            {userName} has been deactivated due to multiple violations of our terms of service.
            Your chat session has been ended.
          </p>

          <div className="space-y-3 w-full">
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Chats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== ACCOUNT DEACTIVATION NOTICE ==========
export const AccountDeactivationNotice = ({ deactivatedAt, warningCount, onContactSupport }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-red-500 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <Ban className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Deactivated</h2>
          
          <p className="text-gray-600 mb-6">
            Your account has been deactivated due to multiple violations of our terms of service regarding sharing personal contact information.
          </p>

          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Deactivated on:</span>
              <span className="font-medium">{new Date(deactivatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total warnings:</span>
              <span className="font-medium text-red-600">{warningCount}/3</span>
            </div>
          </div>

          <div className="space-y-3 w-full">
            <Button
              onClick={onContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Return to Login
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you believe this was a mistake, please contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== BLOCKED MESSAGE INDICATOR - FIXED VERSION ==========
export const BlockedMessageIndicator = ({ message, isOwn }) => {
  return (
    <div className={cn(
      "px-4 py-3 rounded-lg max-w-full",
      isOwn 
        ? "bg-orange-100 border border-orange-300" 
        : "bg-gray-100 border border-gray-300"
    )}>
      <div className="flex items-start gap-2">
        <ShieldAlert className={cn(
          "h-4 w-4 flex-shrink-0 mt-0.5",
          isOwn ? "text-orange-600" : "text-gray-600"
        )} />
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            isOwn ? "text-orange-800" : "text-gray-800"
          )}>
            {isOwn ? "Your Message Was Blocked" : "Message Blocked"}
          </p>
          <p className={cn(
            "text-xs mt-1",
            isOwn ? "text-orange-600" : "text-gray-600"
          )}>
            {message?.reason || 'Message contained prohibited content'}
          </p>
          {message?.warningNumber && (
            <Badge className={cn(
              "mt-2 text-white text-xs",
              isOwn ? "bg-orange-500" : "bg-gray-500"
            )}>
              Warning #{message.warningNumber}
            </Badge>
          )}
          {isOwn && message?.warningNumber === 3 && (
            <p className="text-xs text-red-600 mt-2 font-bold">
              ⚠️ Your account has been deactivated due to multiple violations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== WARNING BADGE ==========
export const WarningBadge = ({ count, isActive }) => {
  if (!count || count === 0) return null;

  const getColor = () => {
    if (!isActive) return 'bg-red-500';
    if (count === 1) return 'bg-yellow-500';
    if (count === 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      <div className={`h-3 w-3 rounded-full ${getColor()} animate-pulse`} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-600 rounded-full h-4 w-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
};

// ========== SYSTEM MESSAGE ==========
export const SystemMessage = ({ content, type = 'info', warningNumber }) => {
  const getTypeStyles = () => {
    switch(type) {
      case 'warning':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  return (
    <div className="flex justify-center my-2">
      <div className={cn(
        "px-4 py-2 rounded-lg max-w-[80%] text-center border",
        getTypeStyles()
      )}>
        <div className="flex items-center justify-center gap-2">
          {type === 'warning' && <AlertTriangle className="h-4 w-4" />}
          <p className="text-sm">{content}</p>
          {warningNumber && (
            <Badge className="bg-red-500 text-white text-xs">
              Warning #{warningNumber}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};