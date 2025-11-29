// /src/hooks/queries/useUserProgressQueryV2.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';

export interface WordProgress {
  word_id: number;
  correct: number;
  attempts: number;
  last_seen: string;
}

async function fetchUserProgressV2(userId: string): Promise<WordProgress[]> {
  const { data, error } = await supabase.rpc('get_user_progress_v2', { p_user_id: userId });
  if (error) throw new Error(`Failed to fetch user progress (v2): ${error.message}`);
  const blob = (data ?? {}) as Record<string, WordProgress>;
  return Object.values(blob);
}

async function rpcUpdateWordProgressV2(
  userId: string,
  wordId: number,
  isCorrect: boolean
): Promise<Record<string, WordProgress>> {
  const { data, error } = await supabase.rpc('update_word_progress_v2', {
    p_user_id: userId,
    p_word_id: wordId,
    p_is_correct: isCorrect,
  });
  if (error) throw new Error(`Failed to update word progress (v2): ${error.message}`);
  return (data ?? {}) as Record<string, WordProgress>;
}

async function rpcResetUserProgressV2(userId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_user_progress_v2', { p_user_id: userId });
  if (error) throw new Error(`Failed to reset user progress (v2): ${error.message}`);
}

export function useUserProgressQueryV2() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ['userProgressV2', userId],
    enabled: typeof userId === 'string',
    queryFn: () => fetchUserProgressV2(userId!),
    staleTime: 60 * 60 * 1000, // 1 hour - we rely on optimistic updates for immediate feedback
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ wordId, isCorrect }: { wordId: number; isCorrect: boolean }) =>
      rpcUpdateWordProgressV2(userId!, wordId, isCorrect),
    onMutate: async ({ wordId, isCorrect }) => {
      await queryClient.cancelQueries({ queryKey: ['userProgressV2', userId] });

      const prevArray = queryClient.getQueryData<WordProgress[]>(['userProgressV2', userId]);

      if (prevArray) {
        const nowIso = new Date().toISOString();
        const idx = prevArray.findIndex((p) => p.word_id === wordId);
        let nextArray: WordProgress[];
        if (idx >= 0) {
          const item = prevArray[idx];
          nextArray = [...prevArray];
          nextArray[idx] = {
            ...item,
            attempts: item.attempts + 1,
            correct: item.correct + (isCorrect ? 1 : 0),
            last_seen: nowIso,
          };
        } else {
          nextArray = [
            ...prevArray,
            { word_id: wordId, attempts: 1, correct: isCorrect ? 1 : 0, last_seen: nowIso },
          ];
        }
        queryClient.setQueryData(['userProgressV2', userId], nextArray);
      }

      return { prevArray };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevArray) {
        queryClient.setQueryData(['userProgressV2', userId], ctx.prevArray);
      }
    },
    onSuccess: (serverBlob) => {
      const nextArray = Object.values(serverBlob ?? {}) as WordProgress[];
      queryClient.setQueryData(['userProgressV2', userId], nextArray);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => rpcResetUserProgressV2(userId!),
    onSuccess: () => {
      queryClient.setQueryData(['userProgressV2', userId], []);
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
