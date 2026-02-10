import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Gift, X, Sparkles, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import axios from 'axios';

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

export default function Signup() {
  const { register, user, error } = useAuth();
  const navigate = useNavigate();
  const hasInteracted = useRef(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (registrationSuccess && showSuccess) {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [registrationSuccess, showSuccess, navigate]);

  useEffect(() => {
    if (registrationSuccess) {
      setShowSuccess(true);
    }
  }, [registrationSuccess]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setFormErrors({ ...formErrors, [id]: '' });

    if (!hasInteracted.current && window.ttq) {
      window.ttq.track('Lead', {
        content_id: formData.email || 'unknown',
        field: id,
      });
      hasInteracted.current = true;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const result = await register(payload);
      if (result.success) {
        if (window.ttq) {
          window.ttq.track('SignUp', {
            content_id: result.userId || formData.email,
            email: formData.email,
          });
        }

        toast.success('Account created successfully!', {
          duration: 5000,
        });
        setRegistrationSuccess(true);
        
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Registration failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessMessage = () => {
    setShowSuccess(false);
    navigate("/");
  };

  useEffect(() => {
    if (user && !error && !registrationSuccess) {
      navigate("/");
    }
    if (error) {
      toast.error(error);
    }
  }, [user, error, navigate, registrationSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}>
      
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 h-60 w-60 rounded-full" 
          style={{ backgroundColor: colors.accent, filter: 'blur(80px)' }}></div>
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full" 
          style={{ backgroundColor: colors.secondary, filter: 'blur(100px)' }}></div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-6 left-6 h-12 w-12 rounded-full border-4 opacity-20 hidden md:block"
        style={{ borderColor: colors.secondary }}></div>
      <div className="absolute bottom-6 right-6 h-16 w-16 rounded-full border-4 opacity-20 hidden md:block"
        style={{ borderColor: colors.accent }}></div>

      <div className="w-full max-w-md z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center border-3"
              style={{ 
                backgroundColor: colors.primary,
                borderColor: colors.secondary,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.bgLight} 100%)`
              }}>
              <Sparkles className="h-6 w-6" style={{ color: colors.secondary }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              Start Your Journey
            </h1>
          </div>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden"
          style={{ 
            backgroundColor: 'white',
            borderColor: colors.secondary + '20'
          }}>
          <CardHeader className="pb-6 border-b"
            style={{ borderColor: colors.secondary + '20' }}>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3"
              style={{ color: colors.primary }}>
              <User className="h-6 w-6" style={{ color: colors.secondary }} />
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-base">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* Inline Success Message */}
            {registrationSuccess && !showSuccess && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-emerald-300 rounded-xl p-4 shadow-md animate-pulse"
                style={{ borderColor: colors.success + '50' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" style={{ color: colors.success }} />
                    <div>
                      <h3 className="font-bold" style={{ color: colors.primary }}>Account Created! 🎉</h3>
                      <p className="text-sm" style={{ color: colors.bgLight }}>
                        Click here to view your 2 free credits
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSuccess(true)}
                    variant="outline"
                    size="sm"
                    style={{ 
                      borderColor: colors.secondary,
                      color: colors.secondary
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username" className="flex items-center gap-2 font-semibold"
                  style={{ color: colors.primary }}>
                  <User className="h-4 w-4" style={{ color: colors.secondary }} />
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-5 w-5" style={{ color: colors.bgLight + '40' }} />
                  </div>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    className="w-full pl-11 py-6 transition-all duration-200 focus:scale-[1.01]"
                    disabled={isLoading || registrationSuccess}
                    style={{ 
                      borderColor: colors.secondary + '30',
                      color: colors.primary
                    }}
                  />
                </div>
                {formErrors.username && (
                  <div className="text-sm px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: colors.danger + '10',
                      color: colors.danger
                    }}>
                    {formErrors.username}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold"
                  style={{ color: colors.primary }}>
                  <Mail className="h-4 w-4" style={{ color: colors.secondary }} />
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="h-5 w-5" style={{ color: colors.bgLight + '40' }} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 py-6 transition-all duration-200 focus:scale-[1.01]"
                    disabled={isLoading || registrationSuccess}
                    style={{ 
                      borderColor: colors.secondary + '30',
                      color: colors.primary
                    }}
                  />
                </div>
                {formErrors.email && (
                  <div className="text-sm px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: colors.danger + '10',
                      color: colors.danger
                    }}>
                    {formErrors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 font-semibold"
                  style={{ color: colors.primary }}>
                  <Lock className="h-4 w-4" style={{ color: colors.secondary }} />
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="h-5 w-5" style={{ color: colors.bgLight + '40' }} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password (min. 6 characters)"
                    required
                    className="w-full pl-11 pr-11 py-6 transition-all duration-200 focus:scale-[1.01]"
                    disabled={isLoading || registrationSuccess}
                    style={{ 
                      borderColor: colors.secondary + '30',
                      color: colors.primary
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 hover:scale-110"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: colors.secondary }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <div className="text-sm px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: colors.danger + '10',
                      color: colors.danger
                    }}>
                    {formErrors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 font-semibold"
                  style={{ color: colors.primary }}>
                  <Lock className="h-4 w-4" style={{ color: colors.secondary }} />
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Shield className="h-5 w-5" style={{ color: colors.bgLight + '40' }} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-11 pr-11 py-6 transition-all duration-200 focus:scale-[1.01]"
                    disabled={isLoading || registrationSuccess}
                    style={{ 
                      borderColor: colors.secondary + '30',
                      color: colors.primary
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 hover:scale-110"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: colors.secondary }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <div className="text-sm px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: colors.danger + '10',
                      color: colors.danger
                    }}>
                    {formErrors.confirmPassword}
                  </div>
                )}
              </div>

              {error && !registrationSuccess && (
                <div className="p-3 rounded-lg text-sm font-medium text-center"
                  style={{ 
                    backgroundColor: colors.danger + '10',
                    color: colors.danger,
                    borderColor: colors.danger + '30'
                  }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-2 py-6 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                style={{ 
                  backgroundColor: colors.secondary,
                  color: colors.primary
                }}
                disabled={isLoading || registrationSuccess}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : registrationSuccess ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Account Created!
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="pt-6 border-t text-center"
              style={{ borderColor: colors.secondary + '20' }}>
              <p className="text-sm mb-4" style={{ color: colors.bgLight }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold transition-all duration-200 hover:scale-105 inline-block"
                  style={{ color: colors.accent }}
                >
                  Login
                </Link>
              </p>

              {/* Credit Info */}
              <div className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: colors.secondary + '10',
                  borderColor: colors.secondary + '30',
                  color: colors.primary
                }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.secondary + '20' }}>
                    <Gift className="h-5 w-5" style={{ color: colors.secondary }} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Welcome Gift! 🎁</p>
                    <p className="text-sm">
                      Get <strong>2 FREE credits</strong> to start chatting with coaches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs" style={{ color: colors.bgLight }}>
            © {new Date().getFullYear()} Spiritual Chat. All rights reserved.
          </p>
        </div>
      </div>

      {/* Large Success Overlay Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: colors.success + '20', padding: '8px', borderRadius: '50%' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: colors.success }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Welcome! 🎉</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSuccessMessage}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                style={{ color: colors.bgLight }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl border p-4"
                style={{ 
                  backgroundColor: colors.secondary + '10',
                  borderColor: colors.secondary + '30'
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full"
                    style={{ backgroundColor: colors.secondary + '20' }}>
                    <Gift className="h-6 w-6" style={{ color: colors.secondary }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: colors.primary }}>
                      You received 2 FREE credits! 🎁
                    </h3>
                  </div>
                </div>
                <p className="mb-2" style={{ color: colors.bgLight }}>
                  <strong>This is your welcome gift!</strong> Start chatting with one of our coaches.
                </p>
              </div>

              <div className="rounded-lg p-4"
                style={{ 
                  backgroundColor: colors.primary + '05',
                  color: colors.bgLight
                }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>What you can do now:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.success }}></div>
                    <span>Choose a coach that fits you</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.success }}></div>
                    <span>Start a conversation (first 2 minutes free)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.success }}></div>
                    <span>Discover your personal insights</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full font-bold py-3 text-lg transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: colors.primary
                  }}
                >
                  🚀 Go to Homepage
                </Button>
                
                <Button
                  onClick={() => navigate("/aura-advisors")}
                  variant="outline"
                  className="w-full transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    borderColor: colors.secondary,
                    color: colors.secondary
                  }}
                >
                  👁️ View Coaches Directly
                </Button>
              </div>

              <div className="text-center pt-4 border-t" style={{ borderColor: colors.secondary + '20' }}>
                <p className="text-sm mb-2" style={{ color: colors.bgLight }}>
                  Auto redirect in <span className="font-bold" style={{ color: colors.primary }}>{countdown} seconds</span>
                </p>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: colors.primary + '10' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ 
                      backgroundColor: colors.success,
                      width: `${(countdown / 10) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}