import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Signin() {
  /// useAuth hook gives access to login logic and user state
  const { login, user, loading, error } = useAuth();

  /// used to redirect user after login
  const navigate = useNavigate();

  /// input field state
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  /// handles typing in inputs
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      
      [e.target.id]: e.target.value,
    });
  };

  /// handles form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); /// prevent default browser refresh

    const result = await login(credentials); /// send login request
    if (result.success) {
      toast.success("Login successful");
      navigate("/"); /// redirect if login success
    } else {
      toast.error(result.message); /// show error
    }
  };

  /// redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your details to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full mt-6"
              size="lg"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Inline error display */}
            
          </form>

          <div className="text-end my-2">
            <Link
              to="/forgot-password"
              className="text-[#3B5EB7] hover:underline font-medium"
            >
              Forgot Password
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            No account?{" "}
            <Link
              to="/register"
              className="text-[#3B5EB7] hover:underline font-medium"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
