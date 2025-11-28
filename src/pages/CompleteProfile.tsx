import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileText, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { z } from "zod";

type HowFoundUs = "friend" | "telegram" | "social" | "search" | "other";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100),
  termsAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the terms and conditions" }),
  privacyAccepted: z.boolean().refine((v) => v === true, { message: "You must accept the privacy policy" }),
  dataProcessingAccepted: z.boolean().refine((v) => v === true, { message: "You must consent to data processing" }),
});

const CompleteProfile = () => {
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [medicalField, setMedicalField] = useState("");
  const [howFoundUs, setHowFoundUs] = useState<HowFoundUs>("other");
  const [profileDescription, setProfileDescription] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setChecking(false);
          navigate("/auth");
          return;
        }

        const [profileResult, consentResult] = await Promise.all([
          supabase.from("profiles").select("id, full_name").eq("id", user.id).single(),
          supabase.from("user_consent").select("terms_accepted, privacy_accepted, data_processing_accepted")
            .eq("user_id", user.id).single()
        ]);

        const hasCompleteProfile = !profileResult.error &&
          profileResult.data?.full_name &&
          profileResult.data.full_name.trim().length >= 2;

        const hasCompleteConsent = !consentResult.error &&
          consentResult.data?.terms_accepted === true &&
          consentResult.data?.privacy_accepted === true &&
          consentResult.data?.data_processing_accepted === true;

        if (hasCompleteProfile && hasCompleteConsent) {
          setChecking(false);
          navigate("/");
          return;
        }

        if (profileResult.data?.full_name) {
          setFullName(profileResult.data.full_name);
        } else if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }

        if (consentResult.data) {
          setTermsAccepted(consentResult.data.terms_accepted || false);
          setPrivacyAccepted(consentResult.data.privacy_accepted || false);
          setDataProcessingAccepted(consentResult.data.data_processing_accepted || false);
        }

        setChecking(false);
      } catch (err) {
        console.error("Error checking profile status:", err);
        setChecking(false);
      }
    };

    checkProfileStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validation = profileSchema.safeParse({
        fullName,
        termsAccepted,
        privacyAccepted,
        dataProcessingAccepted,
      });

      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || "Please complete all required fields";
        setError(msg);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          specialization: specialization.trim() || null,
          hospital: hospital.trim() || null,
          medical_field: medicalField.trim() || null,
          how_found_us: howFoundUs,
          description: profileDescription.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      const { error: consentError } = await supabase.from("user_consent").upsert({
        user_id: user.id,
        terms_accepted: termsAccepted,
        privacy_accepted: privacyAccepted,
        data_processing_accepted: dataProcessingAccepted,
        marketing_accepted: marketingAccepted,
        consent_date: new Date().toISOString(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (consentError) throw consentError;

      toast({
        title: "Profile Completed!",
        description: "Your profile has been set up successfully.",
      });

      setTimeout(() => {
        navigate("/home", { state: { justCompletedProfile: true } });
      }, 500);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to complete profile. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Checking your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Complete Your Profile - MediVrit</title>
      </Helmet>

      <div className="mx-auto max-w-2xl py-10 px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Before accessing the platform, please accept our terms and complete your profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required:</strong> You must accept our Terms & Privacy Policy to continue.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(!!v)}
                    required
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
                    required
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
                    required
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

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel & Sign Out
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !termsAccepted || !privacyAccepted || !dataProcessingAccepted || !fullName.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CompleteProfile;
