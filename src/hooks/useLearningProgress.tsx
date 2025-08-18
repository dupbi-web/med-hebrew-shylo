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

//   const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
//     if (!user) return new Set();
    
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('user_mastered_words')
//         .select('word_key')
//         .eq('user_id', user.id);

//       if (error) throw error;

//       const wordKeys = new Set(data.map(item => item.word_key));
//       setMasteredWords(wordKeys);
//       return wordKeys;
//     } catch (error: any) {
//       console.error('Error loading mastered words:', error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to load your progress.",
//       });
//       return new Set();
//     } finally {
//       setLoading(false);
//     }
//   }, [user, toast]);

//   const addMasteredWord = useCallback(async (category: string, word_en: string) => {
//     if (!user) return;

//     const wordKey = createWordKey(category, word_en);
    
//     try {
//       const { error } = await supabase
//         .from('user_mastered_words')
//         .insert({
//           user_id: user.id,
//           word_key: wordKey,
//         });

//       if (error) throw error;
      
//       setMasteredWords(prev => new Set([...prev, wordKey]));
//     } catch (error: any) {
//       console.error('Error adding mastered word:', error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to save your progress.",
//       });
//     }
//   }, [user, toast]);

//   const removeMasteredWord = useCallback(async (category: string, word_en: string) => {
//     if (!user) return;

//     const wordKey = createWordKey(category, word_en);
    
//     try {
//       const { error } = await supabase
//         .from('user_mastered_words')
//         .delete()
//         .eq('user_id', user.id)
//         .eq('word_key', wordKey);

//       if (error) throw error;
      
//       setMasteredWords(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(wordKey);
//         return newSet;
//       });
//     } catch (error: any) {
//       console.error('Error removing mastered word:', error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to update your progress.",
//       });
//     }
//   }, [user, toast]);

//   const isWordMastered = useCallback((category: string, word_en: string): boolean => {
//     const wordKey = createWordKey(category, word_en);
//     return masteredWords.has(wordKey);
//   }, [masteredWords]);

//   const resetProgress = useCallback(async () => {
//     if (!user) return;

//     try {
//       const { error } = await supabase
//         .from('user_mastered_words')
//         .delete()
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setMasteredWords(new Set());
      
//       toast({
//         title: "Progress Reset",
//         description: "Your learning progress has been reset.",
//       });
//     } catch (error: any) {
//       console.error('Error resetting progress:', error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to reset progress.",
//       });
//     }
//   }, [user, toast]);

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
//     resetProgress,
//     getMasteredWordsCount,
//     masteredWords,
//     loading
//   };
// };
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Constants
const CACHE_KEY = "masteredWordsCache";
const CACHE_EXPIRY_MS = 1000 * 60 * 10; // 10 minutes

export const useLearningProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

  const createWordKey = (category: string, word_en: string) => {
    return `${category}_${word_en}`;
  };

  // Load from localStorage
  const loadFromCache = (): Set<string> | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
        // Cache expired
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return new Set(data);
    } catch {
      return null;
    }
  };

  // Save to localStorage
  const saveToCache = (wordSet: Set<string>) => {
    const payload = {
      data: Array.from(wordSet),
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  // Load mastered words (with cache fallback)
  const loadMasteredWords = useCallback(async (): Promise<Set<string>> => {
    if (!user) return new Set();

    const cached = loadFromCache();
    if (cached) {
      setMasteredWords(cached);
      return cached;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_mastered_words")
        .select("word_key")
        .eq("user_id", user.id);

      if (error) throw error;

      const wordKeys = new Set(data.map((item) => item.word_key));
      setMasteredWords(wordKeys);
      saveToCache(wordKeys);

      return wordKeys;
    } catch (error: any) {
      console.error("Error loading mastered words:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your progress.",
      });
      return new Set();
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);

    try {
      const { error } = await supabase
        .from("user_mastered_words")
        .insert({ user_id: user.id, word_key: wordKey });

      if (error) throw error;

      setMasteredWords((prev) => {
        const updated = new Set(prev);
        updated.add(wordKey);
        saveToCache(updated);
        return updated;
      });
    } catch (error: any) {
      console.error("Error adding mastered word:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress.",
      });
    }
  }, [user, toast]);

  const removeMasteredWord = useCallback(async (category: string, word_en: string) => {
    if (!user) return;

    const wordKey = createWordKey(category, word_en);

    try {
      const { error } = await supabase
        .from("user_mastered_words")
        .delete()
        .eq("user_id", user.id)
        .eq("word_key", wordKey);

      if (error) throw error;

      setMasteredWords((prev) => {
        const updated = new Set(prev);
        updated.delete(wordKey);
        saveToCache(updated);
        return updated;
      });
    } catch (error: any) {
      console.error("Error removing mastered word:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your progress.",
      });
    }
  }, [user, toast]);

  const resetProgress = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_mastered_words")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      const emptySet = new Set<string>();
      setMasteredWords(emptySet);
      clearCache();

      toast({
        title: "Progress Reset",
        description: "Your learning progress has been reset.",
      });
    } catch (error: any) {
      console.error("Error resetting progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset progress.",
      });
    }
  }, [user, toast]);

  const isWordMastered = useCallback((category: string, word_en: string): boolean => {
    const wordKey = createWordKey(category, word_en);
    return masteredWords.has(wordKey);
  }, [masteredWords]);

  const getMasteredWordsCount = useCallback((category?: string): number => {
    if (!category) return masteredWords.size;
    return Array.from(masteredWords).filter((key) => key.startsWith(`${category}_`)).length;
  }, [masteredWords]);

  // Optional: auto-load on mount
  useEffect(() => {
    if (user) {
      loadMasteredWords();
    }
  }, [user, loadMasteredWords]);

  return {
    loadMasteredWords,
    addMasteredWord,
    removeMasteredWord,
    isWordMastered,
    resetProgress,
    getMasteredWordsCount,
    masteredWords,
    loading,
  };
};
