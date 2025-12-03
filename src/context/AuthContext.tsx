import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // 1. Query for the current session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const user = session?.user ?? null;

  // 2. Query for user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching profile:', error);
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Profile data rarely changes
  });

  // 3. Query for user consent
  const { data: consentData, isLoading: consentLoading } = useQuery({
    queryKey: ['consent', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_consent')
        .select('terms_accepted, privacy_accepted, data_processing_accepted')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching consent:', error);
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Consent data rarely changes
  });

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['session'], null);
        queryClient.setQueryData(['profile', user?.id], null);
        queryClient.setQueryData(['consent', user?.id], null);
        queryClient.clear(); // Clear all cache on sign out
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        queryClient.setQueryData(['session'], session);
        queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.id] });
        queryClient.invalidateQueries({ queryKey: ['consent', session?.user?.id] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, user?.id]);

  const hasConsent = validateConsent(consentData);
  const loading = sessionLoading || (!!user && (profileLoading || consentLoading));

  const signOut = async () => {
    await supabase.auth.signOut();
    // State update handled by onAuthStateChange
  };

  const refreshUserData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
      queryClient.invalidateQueries({ queryKey: ['consent', user?.id] })
    ]);
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
