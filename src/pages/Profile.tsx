import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Shield, User as UserIcon, Mail } from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState({
    terms_accepted: false,
    privacy_accepted: false,
    data_processing_accepted: false,
    marketing_accepted: false,
  });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch consent
      const { data: consentData, error: consentError } = await supabase
        .from("user_consent")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (consentError && consentError.code !== "PGRST116") {
        console.error("Error fetching consent:", consentError);
      } else if (consentData) {
        setConsent(consentData);
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleConsentUpdate = async (field: string, value: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_consent")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (error) throw error;

      setConsent({ ...consent, [field]: value });
      
      toast({
        title: "Consent Updated",
        description: "Your consent preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDataExport = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all user data
      const [profileData, consentData, masteredWords] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("user_consent").select("*").eq("user_id", user.id),
        supabase.from("user_mastered_words").select("*").eq("user_id", user.id),
      ]);

      const userData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profileData.data,
        consent: consentData.data,
        mastered_words: masteredWords.data,
        export_date: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Create deletion request
      const { error: requestError } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: user.id,
          status: "pending",
        });

      if (requestError) throw requestError;

      toast({
        title: "Deletion Request Submitted",
        description: "Your account deletion request has been submitted. You will be signed out shortly.",
      });

      // Sign out after 2 seconds
      setTimeout(() => {
        signOut();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit deletion request: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Profile & Privacy Settings - Medical Terms Game</title>
        <meta name="description" content="Manage your account, privacy settings, and GDPR data rights." />
      </Helmet>

      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Profile & Privacy Settings</h1>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Account Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at || "").toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GDPR Consent Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Consent
            </CardTitle>
            <CardDescription>Manage your data processing consent (GDPR)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={consent.terms_accepted}
                onCheckedChange={(checked) => handleConsentUpdate("terms_accepted", checked as boolean)}
              />
              <Label htmlFor="terms" className="cursor-pointer">
                <p className="font-medium">Terms & Conditions</p>
                <p className="text-sm text-muted-foreground">Accept our terms of service</p>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={consent.privacy_accepted}
                onCheckedChange={(checked) => handleConsentUpdate("privacy_accepted", checked as boolean)}
              />
              <Label htmlFor="privacy" className="cursor-pointer">
                <p className="font-medium">Privacy Policy</p>
                <p className="text-sm text-muted-foreground">Accept our privacy practices</p>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="data-processing"
                checked={consent.data_processing_accepted}
                onCheckedChange={(checked) =>
                  handleConsentUpdate("data_processing_accepted", checked as boolean)
                }
              />
              <Label htmlFor="data-processing" className="cursor-pointer">
                <p className="font-medium">Data Processing</p>
                <p className="text-sm text-muted-foreground">
                  Consent to processing your data for service functionality
                </p>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="marketing"
                checked={consent.marketing_accepted}
                onCheckedChange={(checked) => handleConsentUpdate("marketing_accepted", checked as boolean)}
              />
              <Label htmlFor="marketing" className="cursor-pointer">
                <p className="font-medium">Marketing Communications</p>
                <p className="text-sm text-muted-foreground">Receive updates and newsletters (optional)</p>
              </Label>
            </div>

            <Alert>
              <AlertDescription>
                You can withdraw consent at any time. Note that withdrawing essential consents may limit
                your ability to use certain features.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Exercise your GDPR rights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your personal data in JSON format
                </p>
              </div>
              <Button onClick={handleDataExport} disabled={loading} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove
                      all your data from our servers. A deletion request will be submitted and processed
                      according to GDPR requirements (typically within 30 days).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAccountDeletion}>
                      Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection Notice */}
        <Card>
          <CardHeader>
            <CardTitle>What Data We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Account Data:</strong> Email address, user ID, account creation date</p>
              <p><strong>Learning Progress:</strong> Words you've marked as mastered</p>
              <p><strong>Consent Records:</strong> Your privacy preferences and consent timestamps</p>
              <p><strong>Technical Data:</strong> User agent for consent tracking (optional)</p>
              <p className="pt-2 text-muted-foreground">
                All data is encrypted at rest and in transit. We only collect the minimum data necessary
                to provide our service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
