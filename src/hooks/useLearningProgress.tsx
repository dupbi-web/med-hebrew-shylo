import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface LearningProgressData {
  category: string;
  word_en: string;
  correct_count: number;
  mastered: boolean;
}

export const useLearningProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadProgress = async (): Promise<Record<string, LearningProgressData[]>> => {
    if (!user) return {};
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Group by category
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, LearningProgressData[]>);

      return grouped;
    } catch (error: any) {
      console.error('Error loading progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your learning progress.",
      });
      return {};
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (category: string, word_en: string, correct_count: number, mastered: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          category,
          word_en,
          correct_count,
          mastered,
        }, {
          onConflict: 'user_id,category,word_en'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress.",
      });
    }
  };

  const resetProgress = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
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
  };

  return {
    loadProgress,
    saveProgress,
    resetProgress,
    loading
  };
};