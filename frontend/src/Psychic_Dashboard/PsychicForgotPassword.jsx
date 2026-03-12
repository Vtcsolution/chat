import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, Shield, Key, Sparkles } from "lucide-react";

export default function PsychicForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/human-psychics/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Reset link sent to your email");
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-50 to-amber-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 h-60 w-60 rounded-full bg-purple-600 blur-[80px]"></div>
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-amber-500 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 border-2 border-amber-500">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-purple-900">Psychic Portal</h1>
          </div>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="pb-6 border-b border-amber-200 bg-gradient-to-r from-purple-50 to-amber-50">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3 text-purple-900">
              <Shield className="h-6 w-6 text-amber-600" />
              Reset Psychic Password
            </CardTitle>
            <CardDescription className="text-center text-base">
              Enter your registered email to receive a password reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold text-purple-900">
                  <Mail className="h-4 w-4 text-amber-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full py-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className="p-4 rounded-xl border text-center bg-green-50 border-green-200">
                  <p className="font-medium text-green-700">{message}</p>
                  <p className="text-sm mt-2 text-gray-600">Check your inbox and spam folder</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl border text-center bg-red-50 border-red-200">
                  <p className="font-medium text-red-700">{error}</p>
                </div>
              )}

              <Button
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white font-medium text-gray-500">
                  Return to
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Link to="/psychic/login">
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Psychic Login
                </Button>
              </Link>
             
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}