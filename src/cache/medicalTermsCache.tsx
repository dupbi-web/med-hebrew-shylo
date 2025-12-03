import { supabase } from "@/integrations/supabase/client";

// --- Language Preference ---
const LANGUAGE_PREFERENCE_KEY = "language_preference";

export async function setLanguagePreference(lang: string) {
  localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
}

export async function getLanguagePreference(): Promise<string | null> {
  return localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
}

// --- Medical Terms Fetching ---

// Fetch only words from the 'body organs' category for unauthenticated users
export async function getBodyOrgansWords(): Promise<any[]> {
  // Use known category_id for 'body organs' (id=1)
  const bodyOrgansCatId = 1;

  // Fetch words from that category
  const { data: bodyOrgansWords, error: bodyOrgansError } = await supabase
    .from("words")
    .select("id, en, he, rus, category_id")
    .eq("category_id", bodyOrgansCatId);

  if (bodyOrgansError || !bodyOrgansWords) {
    console.error("Error fetching body organs words:", bodyOrgansError);
    return [];
  }

  return bodyOrgansWords;
}

// After login, fetch all words (no local caching)
export async function fetchAllWordsAfterLogin(): Promise<any[]> {
  const { data: words, error } = await supabase
    .from("words")
    .select("id, en, he, rus, category_id");

  if (error || !words) {
    console.error("Error fetching all words after login:", error);
    return [];
  }

  return words;
}

// --- Categories Fetching ---

export async function getCategories(): Promise<any[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_he, name_ru");

  if (error || !data) {
    console.error("Supabase error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }

  return data;
}

export async function clearCategoriesCache() {
  // No-op since we removed cache
}

// --- Medical Terms with Categories ---

export async function getMedicalTermsWithCategories(): Promise<any[]> {
  // Fetch fresh
  const { data, error } = await supabase
    .from("words")
    .select(`
      id,
      en,
      he,
      rus,
      category_id,
      categories!words_category_id_fkey (
        slug,
        name_en,
        name_he,
        name_ru
      )
    `);

  if (error || !data) {
    console.error("Supabase error fetching words:", error);
    throw new Error("Failed to fetch medical terms with categories");
  }

  return data;
}

export async function clearMedicalTermsWithCategoriesCache() {
  // No-op
}

// --- Energy Categories Fetching ---

export async function getEnergyCategories(): Promise<any[]> {
  const { data, error } = await supabase
    .from("energy_category")
    .select("*")
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Supabase error fetching energy_category:", error);
    throw new Error("Failed to fetch energy categories");
  }

  return data;
}
