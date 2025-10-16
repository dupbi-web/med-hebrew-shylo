import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMedicalTermsWithCategories, getBodyOrgansWords } from "@/cache/medicalTermsCache";
import { useAuthContext } from "./AuthContext";

interface WordsContextType {
  words: any[];
  loading: boolean;
  refreshWords: () => Promise<void>;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export const WordsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthContext();
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = async () => {
    setLoading(true);
    let data: any[] = [];
    if (!user) {
      data = await getBodyOrgansWords();
    } else {
      data = await getMedicalTermsWithCategories();
    }
    setWords(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
}
