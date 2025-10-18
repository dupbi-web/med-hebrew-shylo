import { useState, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type WordStat = {
  correct: number;
  attempts: number;
  last_seen: string;
};

type ProgressMap = Record<number, WordStat>;

export const useUserProgress = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  /** Load all progress for a given category */
  const loadCategoryProgress = useCallback(async (categoryId: number): Promise<ProgressMap> => {
    if (!user) return {};

    try {
      const { data, error } = await supabase
        .from("user_category_progress")
        .select("progress")
        .eq("user_id", user.id)
        .eq("category_id", categoryId)
        .maybeSingle();

      if (error) throw error;
      return data?.progress || {};
    } catch (error: any) {
      console.error("Error loading category progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your progress.",
      });
      return {};
    }
  }, [user, toast]);

  /** Save updated progress JSON for one category */
  const saveCategoryProgress = useCallback(async (categoryId: number, progress: ProgressMap) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_category_progress")
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          progress,
          last_updated: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving category progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save progress.",
      });
    }
  }, [user, toast]);

  /** Update a single word inside the category JSON */
  const updateWordProgress = useCallback(async (
    categoryId: number,
    wordId: number,
    isCorrect: boolean
  ) => {
    if (!user) return;

    try {
      // Fetch existing category progress
      const existing = await loadCategoryProgress(categoryId);
      const current = existing[wordId] || { correct: 0, attempts: 0, last_seen: "" };

      const updated: ProgressMap = {
        ...existing,
        [wordId]: {
          correct: isCorrect ? current.correct + 1 : current.correct,
          attempts: current.attempts + 1,
          last_seen: new Date().toISOString(),
        },
      };

      await saveCategoryProgress(categoryId, updated);
    } catch (error: any) {
      console.error("Error updating word progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update word progress.",
      });
    }
  }, [user, loadCategoryProgress, saveCategoryProgress, toast]);

  /** Compute overall percentage for a category */
  const getCategoryProgress = useCallback(async (categoryId: number, totalWords: number): Promise<number> => {
    if (!user || totalWords === 0) return 0;

    const progress = await loadCategoryProgress(categoryId);
    const mastered = Object.values(progress).filter(p => p.correct > 0).length;
    return Math.round((mastered / totalWords) * 100);
  }, [user, loadCategoryProgress]);

  /** Reset all user progress */
  const resetProgress = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("user_category_progress")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      toast({
        title: "Progress Reset",
        description: "Your learning progress has been reset.",
      });
    } catch (error: any) {
      console.error("Error resetting progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset progress.",
      });
    }
  }, [user, toast]);

  return {
    loadCategoryProgress,
    updateWordProgress,
    getCategoryProgress,
    saveCategoryProgress,
    resetProgress,
    loading,
  };
};
