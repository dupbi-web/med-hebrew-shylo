import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedicalTermsWithCategories, getBodyOrgansWords } from "@/cache/medicalTermsCache";
import { useAuthContext } from "./AuthContext";

type Word = {
  id: number;
  en: string;
  he: string;
  rus: string;
  // normalized fields for filtering
  category_id: number | null;
  category_slug?: string | null;
};

interface WordsContextType {
  words: Word[];
  loading: boolean;
  refreshWords: () => Promise<void>;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export const WordsProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: words = [], isLoading: wordsLoading, refetch } = useQuery({
    queryKey: ['words', user?.id],
    queryFn: async () => {
      // Wait for auth to settle if it's loading? 
      // Actually, user?.id will be undefined if loading or guest.
      // We should probably wait for authLoading to be false before deciding which fetch to use?
      // But useAuthContext 'loading' might be true initially. 
      // Let's assume if user is null, we fetch guest words.

      let rawData: any[] = [];
      if (!user) {
        rawData = await getBodyOrgansWords();
      } else {
        rawData = await getMedicalTermsWithCategories();
      }

      // Normalize data
      return rawData.map((w: any) => ({
        id: w.id,
        en: w.en,
        he: w.he,
        rus: w.rus,
        category_id: typeof w.category_id === "number" ? w.category_id : (w.category?.id ?? null),
        category_slug: typeof w.category_slug === "string" ? w.category_slug : (w.category?.slug ?? null),
      }));
    },
    // Only run when we know the auth state (unless we want to eagerly fetch guest words?)
    // Better to wait for auth to be determined to avoid double fetching (guest -> user)
    enabled: !authLoading,
    staleTime: Infinity, // Data is static (monthly updates), cache indefinitely in memory
    gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection for 24 hours
  });

  const refreshWords = async () => {
    await refetch();
  };

  return (
    <WordsContext.Provider value={{ words, loading: wordsLoading || authLoading, refreshWords }}>
      {children}
    </WordsContext.Provider>
  );
};

export const useWordsContext = () => {
  const ctx = useContext(WordsContext);
  if (!ctx) throw new Error("useWordsContext must be used within WordsProvider");
  return ctx;
};
