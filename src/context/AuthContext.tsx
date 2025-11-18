// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { supabase } from "@/integrations/supabase/client";

// interface AuthContextType {
//   user: any;
//   profile: any;
//   loading: boolean;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Set up auth state listener FIRST
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       const currentUser = session?.user || null;
//       setUser(currentUser);
//       setLoading(false);
      
//       // Defer profile fetching to avoid deadlock
//       if (currentUser) {
//         setTimeout(() => {
//           supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', currentUser.id)
//             .single()
//             .then(({ data: profileData, error }) => {
//               if (error) {
//                 console.error('Error fetching profile:', error);
//                 setProfile(null);
//               } else {
//                 setProfile(profileData || null);
//               }
//             });
//         }, 0);
//       } else {
//         setProfile(null);
//       }
//     });
    
//     // THEN check for existing session
//     supabase.auth.getSession().then(({ data }) => {
//       const currentUser = data?.session?.user || null;
//       setUser(currentUser);
//       setLoading(false);
      
//       if (currentUser) {
//         setTimeout(() => {
//           supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', currentUser.id)
//             .single()
//             .then(({ data: profileData, error }) => {
//               if (error) {
//                 console.error('Error fetching profile:', error);
//                 setProfile(null);
//               } else {
//                 setProfile(profileData || null);
//               }
//             });
//         }, 0);
//       }
//     });
    
//     return () => {
//       listener?.subscription.unsubscribe();
//     };
//   }, []);

//   const signOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setProfile(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, profile, loading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuthContext = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
//   return ctx;
// }
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
      await supabase.auth.signOut();

      // Ensure any persisted session tokens are removed from localStorage as a fallback
      try {
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("supabase.auth");
      } catch (e) {
        console.error("Error clearing local storage during sign out:", e);
      }

      // Clear user-related state only after successful sign-out
      setUser(null);
      setProfile(null);
      setConsent(null);

      // Redirect to Home page after sign-out
      window.location.href = "/";
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

      console.log("Google sign-in successful. User data:", data.user);

      // Create default user_consent entry for new users
      const { error: consentError } = await supabase.from("user_consent").insert({
        user_id: data.user.id,
        terms_accepted: false,
        privacy_accepted: false,
        data_processing_accepted: false,
      });

      if (consentError) {
        console.error("Error creating user_consent entry:", consentError.message);
      } else {
        console.log("user_consent entry created successfully for user:", data.user.id);
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

