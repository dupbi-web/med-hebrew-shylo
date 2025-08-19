import { supabase } from "@/integrations/supabase/client";
import { openDB } from 'idb';

// --- IndexedDB setup ---
const DB_NAME = 'AppDB';
const STORE_NAME = 'cacheStore';

const dbPromise = openDB(DB_NAME, 1, {
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
