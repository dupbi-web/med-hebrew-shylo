import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock, Shield } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy"
  }),
  dataProcessingAccepted: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing"
  })
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  // Persist pending consent locally for post-confirmation upsert
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

  // Persist pending profile locally for post-confirmation upsert
  const persistPendingProfile = () => {
    try {
      localStorage.setItem(
        "pending_profile",
        JSON.stringify({
          // No profile fields are collected on this signup form; store defaults so the post-confirmation flow
          // has well-known keys and types.
          fullName: "",
          specialization: "",
          hospital: "",
          medicalField: "",
          howFoundUs: "other",
          profileDescription: "",
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
      // Validate input
      const validationResult = signUpSchema.safeParse({
        email,
        password,
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Validation failed";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Persist user-entered details to bridge email confirmation
      persistPendingConsent();
      persistPendingProfile();

      const redirectUrl = `${window.location.origin}/`;
      // Call supabase signUp once; using `data` and `error` names avoids redeclaration issues
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (signUpError) throw signUpError;

      // Store consent information
      if (data.user) {
        const { error: consentError } = await supabase
          .from("user_consent")
          .insert({
            user_id: data.user.id,
            terms_accepted: termsAccepted,
            privacy_accepted: privacyAccepted,
            data_processing_accepted: dataProcessingAccepted,
            marketing_accepted: marketingAccepted,
            ip_address: null, // Could be captured if needed
            user_agent: navigator.userAgent
          });

        if (consentError) {
          console.error("Error storing consent:", consentError);
        }
      }

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });

      // Clear only email/password; keep other UI state if needed
      setEmail("");
      setPassword("");
      setTermsAccepted(false);
      setPrivacyAccepted(false);
      setDataProcessingAccepted(false);
      setMarketingAccepted(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const upsertConsentForCurrentUser = async () => {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const u = sessionData?.session?.user;
    if (!u) throw new Error("No active session");

    // Load pending consent if present
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

    const { error } = await supabase
      .from("user_consent")
      .upsert(
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

  const upsertProfileForCurrentUser = async () => {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const u = sessionData?.session?.user;
    if (!u) throw new Error("No active session");

    // Load pending profile if present (use safe defaults)
    let payload = {
      fullName: "",
      specialization: "",
      hospital: "",
      medicalField: "",
      howFoundUs: "other",
      profileDescription: "",
    };
    try {
      const saved = localStorage.getItem("pending_profile");
      if (saved) {
        const p = JSON.parse(saved);
        payload = {
          fullName: p.fullName || "",
          specialization: p.specialization || "",
          hospital: p.hospital || "",
          medicalField: p.medicalField || "",
          howFoundUs: p.howFoundUs || "other",
          profileDescription: p.profileDescription || "",
        };
      }
    } catch {}

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
    clearPendingProfile();
  };

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

      // With a valid session, perform upserts protected by RLS
      await upsertConsentForCurrentUser();
      await upsertProfileForCurrentUser();

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

  return (
    <>
      <Helmet>
        <title>Sign In / Sign Up</title>
      </Helmet>

      <div className="container mx-auto max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Access your account or create a new one.</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email-signin" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="email-signin"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password-signin" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <Input
                      id="password-signin"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="email-signup" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email  (required)
                    </Label>
                    <Input
                      id="email-signup"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password-signup" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password (required)
                    </Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div className="text-sm font-semibold">GDPR Consent</div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                        I accept the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms and Conditions</a> *
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="privacy"
                        checked={privacyAccepted}
                        onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                      />
                      <Label htmlFor="privacy" className="text-sm font-normal cursor-pointer">
                        I accept the <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a> *
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="data-processing"
                        checked={dataProcessingAccepted}
                        onCheckedChange={(checked) => setDataProcessingAccepted(checked as boolean)}
                      />
                      <Label htmlFor="data-processing" className="text-sm font-normal cursor-pointer">
                        I consent to the processing of my personal data for the purposes of using this service *
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="marketing"
                        checked={marketingAccepted}
                        onCheckedChange={(checked) => setMarketingAccepted(checked as boolean)}
                      />
                      <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                        I consent to receive marketing communications (optional)
                      </Label>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      * Required fields. You can withdraw consent at any time from your profile settings.
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
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
