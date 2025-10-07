import { supabase } from "@/integrations/supabase/client";
import { openDB } from "idb";

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
	const cachedData = await getCache("medicalTermsWithCategoriesCache");
	const cachedVersion = await getCache("medicalTermsWithCategoriesVersion");

	const serverVersion = await getRemoteVersion("words_v");

	if (cachedData && cachedVersion === serverVersion) {
		return cachedData;
	}

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

	// Save fresh data and version
	await setCache("medicalTermsWithCategoriesCache", data);
	await setCache("medicalTermsWithCategoriesVersion", serverVersion);

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

export async function clearEnergyCategoriesCache() {
  energyCategoriesCache = null;
  await removeCache("energyCategoriesCache");
}

// --- Medical Sentences Caching ---
let medicalSentencesCache: { [categoryId: string]: any[] } = {};

export async function getMedicalSentencesByCategory(categoryId: number): Promise<any[]> {
  const cacheKey = `sentences_${categoryId}`;
  
  if (medicalSentencesCache[cacheKey]) return medicalSentencesCache[cacheKey];

  const cached = await getCache(cacheKey);
  if (cached) {
    medicalSentencesCache[cacheKey] = cached;
    return cached;
  }

  const { data, error } = await supabase
    .from("sentences_for_doctors")
    .select("*")
    .eq("energy_category_id", categoryId)
    .order("id", { ascending: true });

  if (error || !data) {
    console.error("Supabase error fetching sentences_for_doctors:", error);
    throw new Error("Failed to fetch medical sentences");
  }

  medicalSentencesCache[cacheKey] = data;
  await setCache(cacheKey, data);
  return data;
}

export async function clearMedicalSentencesCache() {
  medicalSentencesCache = {};
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  // Clear all sentence cache keys
  const allKeys = await store.getAllKeys();
  for (const key of allKeys) {
    if (typeof key === 'string' && key.startsWith('sentences_')) {
      await store.delete(key);
    }
  }
  await tx.done;
}

// --- User Mastered Words Caching ---
let userMasteredWordsCache: Set<string> | null = null;

export async function getUserMasteredWords(userId: string): Promise<Set<string>> {
  if (userMasteredWordsCache) return userMasteredWordsCache;

  const cached = await getCache(`userMasteredWords_${userId}`);
  if (cached) {
    userMasteredWordsCache = new Set(cached);
    return userMasteredWordsCache;
  }

  const { data, error } = await supabase
    .from("user_mastered_words")
    .select("word_key")
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase error fetching user_mastered_words:", error);
    throw new Error("Failed to fetch mastered words");
  }

  const wordKeys = (data || []).map((item: any) => item.word_key);
  userMasteredWordsCache = new Set(wordKeys);
  await setCache(`userMasteredWords_${userId}`, wordKeys);
  return userMasteredWordsCache;
}

export async function addUserMasteredWord(userId: string, wordKey: string): Promise<void> {
  // Update cache
  if (userMasteredWordsCache) {
    userMasteredWordsCache.add(wordKey);
    await setCache(`userMasteredWords_${userId}`, Array.from(userMasteredWordsCache));
  }

  // Update database
  const { error } = await supabase
    .from("user_mastered_words")
    .insert([{ user_id: userId, word_key: wordKey }]);

  if (error) {
    console.error("Error adding mastered word:", error);
    throw new Error("Failed to add mastered word");
  }
}

export async function removeUserMasteredWord(userId: string, wordKey: string): Promise<void> {
  // Update cache
  if (userMasteredWordsCache) {
    userMasteredWordsCache.delete(wordKey);
    await setCache(`userMasteredWords_${userId}`, Array.from(userMasteredWordsCache));
  }

  // Update database
  const { error } = await supabase
    .from("user_mastered_words")
    .delete()
    .eq("user_id", userId)
    .eq("word_key", wordKey);

  if (error) {
    console.error("Error removing mastered word:", error);
    throw new Error("Failed to remove mastered word");
  }
}

export async function clearUserMasteredWordsCache(userId: string) {
  userMasteredWordsCache = null;
  await removeCache(`userMasteredWords_${userId}`);
}
