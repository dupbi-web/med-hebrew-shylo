import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMasteredWords } from "@/hooks/queries/useMasteredWords";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

export const useLearningProgress = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { 
    masteredWords, 
    isLoading, 
    addMasteredWord: addWord, 
    removeMasteredWord: removeWord 
  } = useMasteredWords();

  const createWordKey = (category: string, word_en: string) => {
    return `${category}_${word_en}`;
  };

  const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
    // With TanStack Query, data is automatically loaded
    // This function now just returns the current state
    return masteredWords;
  }, [masteredWords]);

  const addMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);
    
    try {
      addWord(wordKey);
    } catch (error: any) {
      console.error('Error adding mastered word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress.",
      });
    }
  }, [user, toast, addWord]);

  const removeMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);
    
    try {
      removeWord(wordKey);
    } catch (error: any) {
      console.error('Error removing mastered word:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your progress.",
      });
    }
  }, [user, toast, removeWord]);

  const isWordMastered = useCallback((category: string, word_en: string): boolean => {
    const wordKey = createWordKey(category, word_en);
    return masteredWords.has(wordKey);
  }, [masteredWords]);

  const resetProgress = useCallback(async () => {
    if (!user) return;

    try {
      // Delete all mastered words from Supabase
      const { error } = await supabase
        .from('user_mastered_words')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
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
    loading: isLoading
  };
};

