import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getMedicalTermsWithCategories, getCategories } from "@/cache/medicalTermsCache";
import { Star, StarOff } from "lucide-react";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";

type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_he: string;
  name_ru: string;
};

type Word = {
  en: string;
  he: string;
  rus: string;
  // category_id might be a number or array of numbers depending on your data shape
  category_id?: number | number[]; 
  category?: Category | null;
};

const Dictionary = () => {
  const { t, i18n } = useTranslation();
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    setLoading(true);

    const [allWords, allCategories] = await Promise.all([
      getMedicalTermsWithCategories(),
      getCategories(),
    ]);

    // Filter out the "Фразы для пациентов" category
    const filteredCategories = allCategories.filter(
      (cat) => cat.name_ru !== "Фразы для пациентов"
    );
    setCategories(filteredCategories);

    // Map words with their category object by matching category_id(s)
    const mappedWords = allWords.map((w: Word) => {
      // Handle if w.category_id is array or single number
      const wordCategoryIds = Array.isArray(w.category_id) ? w.category_id : [w.category_id];
      const matchedCategory =
        wordCategoryIds.length === 0 || wordCategoryIds[0] == null
          ? null
          : filteredCategories.find((c) => wordCategoryIds.includes(c.id)) ?? null;

      return {
        ...w,
        category: matchedCategory,
      };
    });

    // Sort words by category id (or put uncategorized at the end)
    const sortedWords = mappedWords.sort((a, b) => {
      const aId = a.category?.id ?? Number.MAX_SAFE_INTEGER;
      const bId = b.category?.id ?? Number.MAX_SAFE_INTEGER;
      return aId - bId;
    });

    setWords(sortedWords);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Filter words by category and search query
  useEffect(() => {
    if (!words.length) {
      setFilteredWords([]);
      return;
    }

    let filtered = [...words];

    if (selectedCategory) {
      filtered = filtered.filter(
        (w) => w.category?.id.toString() === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["he", "en", "rus"],
        threshold: 0.3,
        ignoreLocation: true,
        limit: Infinity,
      });
      filtered = fuse.search(searchQuery.trim()).map((r) => r.item);
    }

    setFilteredWords(filtered);
  }, [words, selectedCategory, searchQuery]);

  const toggleFavorite = (he: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(he)) newSet.delete(he);
      else newSet.add(he);
      return newSet;
    });
  };

  const exportFavorites = () => {
    const exportList = words.filter((w) => favorites.has(w.he));
    const blob = new Blob([JSON.stringify(exportList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (cat: Category | null) => {
    if (!cat) return "";
    switch (i18n.language) {
      case "he":
        return cat.name_he;
      case "ru":
        return cat.name_ru;
      default:
        return cat.name_en;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("dictionary_title")}</title>
        <meta name="description" content={t("dictionary_description")} />
      </Helmet>
      <main className="container mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("dictionary_title")}
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("dictionary_description")}
          </motion.p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <Input
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[200px]"
          />
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border rounded-md bg-background focus:outline-none"
          >
            <option value="">{t("all_categories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
          <Button onClick={exportFavorites} disabled={favorites.size === 0}>
            {t("export_favorites")}
          </Button>
        </div>

        {/* Word Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground mt-10">
            {t("loading")}
          </p>
        ) : filteredWords.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">
            {t("no_words")}
          </p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <motion.div
                key={word.he}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex justify-between items-start">
                    <div>
                      <CardTitle>{word.he}</CardTitle>
                      <CardDescription>
                        EN: {word.en} <br />
                        RU: {word.rus} <br />
                        {word.category && getCategoryLabel(word.category)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(word.he)}
                    >
                      {favorites.has(word.he) ? (
                        <Star className="text-yellow-400" />
                      ) : (
                        <StarOff />
                      )}
                    </Button>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default Dictionary;

