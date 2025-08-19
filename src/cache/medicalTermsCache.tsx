import { supabase } from "@/integrations/supabase/client";
import { openDB } from 'idb';

// --- IndexedDB setup ---
const DB_NAME = 'AppDB';
const STORE_NAME = 'cacheStore';

const dbPromise = openDB(DB_NAME, 2, { // <-- bump version to 2
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

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

// --- Medical Terms Caching Logic ---
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

// --- Added: medical terms cache with join to categories ---
let medicalTermsWithCategoriesCache: any[] | null = null;

export async function getMedicalTermsWithCategories(): Promise<any[]> {
  if (medicalTermsWithCategoriesCache) {
    return medicalTermsWithCategoriesCache;
  }

  // Check IndexedDB first
  const cached = await getCache("medicalTermsWithCategoriesCache");
  if (cached) {
    medicalTermsWithCategoriesCache = cached;
    return medicalTermsWithCategoriesCache;
  }

  // Fetch from Supabase (join with categories)
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
    console.error("Supabase error:", error);
    console.error("Supabase data:", data);
    throw new Error("Failed to fetch medical terms with categories");
  }

  medicalTermsWithCategoriesCache = data;
  await setCache("medicalTermsWithCategoriesCache", data);
  return data;
}

export async function clearMedicalTermsWithCategoriesCache() {
  medicalTermsWithCategoriesCache = null;
  await removeCache("medicalTermsWithCategoriesCache");
}