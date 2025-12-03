import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MedicalSentence {
  id: number;
  en: string;
  he: string;
  rus: string;
  energy_category_id: number | null;
}

async function fetchMedicalSentencesByCategory(categoryId: number): Promise<MedicalSentence[]> {
  const { data, error } = await supabase
    .from('sentences_for_doctors')
    .select('*')
    .eq('energy_category_id', categoryId)
    .order('id');

  if (error) {
    throw new Error(`Failed to fetch medical sentences: ${error.message}`);
  }

  return data || [];
}

export function useMedicalSentences(categoryId: number) {
  return useQuery({
    queryKey: ['medicalSentences', categoryId],
    queryFn: () => fetchMedicalSentencesByCategory(categoryId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!categoryId, // Only fetch when categoryId is provided
  });
}
