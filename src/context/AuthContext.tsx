import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any;
  profile: any;
  hasConsent: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to validate consent
const validateConsent = (consentData: any): boolean => {
  if (!consentData) return false;
  return consentData.terms_accepted === true && 
         consentData.privacy_accepted === true && 
         consentData.data_processing_accepted === true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user data
  const fetchUserData = useCallback(async (currentUser: any) => {
    try {
      const [profileResult, consentResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
        supabase.from('user_consent').select('terms_accepted, privacy_accepted, data_processing_accepted')
          .eq('user_id', currentUser.id).single()
      ]);

      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
        setProfile(null);
      } else {
        setProfile(profileResult.data);
      }

      const isConsentValid = validateConsent(consentResult.data);
      setHasConsent(isConsentValid);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfile(null);
      setHasConsent(false);
    }
  }, []);

  // Refresh function that components can call
  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (event === "SIGNED_IN" && currentUser) {
        const justSignedUp = sessionStorage.getItem("just_signed_up") === "true";
        
        if (justSignedUp) {
          try {
            const consentData = JSON.parse(sessionStorage.getItem("pending_consent") || "{}");
            const { error: consentError } = await supabase.from("user_consent").upsert({
              user_id: currentUser.id,
              terms_accepted: consentData.termsAccepted ?? false,
              privacy_accepted: consentData.privacyAccepted ?? false,
              data_processing_accepted: consentData.dataProcessingAccepted ?? false,
              marketing_accepted: consentData.marketingAccepted ?? false,
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
              consent_date: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            if (consentError) throw consentError;

            const profileData = JSON.parse(sessionStorage.getItem("pending_profile") || "{}");
            if (profileData.fullName) {
              const { error: profileError } = await supabase.from("profiles").upsert({
                id: currentUser.id,
                full_name: profileData.fullName?.trim(),
                specialization: profileData.specialization?.trim() || null,
                hospital: profileData.hospital?.trim() || null,
                medical_field: profileData.medicalField?.trim() || null,
                how_found_us: profileData.howFoundUs || "other",
                description: profileData.profileDescription?.trim() || null,
              });
              
              if (profileError) throw profileError;
            }

            sessionStorage.removeItem("just_signed_up");
            sessionStorage.removeItem("pending_consent");
            sessionStorage.removeItem("pending_profile");
            await fetchUserData(currentUser);
          } catch (error) {
            console.error('Failed to complete signup:', error);
          }
        } else {
          await fetchUserData(currentUser);
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        setHasConsent(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        fetchUserData(currentUser);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setHasConsent(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, hasConsent, loading, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
