import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserConsent {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  data_processing_accepted: boolean;
  marketing_accepted: boolean;
  consent_date: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: any;
  profile: any;
  consent: UserConsent | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [consent, setConsent] = useState<UserConsent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (currentUser: any) => {
    if (!currentUser) {
      setProfile(null);
      setConsent(null);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      setProfile(null);
    } else {
      setProfile(profileData || null);
    }

    const { data: consentData, error: consentError } = await supabase
      .from("user_consent")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (consentError) {
      if (consentError.code !== "PGRST116") {
        console.error("Error fetching consent:", consentError);
      }
      setConsent(null);
    } else {
      setConsent(consentData || null);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
        setLoading(false);
      } else {
        setProfile(null);
        setConsent(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
        setLoading(false);
      } else {
        setProfile(null);
        setConsent(null);
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });

      // Safely wait until Supabase state is fully cleared
      await new Promise(res => setTimeout(res, 200));

      // Reset your app state
      setUser(null);
      setProfile(null);
      setConsent(null);

      // Redirect using navigate instead of hard reload
      window.location.assign("/auth");
    } catch (err) {
      console.error("Error during supabase signOut:", err);
    }
  };

  
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });

      if (error) {
        console.error("Google sign-in error:", error.message);
        return;
      }

      if (!data?.user) {
        console.error("No user data returned after Google sign-in.");
        return;
      }

      // Invoke the send-welcome-email function only for new users
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          "send-welcome-email",
          {
            body: JSON.stringify({ email: data.user.email, userId: data.user.id }),
          }
        );

        if (emailError) {
          console.error("Error sending welcome email:", emailError.message);
        } else {
          console.log("Welcome email sent successfully:", emailData);
        }
      } catch (err) {
        console.error("Unexpected error sending welcome email:", err);
      }
    } catch (err) {
      console.error("Unexpected error during Google sign-in:", err);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    await loadUserData(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        consent,
        loading,
        signOut,
        signInWithGoogle,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

