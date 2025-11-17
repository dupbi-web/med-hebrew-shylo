import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProgressQuery } from "@/hooks/queries/useUserProgressQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

export type WordProgress = {
  word_id: number;
  correct: number;
  attempts: number;
  last_seen: string;
};

export const useUserProgress = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { 
    progress, 
    isLoading, 
    updateWordProgress: updateProgress, 
    resetProgress: resetProgressMutation 
  } = useUserProgressQuery();

  const loadUserProgress = useCallback(async (): Promise<WordProgress[]> => {
    return progress;
  }, [progress]);

  const updateWordProgress = useCallback(async (
    wordId: number, 
    isCorrect: boolean
  ) => {
    if (!user) return;

    try {
      updateProgress({ wordId, isCorrect });
    } catch (error: any) {
      console.error('Error updating word progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress.",
      });
    }
  }, [user, toast, updateProgress]);

  const getAllCategoryProgress = useCallback(async (
    categories: { id: number; totalWords: number }[]
  ): Promise<Record<number, number>> => {
    if (!user) return {};

    try {
      const { data: allWords, error } = await supabase
        .from('words')
        .select('id, category_id');

      if (error) throw error;

      const categoryWordMap = allWords.reduce((acc, word) => {
        if (!acc[word.category_id]) acc[word.category_id] = [];
        acc[word.category_id].push(word.id);
        return acc;
      }, {} as Record<number, number[]>);

      const progressMap: Record<number, number> = {};

      categories.forEach(({ id, totalWords }) => {
        const categoryWordIds = new Set(categoryWordMap[id] || []);
        const masteredWords = progress.filter(
          (p) => categoryWordIds.has(p.word_id) && p.correct > 0
        ).length;

        progressMap[id] = Math.round((masteredWords / totalWords) * 100);
      });

      return progressMap;
    } catch (error: any) {
      console.error('Error calculating category progress:', error);
      return {};
    }
  }, [user, progress]);

  const resetProgress = useCallback(async () => {
    if (!user) return;

    try {
      resetProgressMutation();
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
  }, [user, toast, resetProgressMutation]);

  return {
    loadUserProgress,
    updateWordProgress,
    getAllCategoryProgress,
    resetProgress,
    loading: isLoading,
  };
};
