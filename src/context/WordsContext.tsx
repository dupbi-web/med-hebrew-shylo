import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  const { user } = useAuthContext();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    setLoading(true);

    try {
      if (!user) {
        // Guest: only body organs, already returns category_id
        const data = await getBodyOrgansWords();
        // Ensure normalized shape
        const normalized: Word[] = (data ?? []).map((w: any) => ({
          id: w.id,
          en: w.en,
          he: w.he,
          rus: w.rus,
          category_id: w.category_id ?? null,
          // no slug for guest set (optional)
          category_slug: w.category_slug ?? null,
        }));
        setWords(normalized);
      } else {
        // Auth: full set with categories; flatten to normalized shape
        // Expect getMedicalTermsWithCategories to return e.g.:
        // { id, en, he, rus, category_id, category: { id, slug, name_* } } or similar
        const data = await getMedicalTermsWithCategories();
        const normalized: Word[] = (data ?? []).map((w: any) => ({
          id: w.id,
          en: w.en,
          he: w.he,
          rus: w.rus,
          // Prefer explicit category_id if present; else fallback to nested
          category_id:
            typeof w.category_id === "number"
              ? w.category_id
              : (w.category?.id ?? null),
          category_slug:
            typeof w.category_slug === "string"
              ? w.category_slug
              : (w.category?.slug ?? null),
        }));
        setWords(normalized);
      }
    } catch (e) {
      console.error("Error fetching words", e);
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return (
    <WordsContext.Provider value={{ words, loading, refreshWords: fetchWords }}>
      {children}
    </WordsContext.Provider>
  );
};

export const useWordsContext = () => {
  const ctx = useContext(WordsContext);
  if (!ctx) throw new Error("useWordsContext must be used within WordsProvider");
  return ctx;
};
