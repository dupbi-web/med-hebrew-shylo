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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock, Shield, FileText, ExternalLink } from "lucide-react";
import { z } from "zod";
type HowFoundUs = "friend" | "telegram" | "social" | "search" | "other";

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  termsAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the terms and conditions" }),
  privacyAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the privacy policy" }),
  dataProcessingAccepted: z.boolean().refine((v) => v === true, { message: "You must consent to data processing" }),
});

// Small helper for compact legal links
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

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Consent checkboxes
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  // Profile fields
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

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const persistPendingConsent = () => {
    try {
      localStorage.setItem(
        "pending_consent",
        JSON.stringify({
          termsAccepted,
          privacyAccepted,
          dataProcessingAccepted,
          marketingAccepted,
        })
      );
    } catch {}

  };

  const clearPendingConsent = () => {
    try {
      localStorage.removeItem("pending_consent");
    } catch {}
  };

  const persistPendingProfile = () => {
    try {
      localStorage.setItem(
        "pending_profile",
        JSON.stringify({
          fullName,
          specialization,
          hospital,
          medicalField,
          howFoundUs,
          profileDescription,
        })
      );
    } catch {}
  };

  const clearPendingProfile = () => {
    try {
      localStorage.removeItem("pending_profile");
    } catch {}
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validation = signUpSchema.safeParse({
        email,
        password,
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || "Validation failed";
        setError(msg);
        setLoading(false);
        return;
      }

      persistPendingConsent();
      persistPendingProfile();

      try {
        localStorage.setItem("just_signed_up", "1");
      } catch {}

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });

      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const upsertConsentForCurrentUser = async () => {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const u = sessionData?.session?.user;
    if (!u) throw new Error("No active session");

    let consent = {
      termsAccepted,
      privacyAccepted,
      dataProcessingAccepted,
      marketingAccepted,
    };

    try {
      const saved = localStorage.getItem("pending_consent");
      if (saved) {
        const parsed = JSON.parse(saved);
        consent = {
          termsAccepted: !!parsed.termsAccepted,
          privacyAccepted: !!parsed.privacyAccepted,
          dataProcessingAccepted: !!parsed.dataProcessingAccepted,
          marketingAccepted: !!parsed.marketingAccepted,
        };
      }
    } catch {}

    const { error } = await supabase.from("user_consent").upsert(
      {
        user_id: u.id,
        terms_accepted: consent.termsAccepted,
        privacy_accepted: consent.privacyAccepted,
        data_processing_accepted: consent.dataProcessingAccepted,
        marketing_accepted: consent.marketingAccepted,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;

    clearPendingConsent();
  };

  const upsertProfileForCurrentUser = async (payload: {
    fullName: string;
    specialization: string;
    hospital: string;
    medicalField: string;
    howFoundUs: HowFoundUs;
    profileDescription: string;
  }) => {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const u = sessionData?.session?.user;
    if (!u) throw new Error("No active session");

    const { error } = await supabase.from("profiles").upsert(
      {
        id: u.id,
        full_name: payload.fullName,
        specialization: payload.specialization,
        hospital: payload.hospital,
        medical_field: payload.medicalField,
        how_found_us: payload.howFoundUs,
        description: payload.profileDescription,
      },
      { onConflict: "id" }
    );

    if (error) throw error;
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      try {
        const justSignedUp = localStorage.getItem("just_signed_up") === "1";
        if (event === "SIGNED_IN" && justSignedUp) {
          try {
            const saved = localStorage.getItem("pending_profile");
            if (saved) {
              const p = JSON.parse(saved);
              const payload = {
                fullName: p.fullName || "",
                specialization: p.specialization || "",
                hospital: p.hospital || "",
                medicalField: p.medicalField || "",
                howFoundUs: (p.howFoundUs as HowFoundUs) || "other",
                profileDescription: p.profileDescription || "",
              };
              await upsertProfileForCurrentUser(payload);
            }
          } finally {
            clearPendingProfile();
            try {
              localStorage.removeItem("just_signed_up");
            } catch {}
          }

          try {
            await upsertConsentForCurrentUser();
          } catch {}
        }
      } catch {
        // ignore
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.message || "Sign in failed");
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

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description:
          "If an account exists with this email, you will receive a password reset link.",
      });

      setShowResetDialog(false);
      setResetEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };


return (
  <>
    <Helmet>
      <title>Sign In / </title>
    </Helmet>

    <div className="mx-auto max-w-md py-10">
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

            {/* ---------- SIGN IN ---------- */}
            <TabsContent value="sign-in">
              <form onSubmit={handleSignIn} className="space-y-5">
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
                  />
                  <LegalLinks />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                {/* Reset password */}
                <div className="text-center">
                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
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
                          Enter your email and we’ll send you a reset link.
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
              </form>
            </TabsContent>

            {/* ---------- SIGN UP ---------- */}
            <TabsContent value="sign-up">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email (required)</Label>
                  <Input
                    id="email-up"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-up">Password (required)</Label>
                  <Input
                    id="password-up"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(v) => setTermsAccepted(!!v)}
                    />
                    <Label htmlFor="terms" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4 inline-block" />
                      I accept the Terms & Conditions
                    </Label>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/terms" target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={privacyAccepted}
                      onCheckedChange={(v) => setPrivacyAccepted(!!v)}
                    />
                    <Label htmlFor="privacy" className="cursor-pointer">
                      I accept the Privacy Policy
                    </Label>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/privacy" target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataproc"
                      checked={dataProcessingAccepted}
                      onCheckedChange={(v) => setDataProcessingAccepted(!!v)}
                    />
                    <Label htmlFor="dataproc" className="cursor-pointer">
                      I consent to data processing
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={marketingAccepted}
                      onCheckedChange={(v) => setMarketingAccepted(!!v)}
                    />
                    <Label htmlFor="marketing" className="cursor-pointer">
                      I agree to receive marketing emails (optional)
                    </Label>
                  </div>
                </div>

                {/* Optional Profile Fields */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Internal Medicine"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input
                    id="hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="Bnei Zion Medical Center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalField">Medical field</Label>
                  <Input
                    id="medicalField"
                    value={medicalField}
                    onChange={(e) => setMedicalField(e.target.value)}
                    placeholder="NICU / Pediatrics / Surgery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="howFoundUs">How did you find us?</Label>
                  <select
                    id="howFoundUs"
                    className="dark:bg-gray-800 dark:border-gray-700 w-full border rounded px-3 py-2"
                    value={howFoundUs}
                    onChange={(e) => setHowFoundUs(e.target.value as HowFoundUs)}
                  >
                    <option value="friend">Friend</option>
                    <option value="telegram">Telegram</option>
                    <option value="social">Social</option>
                    <option value="search">Search</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileDescription">Short description</Label>
                  <Input
                    id="profileDescription"
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    placeholder="Your role and interests"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </>
);

};

export default Auth;
