import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from "@/context/AuthContext";

interface MasteredWord {
  user_id: string;
  word_key: string;
  mastered_at: string;
}

async function fetchMasteredWords(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_mastered_words')
    .select('word_key')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch mastered words: ${error.message}`);
  }

  return new Set((data || []).map(row => row.word_key));
}

async function addMasteredWord(userId: string, wordKey: string): Promise<void> {
  const { error } = await supabase
    .from('user_mastered_words')
    .insert({ user_id: userId, word_key: wordKey });

  if (error) {
    throw new Error(`Failed to add mastered word: ${error.message}`);
  }
}

async function removeMasteredWord(userId: string, wordKey: string): Promise<void> {
  const { error } = await supabase
    .from('user_mastered_words')
    .delete()
    .eq('user_id', userId)
    .eq('word_key', wordKey);

  if (error) {
    throw new Error(`Failed to remove mastered word: ${error.message}`);
  }
}

export function useMasteredWords() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['masteredWords', userId],
    queryFn: () => fetchMasteredWords(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - user data should be relatively fresh
  });

  const addMutation = useMutation({
    mutationFn: (wordKey: string) => addMasteredWord(userId!, wordKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masteredWords', userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (wordKey: string) => removeMasteredWord(userId!, wordKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masteredWords', userId] });
    },
  });

  return {
    masteredWords: query.data || new Set<string>(),
    isLoading: query.isLoading,
    error: query.error,
    addMasteredWord: addMutation.mutate,
    removeMasteredWord: removeMutation.mutate,
    isAddingWord: addMutation.isPending,
    isRemovingWord: removeMutation.isPending,
  };
}
