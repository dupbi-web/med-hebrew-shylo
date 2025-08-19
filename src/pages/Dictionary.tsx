import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getMedicalTerms } from "@/cache/medicalTermsCache"; // cache של מילים
import { getMedicalTermsWithCategories } from "@/cache/medicalTermsCache"; // cache של מילים עם קטגוריות
import { Star, StarOff } from "lucide-react";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";

type Word = {
  en: string;
  he: string;
  rus: string;
  category?: string | null;
};

const Dictionary = () => {
  const { t } = useTranslation();
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch words from cache
  const fetchWords = useCallback(async () => {
    setLoading(true);
    const allWords = await getMedicalTermsWithCategories();

    // Filter out the 5th category ("Фразы для пациентов")
    const filteredWordsRaw = allWords.filter(
      (w) => w.categories?.name_ru !== "Фразы для пациентов"
    );

    // Extract unique categories from joined data (excluding the 5th)
    const uniqueCategories = Array.from(
      new Set(
        filteredWordsRaw
          .map((w) => w.categories?.name_ru)
          .filter(Boolean)
      )
    ) as string[];

    setCategories(uniqueCategories);

    // Map words to include category name from joined categories
    const mappedWords = filteredWordsRaw.map((w) => ({
      en: w.en,
      he: w.he,
      rus: w.rus,
      category: w.categories?.name_ru ?? null,
    }));

    // Sort words by category order
    const sortedWords = mappedWords.sort((a, b) => {
      const indexA = a.category ? uniqueCategories.indexOf(a.category) : -1;
      const indexB = b.category ? uniqueCategories.indexOf(b.category) : -1;
      return indexA - indexB;
    });

    setWords(sortedWords);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Filter words by category and search
  useEffect(() => {
    if (!words.length) return; // wait until words are loaded

    let filtered = [...words];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }

    // Search with Fuse.js
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["he", "en", "rus"],
        threshold: 0.3,
        ignoreLocation: true,
        useExtendedSearch: false,
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
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button onClick={exportFavorites} disabled={favorites.size === 0}>
            {t("export_favorites")} ({favorites.size})
          </Button>
        </div>

        {/* Word Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground mt-10">{t("loading")}</p>
        ) : filteredWords.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">{t("no_words")}</p>
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
                        RU: {word.rus}
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
