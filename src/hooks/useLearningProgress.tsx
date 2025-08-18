// import { useState, useCallback } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";

// export const useLearningProgress = () => {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

//   const createWordKey = (category: string, word_en: string) => {
//     return `${category}_${word_en}`;
//   };
// const LOCAL_STORAGE_KEY = `masteredWords_${user?.id || "guest"}`;

// const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
//   let localKeys: Set<string> = new Set();

//   // Load from localStorage
//   const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
//   if (cached) {
//     try {
//       const parsed = JSON.parse(cached);
//       if (Array.isArray(parsed)) {
//         localKeys = new Set(parsed);
//         setMasteredWords(localKeys);
//         return localKeys;
//       }
//     } catch (e) {
//       console.warn("Failed to parse masteredWords from localStorage");
//     }
//   }

//   // Optionally fetch from Supabase as fallback
//   if (!user) return new Set();

//   setLoading(true);
//   try {
//     const { data, error } = await supabase
//       .from("user_mastered_words")
//       .select("word_key")
//       .eq("user_id", user.id);

//     if (error) throw error;

//     const dbKeys = new Set(data.map(item => item.word_key));
//     setMasteredWords(dbKeys);
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(dbKeys)));

//     return dbKeys;
//   } catch (error) {
//     console.error("Failed to load from DB", error);
//     toast({
//       variant: "destructive",
//       title: "Error",
//       description: "Could not sync your learning progress.",
//     });
//     return new Set();
//   } finally {
//     setLoading(false);
//   }
// }, [user, toast]);

//   // const addMasteredWord = useCallback(async (category: string, word_en: string) => {
//   //   if (!user) return;

//   //   const wordKey = createWordKey(category, word_en);
    
//   //   try {
//   //     const { error } = await supabase
//   //       .from('user_mastered_words')
//   //       .insert({
//   //         user_id: user.id,
//   //         word_key: wordKey,
//   //       });

//   //     if (error) throw error;
      
//   //     setMasteredWords(prev => new Set([...prev, wordKey]));
//   //   } catch (error: any) {
//   //     console.error('Error adding mastered word:', error);
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Error",
//   //       description: "Failed to save your progress.",
//   //     });
//   //   }
//   // }, [user, toast]);

//   const addMasteredWord = useCallback((category: string, word_en: string) => {
//   const wordKey = createWordKey(category, word_en);
//   setMasteredWords(prev => {
//     const updated = new Set([...prev, wordKey]);
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(updated)));
//     return updated;
//   });
// }, []);

//   // const removeMasteredWord = useCallback(async (category: string, word_en: string) => {
//   //   if (!user) return;

//   //   const wordKey = createWordKey(category, word_en);
    
//   //   try {
//   //     const { error } = await supabase
//   //       .from('user_mastered_words')
//   //       .delete()
//   //       .eq('user_id', user.id)
//   //       .eq('word_key', wordKey);

//   //     if (error) throw error;
      
//   //     setMasteredWords(prev => {
//   //       const newSet = new Set(prev);
//   //       newSet.delete(wordKey);
//   //       return newSet;
//   //     });
//   //   } catch (error: any) {
//   //     console.error('Error removing mastered word:', error);
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Error",
//   //       description: "Failed to update your progress.",
//   //     });
//   //   }
//   // }, [user, toast]);
// const removeMasteredWord = useCallback((category: string, word_en: string) => {
//   const wordKey = createWordKey(category, word_en);
//   setMasteredWords(prev => {
//     const updated = new Set(prev);
//     updated.delete(wordKey);
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(updated)));
//     return updated;
//   });
// }, []);
//   const isWordMastered = useCallback((category: string, word_en: string): boolean => {
//     const wordKey = createWordKey(category, word_en);
//     return masteredWords.has(wordKey);
//   }, [masteredWords]);

//   // const resetProgress = useCallback(async () => {
//   //   if (!user) return;

//   //   try {
//   //     const { error } = await supabase
//   //       .from('user_mastered_words')
//   //       .delete()
//   //       .eq('user_id', user.id);

//   //     if (error) throw error;

//   //     setMasteredWords(new Set());
      
//   //     toast({
//   //       title: "Progress Reset",
//   //       description: "Your learning progress has been reset.",
//   //     });
//   //   } catch (error: any) {
//   //     console.error('Error resetting progress:', error);
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Error",
//   //       description: "Failed to reset progress.",
//   //     });
//   //   }
//   // }, [user, toast]);

