
import { supabase } from "@/integrations/supabase/client";
import { openDB } from "idb";
// Fetch only words from the 'body organs' category for unauthenticated users
export async function getBodyOrgansWords(): Promise<any[]> {
  // Try cache first
  // const cached = await getCache("bodyOrgansWordsCache");
  // if (cached) return cached;

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
    // await setCache("bodyOrgansWordsCache", bodyOrgansWords);
    return bodyOrgansWords;
}

// After login, fetch all words and update local cache
export async function fetchAndCacheAllWordsAfterLogin(): Promise<any[]> {
  const { data: words, error } = await supabase
    .from("words")
    .select("id, en, he, rus, category_id");
  if (error || !words) {
    console.error("Error fetching all words after login:", error);
    return [];
  }
  await setCache("medicalTermsWithCategoriesCache", words);
  // Optionally clear the limited cache
  await removeCache("bodyOrgansWordsCache");
  return words;
}

// --- IndexedDB setup ---
const DB_NAME = "AppDB";
const STORE_NAME = "cacheStore";
const LANGUAGE_PREFERENCE_KEY = "ru";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});


export async function setLanguagePreference(lang: string) {
  await setCache(LANGUAGE_PREFERENCE_KEY, lang);
}

export async function getLanguagePreference(): Promise<string | null> {
  return await getCache(LANGUAGE_PREFERENCE_KEY);
}


async function setCache(key: string, value: any) {
  const db = await dbPromise;
  await db.put(STORE_NAME, value, key);
}

async function getCache(key: string) {
  const db = await dbPromise;
  return await db.get(STORE_NAME, key);
}

async function removeCache(key: string) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, key);
}

// --- Medical Terms Caching ---
let medicalTermsCache: any[] | null = null;



// --- Categories Caching ---
let categoriesCache: any[] | null = null;

export async function getCategories(): Promise<any[]> {
  if (categoriesCache) return categoriesCache;

  const cached = await getCache("categoriesCache");
  if (cached) {
    categoriesCache = cached;
    return cached;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_he, name_ru");

  if (error || !data) {
    console.error("Supabase error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }

  categoriesCache = data;
  await setCache("categoriesCache", data);
  return data;
}

export async function clearCategoriesCache() {
  categoriesCache = null;
  await removeCache("categoriesCache");
}

// --- Medical Terms with Categories ---
let medicalTermsWithCategoriesCache: any[] | null = null;


async function getRemoteVersion(key: string): Promise<string | null> {
	const { data, error } = await supabase
		.from("metadata")
		.select("value")
		.eq("key", key)
		.single();

	if (error || !data?.value) {
		console.error("Error fetching metadata:", error);
		return null;
	}

	return data.value;
}

export async function getMedicalTermsWithCategories(): Promise<any[]> {
  // If no cache or version mismatch, fetch fresh
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
  medicalTermsWithCategoriesCache = null;
  await removeCache("medicalTermsWithCategoriesCache");
}

// --- Energy Categories Caching ---
let energyCategoriesCache: any[] | null = null;

export async function getEnergyCategories(): Promise<any[]> {
  if (energyCategoriesCache) return energyCategoriesCache;

  const cached = await getCache("energyCategoriesCache");
  if (cached) {
    energyCategoriesCache = cached;
    return cached;
  }

  const { data, error } = await supabase
    .from("energy_category")
    .select("*")
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Supabase error fetching energy_category:", error);
    throw new Error("Failed to fetch energy categories");
  }

  energyCategoriesCache = data;
  await setCache("energyCategoriesCache", data);
  return data;
}
