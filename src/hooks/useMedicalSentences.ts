import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getEnergyCategories, getMedicalSentencesByCategory } from '@/cache/medicalTermsCache';

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
      
      const data = await getEnergyCategories();
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
      
      const data = await getMedicalSentencesByCategory(categoryId);
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