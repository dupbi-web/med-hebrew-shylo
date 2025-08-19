// indexedDB.ts
import { openDB } from 'idb';

const DB_NAME = 'AppDB';
const STORE_NAME = 'cacheStore';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function setCache(key: string, value: any) {
  const db = await dbPromise;
  await db.put(STORE_NAME, value, key);
}

export async function getCache(key: string) {
  const db = await dbPromise;
  return await db.get(STORE_NAME, key);
}

export async function removeCache(key: string) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, key);
}
