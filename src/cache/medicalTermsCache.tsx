import { supabase } from "@/integrations/supabase/client";

let medicalTermsCache: any[] | null = null;

export async function getMedicalTerms(): Promise<any[]> {
  if (medicalTermsCache) {
    return medicalTermsCache;
  }

  // Optionally: check localStorage first
  const cached = localStorage.getItem("medicalTermsCache");
  if (cached) {
    medicalTermsCache = JSON.parse(cached);
    return medicalTermsCache;
  }

  const { data, error } = await supabase.from("medical_terms").select("*");
  if (error || !data) {
    throw new Error("Failed to fetch medical terms");
  }

  medicalTermsCache = data;
  localStorage.setItem("medicalTermsCache", JSON.stringify(data));
  return data;
}

export function clearMedicalTermsCache() {
  medicalTermsCache = null;
  localStorage.removeItem("medicalTermsCache");
}