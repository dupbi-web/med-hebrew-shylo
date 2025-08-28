import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EnergyCategory {
  id: number;
  name_en: string;
  name_he: string;
  name_ru: string;
  slug: string;
}

export interface MedicalSentence {
  id: number;
  energy_category_id: number;
  en: string;
  he: string;
  rus: string;
}

export const useMedicalSentences = () => {
  const [categories, setCategories] = useState<EnergyCategory[]>([]);
  const [sentences, setSentences] = useState<MedicalSentence[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('energy_category')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
      
      // Auto-select first category
      if (data && data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentencesByCategory = async (categoryId: number) => {
    try {
      setLoadingSentences(true);
      
      const { data, error } = await (supabase as any)
        .from('sentences_for_doctors')
        .select('*')
        .eq('energy_category_id', categoryId)
        .order('id', { ascending: true });

      if (error) throw error;

      setSentences(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sentences';
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingSentences(false);
    }
  };

  const selectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    fetchSentencesByCategory(categoryId);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSentencesByCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  return {
    categories,
    sentences,
    selectedCategoryId,
    loading,
    loadingSentences,
    error,
    selectCategory,
    refetch: fetchCategories,
  };
};