//   const syncProgressToDB = useCallback(async () => {
//   if (!user) return;

//   const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
//   if (!cached) return;

//   const wordKeys: string[] = JSON.parse(cached);

//   if (wordKeys.length === 0) return;

//   const inserts = wordKeys.map(word_key => ({
//     user_id: user.id,
//     word_key
//   }));

//   try {
//     const { error } = await supabase
//       .from("user_mastered_words")
//       .upsert(inserts, { onConflict: "user_id,word_key" });

//     if (error) throw error;

//     toast({
//       title: "Progress Synced",
//       description: "Your learning progress has been saved to the cloud.",
//     });
//   } catch (error) {
//     console.error("Failed to sync progress to DB", error);
//     toast({
//       variant: "destructive",
//       title: "Error",
//       description: "Could not sync your progress to the server.",
//     });
//   }
// }, [user, toast]);


//   const getMasteredWordsCount = useCallback((category?: string): number => {
//     if (!category) return masteredWords.size;
    
//     const categoryMastered = Array.from(masteredWords).filter(wordKey => 
//       wordKey.startsWith(`${category}_`)
//     );
//     return categoryMastered.length;
//   }, [masteredWords]);

//   return {
//     loadMasteredWords,
//     addMasteredWord,
//     removeMasteredWord,
//     isWordMastered,
//     // resetProgress,
//     getMasteredWordsCount,
//     masteredWords,
//     loading,
//     syncProgressToDB
//   };
// };

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useLearningProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

  const LOCAL_STORAGE_KEY = `masteredWords_${user?.id || "guest"}`;

  const createWordKey = (category: string, word_en: string) => {
    return `${category}_${word_en}`;
  };

  const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
    let localKeys: Set<string> = new Set();

    // Load from localStorage
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          localKeys = new Set(parsed);
          setMasteredWords(localKeys);
          return localKeys;
        }
      } catch (e) {
        console.warn("Failed to parse masteredWords from localStorage");
      }
    }

    // Fallback: Load from Supabase if no local data
    if (!user) return new Set();

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_mastered_words")
        .select("word_key")
        .eq("user_id", user.id);

      if (error) throw error;

      const dbKeys = new Set(data.map(item => item.word_key));
      setMasteredWords(dbKeys);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(dbKeys)));
      return dbKeys;
    } catch (error) {
      console.error("Error loading mastered words from DB:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your progress from the server.",
      });
      return new Set();
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addMasteredWord = useCallback((category: string, word_en: string) => {
    const wordKey = createWordKey(category, word_en);
    setMasteredWords(prev => {
      const updated = new Set([...prev, wordKey]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const removeMasteredWord = useCallback((category: string, word_en: string) => {
    const wordKey = createWordKey(category, word_en);
    setMasteredWords(prev => {
      const updated = new Set(prev);
      updated.delete(wordKey);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const isWordMastered = useCallback((category: string, word_en: string): boolean => {
    const wordKey = createWordKey(category, word_en);
    return masteredWords.has(wordKey);
  }, [masteredWords]);

  const getMasteredWordsCount = useCallback((category?: string): number => {
    if (!category) return masteredWords.size;

    return Array.from(masteredWords).filter(wordKey =>
      wordKey.startsWith(`${category}_`)
    ).length;
  }, [masteredWords]);

  const syncProgressToDB = useCallback(async () => {
    if (!user) return;

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) return;

    const wordKeys: string[] = JSON.parse(cached);
    if (wordKeys.length === 0) return;

    const inserts = wordKeys.map(word_key => ({
      user_id: user.id,
      word_key,
    }));

    try {
      const { error } = await supabase
        .from("user_mastered_words")
        .upsert(inserts, { onConflict: "user_id,word_key" });

      if (error) throw error;

      toast({
        title: "Progress Synced",
        description: "Your learning progress has been saved to the cloud.",
      });
    } catch (error) {
      console.error("Failed to sync progress to DB", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not sync your progress to the server.",
      });
    }
  }, [user, toast]);

  return {
    loadMasteredWords,
    addMasteredWord,
    removeMasteredWord,
    isWordMastered,
    getMasteredWordsCount,
    masteredWords,
    loading,
    syncProgressToDB, // ✅ Expose the sync function
  };
};

