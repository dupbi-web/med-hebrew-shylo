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

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

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

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Medical Terms Game</title>
        <meta name="description" content="Sign in to your account to track your learning progress and access personalized features." />
      </Helmet>

      <div className="container mx-auto max-w-md py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>
              Sign in to track your learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
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