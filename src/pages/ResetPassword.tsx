import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, Shield } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if the user came from a password reset link or already has a session
  useEffect(() => {
    const initSession = async () => {
      try {
        const hash = window.location.hash;

        if (hash.includes("type=recovery")) {
          // When user opens from the email reset link
          const { error } = await supabase.auth.exchangeCodeForSession(hash);
          if (error) {
            console.error("Failed to exchange recovery code:", error);
            setError("Invalid or expired password reset link.");
            return;
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            navigate("/auth");
          }
        }
      } catch (err: any) {
        console.error("Session check failed:", err);
        setError("An unexpected error occurred. Please try again later.");
      }
    };

    initSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      if (!data?.user) throw new Error("No user data returned after update.");

      toast({
        title: "Success!",
        description:
          "Your password has been updated successfully. Please log in again.",
      });

      // Supabase invalidates the session after password update
      await supabase.auth.signOut();

      // Delay slightly so toast can appear before navigation
      setTimeout(() => {
        setLoading(false);
        navigate("/auth");
      }, 1200);
    } catch (err: any) {
      console.error("Password update failed:", err);
      setError(err?.message || "Failed to reset password.");
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>

      <div className="container mx-auto max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your new password below to complete the reset process.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                  maxLength={100}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  maxLength={100}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ResetPassword;
