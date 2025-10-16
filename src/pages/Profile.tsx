import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  User,
  Download,
  Shield,
  Calendar,
  Mail,
  FileText,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  Timer,
} from "lucide-react";

interface UserConsent {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  data_processing_accepted: boolean;
  marketing_accepted: boolean;
  created_at: string;
  updated_at: string;
  user_agent?: string | null;
}

type DeletionStatus = "pending" | "processing" | "completed";

interface DataDeletionRequest {
  id: string;
  user_id: string;
  request_date: string;
  status: DeletionStatus;
  completed_date: string | null;
  created_at: string;
}

type HowFoundUs = "friend" | "telegram" | "social" | "search" | "other";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [consent, setConsent] = useState<UserConsent | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<DataDeletionRequest | null>(null);

  // Professional details
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [medicalField, setMedicalField] = useState("");
  const [howFoundUs, setHowFoundUs] = useState<HowFoundUs>("other");
  const [profileDescription, setProfileDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // consent toggle
  const [saving, setSaving] = useState(false); // profile save
  const [notifying, setNotifying] = useState(false); // telegram notify while deletion request
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);

        // Load consent (maybeSingle to avoid throw if no row)
        const { data: consentData } = await supabase
          .from("user_consent")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (consentData) setConsent(consentData as UserConsent);

        // Load existing deletion request (pending/processing)
        const { data: delReqData } = await supabase
          .from("data_deletion_requests")
          .select("*")
          .eq("user_id", session.user.id)
          .in("status", ["pending", "processing"])
          .order("request_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (delReqData) setDeletionRequest(delReqData as DataDeletionRequest);

        // Load profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          setFullName(profile.full_name || "");
          setSpecialization(profile.specialization || "");
          setHospital(profile.hospital || "");
          setMedicalField(profile.medical_field || "");
          setHowFoundUs((profile.how_found_us || "other") as HowFoundUs);
          setProfileDescription(profile.description || "");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const updateConsent = async (field: keyof Pick<UserConsent, "marketing_accepted">, value: boolean) => {
    if (!user || !consent) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("user_consent")
        .update({
          [field]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setConsent((prev) =>
        prev ? { ...prev, [field]: value, updated_at: new Date().toISOString() } : prev
      );

      toast({
        title: "Preferences updated",
        description: "Your consent preferences have been saved.",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to update preferences");
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const exportUserData = async () => {
    if (!user) return;
    try {
      const userData = {
        account: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at,
        },
        consent: consent || null,
        profile: {
          full_name: fullName,
          specialization,
          hospital,
          medical_field: medicalField,
          how_found_us: howFoundUs,
          description: profileDescription,
        },
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `user_data_${user.id}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").upsert(
        {
          id: session.user.id,
          full_name: fullName,
          specialization,
          hospital,
          medical_field: medicalField,
          how_found_us: howFoundUs,
          description: profileDescription,
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      toast({ title: "Profile saved", description: "Your details have been updated." });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message || "Could not save your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Notify admin on Telegram (no debug surfaced to user)
  const sendTelegram = async (text: string) => {
    try {
      setNotifying(true);
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
    } catch {
      // suppress debug to users
    } finally {
      setNotifying(false);
    }
  };

  // Request-only deletion flow (admin completes deletion) + Telegram notify
  const handleAccountDeletion = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Request account deletion? An administrator will review your request. This cannot be undone once completed."
    );
    if (!confirmed) return;

    try {
      // Check for existing pending/processing request
      const { data: existingReq, error: existingErr } = await supabase
        .from("data_deletion_requests")
        .select("id, status, request_date, created_at, completed_date, user_id")
        .eq("user_id", user.id)
        .in("status", ["pending", "processing"])
        .order("request_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existingReq) {
        setDeletionRequest(existingReq as DataDeletionRequest);
        toast({
          title: "Request already pending",
          description: "Your deletion request is in progress.",
        });

        const duplicateText = [
          "⚠️ User re-submitted deletion request",
          `User: ${user.email || "unknown email"} (${user.id})`,
          `Existing Request: ${existingReq.id}`,
          `Status: ${existingReq.status}`,
          `Requested: ${existingReq.request_date}`,
        ].join("\n");
        await sendTelegram(duplicateText);

        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      // Insert new pending request
      const { data, error } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setDeletionRequest(data as DataDeletionRequest);
      toast({
        title: "Deletion requested",
        description: "An administrator will process your request soon.",
      });

      const notifyText = [
        "🗑️ New data deletion request",
        `User: ${user.email || "unknown email"} (${user.id})`,
        `Request ID: ${data.id}`,
        `Requested: ${data.request_date}`,
        `Created: ${data.created_at}`,
        `Status: ${data.status}`,
      ].join("\n");
      await sendTelegram(notifyText);

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (err: any) {
      toast({
        title: "Request failed",
        description: err?.message || "Could not submit deletion request. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Profile Settings</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-sm font-medium">
                <UserCheck className="h-4 w-4" />
                User ID
              </Label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{user.id}</p>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(user.created_at || "").toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional details</CardTitle>
            <CardDescription>Tell us about your medical background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />

            <Label>Specialization</Label>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />

            <Label>Hospital</Label>
            <Input value={hospital} onChange={(e) => setHospital(e.target.value)} />

            <Label>Medical field</Label>
            <Input value={medicalField} onChange={(e) => setMedicalField(e.target.value)} />

            <Label>Short description</Label>
            <Input value={profileDescription} onChange={(e) => setProfileDescription(e.target.value)} />

            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Consent
            </CardTitle>
            <CardDescription>Manage your privacy preferences and view consent history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {consent ? (
              <>
                {/* Required (read-only) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Terms & Conditions</Label>
                      <p className="text-xs text-muted-foreground">Required for service usage</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Accepted {new Date(consent.created_at).toLocaleDateString()}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/terms" target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Privacy Policy</Label>
                      <p className="text-xs text-muted-foreground">Required for service usage</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Accepted {new Date(consent.created_at).toLocaleDateString()}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/privacy" target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Data Processing</Label>
                      <p className="text-xs text-muted-foreground">Required for service functionality</p>
                    </div>
                    <Badge variant="secondary">
                      Accepted {new Date(consent.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                <Separator />
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No consent records found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export your data or request account deletion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">What data we collect:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><span className="font-medium">Account Data:</span> Email address, user ID, account creation date</li>
                <li><span className="font-medium">Learning Progress:</span> Words you've marked as mastered</li>
                <li><span className="font-medium">Consent Records:</span> Your privacy preferences and consent timestamps</li>
                <li><span className="font-medium">Technical Data:</span> User agent for consent tracking (optional)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                All data is encrypted at rest and in transit, and only the minimum data necessary is collected.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportUserData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Your Data
              </Button>

              <Button
                onClick={handleAccountDeletion}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={
                  notifying ||
                  (!!deletionRequest && (deletionRequest.status === "pending" || deletionRequest.status === "processing"))
                }
                title={
                  notifying
                    ? "Notifying admin..."
                    : deletionRequest && (deletionRequest.status === "pending" || deletionRequest.status === "processing")
                    ? "Deletion request already in progress"
                    : "Request account deletion"
                }
              >
                {notifying ? (
                  <>Notifying...</>
                ) : deletionRequest && (deletionRequest.status === "pending" || deletionRequest.status === "processing") ? (
                  <>
                    <Timer className="h-4 w-4" />
                    Request Pending
                  </>
                ) : (
                  <>Request Deletion</>
                )}
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Account deletion is performed by an administrator after reviewing your request, and is irreversible once completed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;