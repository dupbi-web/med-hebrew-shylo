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

async function fetchMedicalTerms(): Promise<MedicalTerm[]> {
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

  // Transform the data to flatten the category object
  return (data || []).map(word => {
    const category = Array.isArray(word.categories) ? word.categories[0] : word.categories;
    return {
      ...word,
      category: category ? {
        id: category.id,
        slug: category.slug,
        name_he: category.name_he,
        name_en: category.name_en,
        name_ru: category.name_ru,
      } : undefined,
    };
  }) as MedicalTerm[];
}

export function useMedicalTerms() {
  return useQuery({
    queryKey: ['medicalTerms'],
    queryFn: fetchMedicalTerms,
    staleTime: 10 * 60 * 1000, // 10 minutes - medical terms rarely change
  });
}
