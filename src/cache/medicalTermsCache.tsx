// medicalTermsCache.tsx
import { supabase } from "@/integrations/supabase/client";
import { getCache, setCache, removeCache } from "./indexedDB"; // Adjust the path

let medicalTermsCache: any[] | null = null;

export async function getMedicalTerms(): Promise<any[]> {
  if (medicalTermsCache) {
    return medicalTermsCache;
  }

  // Check IndexedDB first
  const cached = await getCache("medicalTermsCache");
  if (cached) {
    medicalTermsCache = cached;
    return medicalTermsCache;
  }

  // Fetch from Supabase if not cached
  const { data, error } = await supabase.from("medical_terms").select("*");
  if (error || !data) {
    throw new Error("Failed to fetch medical terms");
  }

  medicalTermsCache = data;
  await setCache("medicalTermsCache", data);
  return data;
}

export async function clearMedicalTermsCache() {
  medicalTermsCache = null;
  await removeCache("medicalTermsCache");
}
