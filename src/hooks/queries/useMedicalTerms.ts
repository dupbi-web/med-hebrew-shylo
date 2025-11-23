import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MedicalTerm {
  id: number;
  en: string;
  he: string;
  rus: string;
  category_id: number | null;
  category?: {
    id: number;
    slug: string;
    name_he: string;
    name_en: string;
    name_ru: string;
  };
}

async function _fetchMedicalTerms(): Promise<MedicalTerm[]> {
  const { data, error } = await supabase
    .from('words')
    .select(`
      id,
      en,
      he,
      rus,
      category_id,
      categories (
        id,
        slug,
        name_he,
        name_en,
        name_ru
      )
    `)
    .order('id');

  if (error) {
    throw new Error(`Failed to fetch medical terms: ${error.message}`);
  }

  // Normalize the category relationship
  return (data || []).map(word => {
    const category = Array.isArray(word.categories)
      ? word.categories[0]
      : word.categories;

    return {
      ...word,
      category: category
        ? {
            id: category.id,
            slug: category.slug,
            name_he: category.name_he,
            name_en: category.name_en,
            name_ru: category.name_ru,
          }
        : undefined,
    };
  }) as MedicalTerm[];
}

// New function to fetch free words from the "free_words" table
async function _fetchFreeWords(): Promise<MedicalTerm[]> {
  const { data, error } = await supabase
    .from('free_words')
    .select(`
      id,
      en,
      he,
      rus,
      category_id
    `)
    .order('id');

  if (error) {
    throw new Error(`Failed to fetch free words: ${error.message}`);
  }

  return data || [];
}

// ░░░░░░░░ FOR LOGGED IN USERS (unchanged) ░░░░░░░░
export function useMedicalTerms(user: any, loading: boolean) {
  return useQuery({
    queryKey: ['medicalTerms'],
    queryFn: _fetchMedicalTerms,
    enabled: !loading && !!user, // Only fetch when user is authenticated and not loading
    staleTime: 10 * 60 * 1000,
  });
}

// ░░░░░░░░ FOR FREE USERS ONLY ░░░░░░░░
export function useFreeMedicalTerms() {
  return useQuery({
    queryKey: ['freeMedicalTerms'],
    queryFn: _fetchFreeWords,
    staleTime: 10 * 60 * 1000,
  });
}
