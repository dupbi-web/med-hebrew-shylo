import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnergyCategory {
  id: number;
  slug: string;
  name_he: string;
  name_en: string;
  name_ru: string;
}

async function fetchEnergyCategories(): Promise<EnergyCategory[]> {
  const { data, error } = await supabase
    .from('energy_category')
    .select('*')
    .order('id');

  if (error) {
    throw new Error(`Failed to fetch energy categories: ${error.message}`);
  }

  return data || [];
}

export function useEnergyCategories() {
  return useQuery({
    queryKey: ['energyCategories'],
    queryFn: fetchEnergyCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
