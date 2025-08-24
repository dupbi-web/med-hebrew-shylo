import { supabase } from "@/integrations/supabase/client";
import { openDB } from "idb";

// --- IndexedDB setup ---
const DB_NAME = "AppDB";
const STORE_NAME = "cacheStore";

const dbPromise = openDB(DB_NAME, 2, {
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

// --- Medical Terms Caching ---
let medicalTermsCache: any[] | null = null;

export async function getMedicalTerms(): Promise<any[]> {
  if (medicalTermsCache) return medicalTermsCache;

  const cached = await getCache("medicalTermsCache");
  if (cached) {
    medicalTermsCache = cached;
    return cached;
  }

  const { data, error } = await supabase.from("medical_terms").select("*");

  if (error || !data) {
    console.error("Supabase error fetching medical_terms:", error);
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

export async function getMedicalTermsWithCategories(): Promise<any[]> {
  if (medicalTermsWithCategoriesCache) return medicalTermsWithCategoriesCache;

  const cached = await getCache("medicalTermsWithCategoriesCache");
  if (cached) {
    medicalTermsWithCategoriesCache = cached;
    return cached;
  }

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
    console.error("Supabase error fetching words with categories:", error);
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
