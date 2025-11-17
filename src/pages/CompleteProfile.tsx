import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// ✅ Add missing type
type HowFoundUs = "friend" | "telegram" | "social" | "search" | "other";

const CompleteProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [medicalField, setMedicalField] = useState("");

  // ✅ Add missing state
  const [howFoundUs, setHowFoundUs] = useState<HowFoundUs>("other");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUserData } = useAuthContext();

  useEffect(() => {
    const loadUserAndProfile = async () => {
      if (!user) {
        setError("Authentication required. Please sign in again.");
        setLoading(false);
        return;
      }

      // Prefill name from Google metadata
      const nameFromMetadata =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";
      setFullName(nameFromMetadata);

      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        setError("Failed to load profile data");
        setLoading(false);
        return;
      }

      if (profile) {
        setFullName(profile.full_name || "");
        setSpecialization(profile.specialization || "");
        setHospital(profile.hospital || "");
        setMedicalField(profile.medical_field || "");

        // ✅ Load howFoundUs if it exists
        setHowFoundUs(profile.how_found_us || "other");
      }

      // Load consent
      const { data: consent, error: consentError } = await supabase
        .from("user_consent")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (consentError && consentError.code !== "PGRST116") {
        setError("Failed to load consent data");
        setLoading(false);
        return;
      }

      if (consent) {
        setTermsAccepted(consent.terms_accepted);
        setPrivacyAccepted(consent.privacy_accepted);
        setDataProcessingAccepted(consent.data_processing_accepted);
        setMarketingAccepted(consent.marketing_accepted);
      }

      setLoading(false);
    };

    loadUserAndProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted || !privacyAccepted || !dataProcessingAccepted) {
      toast({
        title: "Consent required",
        description: "You must accept the required consents to proceed.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (!user) throw new Error("Session expired. Please sign in again.");

      // Upsert profile with howFoundUs
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          specialization,
          hospital,
          medical_field: medicalField,
          how_found_us: howFoundUs, // ✅ Added
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      // Upsert consent
      const { error: consentError } = await supabase.from("user_consent").upsert(
        {
          user_id: user.id,
          terms_accepted: termsAccepted,
          privacy_accepted: privacyAccepted,
          data_processing_accepted: dataProcessingAccepted,
          marketing_accepted: marketingAccepted,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
        { onConflict: "user_id" }
      );

      if (consentError) throw consentError;

      await refreshUserData();

      toast({
        title: "Profile updated",
        description: "Thank you for completing your profile.",
      });

      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center p-8">Loading…</p>;

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide additional information and accept the terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            </div>

            {/* Hospital */}
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Input id="hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} />
            </div>

            {/* Medical field */}
            <div>
              <Label htmlFor="medicalField">Medical Field</Label>
              <Input id="medicalField" value={medicalField} onChange={(e) => setMedicalField(e.target.value)} />
            </div>

            {/* ✅ How Found Us */}
            <div>
              <Label htmlFor="howFoundUs">How did you find us?</Label>
              <select
                id="howFoundUs"
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

            {/* Consent section remains unchanged */}
            <fieldset className="space-y-2 mt-4">

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} />
                <Label htmlFor="terms">I accept the Terms & Conditions *</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="privacy" checked={privacyAccepted} onCheckedChange={(v) => setPrivacyAccepted(!!v)} />
                <Label htmlFor="privacy">I accept the Privacy Policy *</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="dataproc" checked={dataProcessingAccepted} onCheckedChange={(v) => setDataProcessingAccepted(!!v)} />
                <Label htmlFor="dataproc">I consent to data processing *</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="marketing" checked={marketingAccepted} onCheckedChange={(v) => setMarketingAccepted(!!v)} />
                <Label htmlFor="marketing">I agree to receive marketing emails (optional)</Label>
              </div>
            </fieldset>

            <Button type="submit" disabled={saving} className="w-full mt-4">
              {saving ? "Saving…" : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
