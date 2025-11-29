import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().trim().email({ message: "Invalid email address" }).max(255),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
    confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters" })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const LegalLinks = () => (
  <p className="mt-2 text-xs text-muted-foreground">
    By continuing, you agree to our{" "}
    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
      Terms & Conditions
    </a>{" "}
    and{" "}
    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
      Privacy Policy
    </a>
    .
  </p>
);

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // *** ADDED ***
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/");
        }
      } catch (err) {
        console.error("Auth failed:");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const origin = window.location.origin;
      const isSecure = origin.startsWith("https://") || origin.includes("localhost");

      if (!isSecure && import.meta.env.PROD) {
        throw new Error("Production environment requires HTTPS");
      }

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (signInError) throw signInError;
    } catch (err: any) {
      const errorMessage = err?.message || "Google sign in failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validation = signUpSchema.safeParse({
        email,
        password,
        confirmPassword,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || "Please check all required fields";
        setError(msg);
        return;
      }

      const origin = window.location.origin;
      const isSecure = origin.startsWith("https://") || origin.includes("localhost");

      if (!isSecure && import.meta.env.PROD) {
        throw new Error("Production environment requires HTTPS");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "Please verify your email address to complete registration.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your account has been created.",
        });
      }

      setEmail("");
      setPassword("");
      setConfirmPassword(""); // *** ADDED ***
    } catch (err: any) {
      const errorMessage = err?.message || "Sign up failed. Please try again.";
      setError(errorMessage);
      setPassword("");
      setConfirmPassword(""); // *** ADDED ***

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email.trim() || !password) {
        throw new Error("Please enter both email and password");
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Sign in failed. Please check your credentials.";
      setError(errorMessage);
      setPassword("");

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const emailSchema = z.string().trim().email({ message: "Invalid email address" });
      const validationResult = emailSchema.safeParse(resetEmail);

      if (!validationResult.success) {
        throw new Error("Please enter a valid email address");
      }

      const trimmedEmail = resetEmail.trim();
      const origin = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "If an account exists with this email, you will receive a password reset link.",
      });

      setShowResetDialog(false);
      setResetEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In / Sign Up - MediVrit</title>
        <meta name="description" content="Sign in to your account or create a new one" />
      </Helmet>

      <div className="mx-auto max-w-md py-10 px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Account</CardTitle>
            <CardDescription>
              Access your account or create a new one.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="sign-in" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="sign-in">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="sign-up">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* ---------- SIGN IN TAB ---------- */}
              <TabsContent value="sign-in">
                <div className="space-y-4">
                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <GoogleIcon />
                    <span className="ml-2">Continue with Google</span>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Sign In Form */}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-in">Email</Label>
                      <Input
                        id="email-in"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-in">Password</Label>
                      <Input
                        id="password-in"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        disabled={loading}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="text-center">
                      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            className="text-sm text-muted-foreground hover:text-primary"
                            type="button"
                          >
                            Forgot your password?
                          </Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Mail className="h-5 w-5" />
                              Reset Password
                            </DialogTitle>
                            <DialogDescription>
                              Enter your email and we'll send you a reset link.
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                              <Label htmlFor="reset-email">Email</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                disabled={resetLoading}
                              />
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={resetLoading}
                            >
                              {resetLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <LegalLinks />
                  </form>
                </div>
              </TabsContent>

              {/* ---------- SIGN UP TAB ---------- */}
              <TabsContent value="sign-up">
                <div className="space-y-4">
                  {/* Google Sign Up */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <GoogleIcon />
                    <span className="ml-2">Sign up with Google</span>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Sign Up Form */}
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-up">Email</Label>
                      <Input
                        id="email-up"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-up">Password</Label>
                      <Input
                        id="password-up"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>

                    {/* *** ADDED CONFIRM PASSWORD FIELD *** */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password-up">Confirm Password</Label>
                      <Input
                        id="confirm-password-up"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>

                    <LegalLinks />
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
