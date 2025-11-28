import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock, Shield, FileText, ExternalLink } from "lucide-react";
import { z } from "zod";

type HowFoundUs = "friend" | "telegram" | "social" | "search" | "other";

interface PendingProfile {
  fullName: string;
  specialization: string;
  hospital: string;
  medicalField: string;
  howFoundUs: HowFoundUs;
  profileDescription: string;
}

interface PendingConsent {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingAccepted: boolean;
  marketingAccepted: boolean;
}

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(100),
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100),
  termsAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the terms and conditions" }),
  privacyAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the privacy policy" }),
  dataProcessingAccepted: z.boolean().refine((v) => v === true, { message: "You must consent to data processing" }),
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100),
  termsAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the terms and conditions" }),
  privacyAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the privacy policy" }),
  dataProcessingAccepted: z.boolean().refine((v) => v === true, { message: "You must consent to data processing" }),
});

const LegalLinks = () => (
  <p className="mt-2 text-xs text-muted-foreground">
    Read the{" "}
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [medicalField, setMedicalField] = useState("");
  const [howFoundUs, setHowFoundUs] = useState<HowFoundUs>("other");
  const [profileDescription, setProfileDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showGoogleProfileDialog, setShowGoogleProfileDialog] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Session storage helpers
  const saveToSessionStorage = useCallback((key: string, data: unknown): boolean => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) return false;
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const loadFromSessionStorage = useCallback(<T,>(key: string): T | null => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) return null;
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      return null;
    }
  }, []);

  const clearFromSessionStorage = useCallback((key: string): void => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) return;
      sessionStorage.removeItem(key);
    } catch (err) {
      console.error(`Failed`);
    }
  }, []);

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

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
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

      // OAuth will redirect, so no need to handle response here
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

  const handleGoogleSignUp = async () => {
    setError("");

    try {
      // Validate profile data before Google OAuth
      const validation = profileSchema.safeParse({
        fullName,
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || "Please complete all required fields";
        setError(msg);
        return;
      }

      // Save pending data to session storage
      const consent: PendingConsent = {
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
        marketingAccepted,
      };

      const profile: PendingProfile = {
        fullName,
        specialization,
        hospital,
        medicalField,
        howFoundUs,
        profileDescription,
      };

      saveToSessionStorage("pending_consent", consent);
      saveToSessionStorage("pending_profile", profile);
      saveToSessionStorage("just_signed_up", true);
      saveToSessionStorage("auth_method", "google");

      setShowGoogleProfileDialog(false);
      setLoading(true);

      const origin = window.location.origin;
      const isSecure = origin.startsWith("https://") || origin.includes("localhost");
      
      if (!isSecure && import.meta.env.PROD) {
        throw new Error("Production environment requires HTTPS");
      }

      const { data, error: signUpError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (signUpError) throw signUpError;

      // OAuth will redirect automatically
    } catch (err: any) {
      const errorMessage = err?.message || "Google sign up failed. Please try again.";
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
        fullName,
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || "Please check all required fields";
        setError(msg);
        return;
      }

      const consent: PendingConsent = {
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
        marketingAccepted,
      };

      const profile: PendingProfile = {
        fullName,
        specialization,
        hospital,
        medicalField,
        howFoundUs,
        profileDescription,
      };

      saveToSessionStorage("pending_consent", consent);
      saveToSessionStorage("pending_profile", profile);
      saveToSessionStorage("just_signed_up", true);
      saveToSessionStorage("auth_method", "email");

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
          data: {
            full_name: fullName.trim(),
          }
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
      setFullName("");
    } catch (err: any) {
      const errorMessage = err?.message || "Sign up failed. Please try again.";
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
const upsertConsentForCurrentUser = useCallback(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const saved = loadFromSessionStorage<PendingConsent>("pending_consent");
    const consent = saved || {
      termsAccepted: false,
      privacyAccepted: false,
      dataProcessingAccepted: false,
      marketingAccepted: false,
    };

    const payload = {
      user_id: user.id,
      terms_accepted: consent.termsAccepted,
      privacy_accepted: consent.privacyAccepted,
      data_processing_accepted: consent.dataProcessingAccepted,
      marketing_accepted: consent.marketingAccepted,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const { error } = await supabase
      .from("user_consent")
      .upsert(payload, { onConflict: "user_id" });


    if (error) throw error;

    clearFromSessionStorage("pending_consent");
  } catch (err) {
    console.error("Failed");
    throw err;
  }
}, [loadFromSessionStorage, clearFromSessionStorage]);

  const upsertProfileForCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const saved = loadFromSessionStorage<PendingProfile>("pending_profile");
      if (!saved) return;

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: saved.fullName.trim(),
          specialization: saved.specialization.trim(),
          hospital: saved.hospital.trim(),
          medical_field: saved.medicalField.trim(),
          how_found_us: saved.howFoundUs,
          description: saved.profileDescription.trim(),
        },
        { onConflict: "id" }
      );

      if (error) throw error;
      clearFromSessionStorage("pending_profile");
    } catch (err) {
      console.error("Failed");
      throw err;
    }
  }, [loadFromSessionStorage, clearFromSessionStorage]);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const justSignedUp = loadFromSessionStorage<boolean>("just_signed_up");
        const pendingConsent = loadFromSessionStorage<boolean>("pending_consent");
        if (justSignedUp) {
          try {
            await upsertProfileForCurrentUser();
            await upsertConsentForCurrentUser();

            clearFromSessionStorage("just_signed_up");
            clearFromSessionStorage("auth_method");

            toast({
              title: "Welcome!",
              description: "Your profile has been set up successfully.",
            });
          } catch (err) {
            console.error("signup failed:");
            toast({
              title: "Warning",
              description: "Account created but profile setup incomplete. Please update your profile.",
              variant: "destructive",
            });
          }
        }
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [
  loadFromSessionStorage,
  clearFromSessionStorage,
  upsertProfileForCurrentUser,
  upsertConsentForCurrentUser,
  toast,
]);

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
                  {/* Google Sign Up with Dialog */}
                  <Dialog open={showGoogleProfileDialog} onOpenChange={setShowGoogleProfileDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        <GoogleIcon />
                        <span className="ml-2">Sign up with Google</span>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Complete Your Profile</DialogTitle>
                        <DialogDescription>
                          Please provide the following information before continuing with Google.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="google-fullName">
                            Full name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="google-fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Dr. Jane Doe"
                            required
                            autoComplete="name"
                            minLength={2}
                            maxLength={100}
                          />
                        </div>

                        {/* Consent Checkboxes */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="google-terms"
                              checked={termsAccepted}
                              onCheckedChange={(v) => setTermsAccepted(!!v)}
                            />
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <Label htmlFor="google-terms" className="cursor-pointer text-sm">
                                <Shield className="mr-2 h-4 w-4 inline-block" />
                                I accept the Terms & Conditions <span className="text-red-500">*</span>
                              </Label>
                              <Button variant="ghost" size="sm" asChild>
                                <a href="/terms" target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="google-privacy"
                              checked={privacyAccepted}
                              onCheckedChange={(v) => setPrivacyAccepted(!!v)}
                            />
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <Label htmlFor="google-privacy" className="cursor-pointer text-sm">
                                I accept the Privacy Policy <span className="text-red-500">*</span>
                              </Label>
                              <Button variant="ghost" size="sm" asChild>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="google-dataproc"
                              checked={dataProcessingAccepted}
                              onCheckedChange={(v) => setDataProcessingAccepted(!!v)}
                            />
                            <Label htmlFor="google-dataproc" className="cursor-pointer text-sm">
                              I consent to data processing <span className="text-red-500">*</span>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="google-marketing"
                              checked={marketingAccepted}
                              onCheckedChange={(v) => setMarketingAccepted(!!v)}
                            />
                            <Label htmlFor="google-marketing" className="cursor-pointer text-sm">
                              I agree to receive marketing emails (optional)
                            </Label>
                          </div>
                        </div>

                        {/* Optional Profile Fields */}
                        <div className="space-y-2">
                          <Label htmlFor="google-specialization">Specialization</Label>
                          <Input
                            id="google-specialization"
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="Internal Medicine"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="google-hospital">Hospital</Label>
                          <Input
                            id="google-hospital"
                            type="text"
                            value={hospital}
                            onChange={(e) => setHospital(e.target.value)}
                            placeholder="Bnei Zion Medical Center"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="google-medicalField">Medical field</Label>
                          <Input
                            id="google-medicalField"
                            type="text"
                            value={medicalField}
                            onChange={(e) => setMedicalField(e.target.value)}
                            placeholder="NICU / Pediatrics / Surgery"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="google-howFoundUs">How did you find us?</Label>
                          <select
                            id="google-howFoundUs"
                            className="dark:bg-gray-800 dark:border-gray-700 w-full border rounded px-3 py-2"
                            value={howFoundUs}
                            onChange={(e) => setHowFoundUs(e.target.value as HowFoundUs)}
                          >
                            <option value="friend">Friend</option>
                            <option value="telegram">Telegram</option>
                            <option value="social">Social Media</option>
                            <option value="search">Search Engine</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="google-profileDescription">Short description</Label>
                          <Input
                            id="google-profileDescription"
                            type="text"
                            value={profileDescription}
                            onChange={(e) => setProfileDescription(e.target.value)}
                            placeholder="Your role and interests"
                          />
                        </div>

                        <Button
                          type="button"
                          className="w-full"
                          onClick={handleGoogleSignUp}
                          disabled={loading}
                        >
                          <GoogleIcon />
                          <span className="ml-2">
                            {loading ? "Connecting to Google..." : "Continue with Google"}
                          </span>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or sign up with email
                      </span>
                    </div>
                  </div>

                  {/* Email Sign Up Form */}
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-up">
                        Email <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="password-up">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password-up"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        autoComplete="new-password"
                        minLength={8}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Jane Doe"
                        required
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        disabled={loading}
                      />
                    </div>

                    {/* Consent Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(v) => setTermsAccepted(!!v)}
                          disabled={loading}
                        />
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <Label htmlFor="terms" className="cursor-pointer text-sm">
                            <Shield className="mr-2 h-4 w-4 inline-block" />
                            I accept the Terms & Conditions <span className="text-red-500">*</span>
                          </Label>
                          <Button variant="ghost" size="sm" asChild>
                            <a href="/terms" target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="privacy"
                          checked={privacyAccepted}
                          onCheckedChange={(v) => setPrivacyAccepted(!!v)}
                          disabled={loading}
                        />
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <Label htmlFor="privacy" className="cursor-pointer text-sm">
                            I accept the Privacy Policy <span className="text-red-500">*</span>
                          </Label>
                          <Button variant="ghost" size="sm" asChild>
                            <a href="/privacy" target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="dataproc"
                          checked={dataProcessingAccepted}
                          onCheckedChange={(v) => setDataProcessingAccepted(!!v)}
                          disabled={loading}
                        />
                        <Label htmlFor="dataproc" className="cursor-pointer text-sm">
                          I consent to data processing <span className="text-red-500">*</span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={marketingAccepted}
                          onCheckedChange={(v) => setMarketingAccepted(!!v)}
                          disabled={loading}
                        />
                        <Label htmlFor="marketing" className="cursor-pointer text-sm">
                          I agree to receive marketing emails (optional)
                        </Label>
                      </div>
                    </div>

                    {/* Optional Profile Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Internal Medicine"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital</Label>
                      <Input
                        id="hospital"
                        type="text"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="Bnei Zion Medical Center"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalField">Medical field</Label>
                      <Input
                        id="medicalField"
                        type="text"
                        value={medicalField}
                        onChange={(e) => setMedicalField(e.target.value)}
                        placeholder="NICU / Pediatrics / Surgery"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="howFoundUs">How did you find us?</Label>
                      <select
                        id="howFoundUs"
                        className="dark:bg-gray-800 dark:border-gray-700 w-full border rounded px-3 py-2"
                        value={howFoundUs}
                        onChange={(e) => setHowFoundUs(e.target.value as HowFoundUs)}
                        disabled={loading}
                      >
                        <option value="friend">Friend</option>
                        <option value="telegram">Telegram</option>
                        <option value="social">Social Media</option>
                        <option value="search">Search Engine</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profileDescription">Short description</Label>
                      <Input
                        id="profileDescription"
                        type="text"
                        value={profileDescription}
                        onChange={(e) => setProfileDescription(e.target.value)}
                        placeholder="Your role and interests"
                        disabled={loading}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <Mail className="mr-2 h-4 w-4" />
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
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
