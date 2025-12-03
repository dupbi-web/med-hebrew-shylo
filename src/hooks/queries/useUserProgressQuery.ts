import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from "@/context/AuthContext";

export interface WordProgress {
  word_id: number;
  correct: number;
  attempts: number;
  last_seen: string;
}

async function fetchUserProgress(userId: string): Promise<WordProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('word_id, correct, attempts, last_seen')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch user progress: ${error.message}`);
  }

  return data || [];
}

async function updateWordProgress(
  userId: string,
  wordId: number,
  isCorrect: boolean
): Promise<void> {
  // First, try to get existing progress
  const { data: existing } = await supabase
    .from('user_progress')
    .select('correct, attempts')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('user_progress')
      .update({
        correct: existing.correct + (isCorrect ? 1 : 0),
        attempts: existing.attempts + 1,
        last_seen: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) {
      throw new Error(`Failed to update word progress: ${error.message}`);
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        word_id: wordId,
        correct: isCorrect ? 1 : 0,
        attempts: 1,
        last_seen: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to insert word progress: ${error.message}`);
    }
  }
}

async function resetUserProgress(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to reset user progress: ${error.message}`);
  }
}

export function useUserProgressQuery() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - keep user progress fresh
  });

  const updateMutation = useMutation({
    mutationFn: ({ wordId, isCorrect }: { wordId: number; isCorrect: boolean }) =>
      updateWordProgress(userId!, wordId, isCorrect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetUserProgress(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
    },
  });

  return {
    progress: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateWordProgress: updateMutation.mutate,
    resetProgress: resetMutation.mutate,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
