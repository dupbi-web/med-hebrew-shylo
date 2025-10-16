import { useState, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserMasteredWords, 
  addUserMasteredWord, 
  removeUserMasteredWord, 
  clearUserMasteredWordsCache 
} from "@/cache/medicalTermsCache";

export const useLearningProgress = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const LANGUAGE_PREFERENCE_KEY = "ru";

  const createWordKey = (category: string, word_en: string) => {
    return `${category}_${word_en}`;
  };

  const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
    if (!user) return new Set();
    
    setLoading(true);
    try {
      const masteredWordsSet = await getUserMasteredWords(user.id);
      setMasteredWords(masteredWordsSet);
      return masteredWordsSet;
    } catch (error: any) {
      console.error('Error loading mastered words:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your progress.",
      });
      return new Set();
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);
    
    try {
      await addUserMasteredWord(user.id, wordKey);
      setMasteredWords(prev => new Set([...prev, wordKey]));
    } catch (error: any) {
      console.error('Error adding mastered word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress.",
      });
    }
  }, [user, toast]);

  const removeMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);
    
    try {
      await removeUserMasteredWord(user.id, wordKey);
      setMasteredWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordKey);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error removing mastered word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your progress.",
      });
    }
  }, [user, toast]);

  const isWordMastered = useCallback((category: string, word_en: string): boolean => {
    const wordKey = createWordKey(category, word_en);
    return masteredWords.has(wordKey);
  }, [masteredWords]);

  const resetProgress = useCallback(async () => {
    if (!user) return;

    try {
      await clearUserMasteredWordsCache(user.id);
      setMasteredWords(new Set());
      
      toast({
        title: "Progress Reset",
        description: "Your learning progress has been reset.",
      });
    } catch (error: any) {
      console.error('Error resetting progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset progress.",
      });
    }
  }, [user, toast]);

  const getMasteredWordsCount = useCallback((category?: string): number => {
    if (!category) return masteredWords.size;
    
    const categoryMastered = Array.from(masteredWords).filter(wordKey => 
      wordKey.startsWith(`${category}_`)
    );
    return categoryMastered.length;
  }, [masteredWords]);

  return {
    loadMasteredWords,
    addMasteredWord,
    removeMasteredWord,
    isWordMastered,
    resetProgress,
    getMasteredWordsCount,
    masteredWords,
    loading
  };
};

