// Dictionary.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useMedicalTerms, MedicalTerm } from "@/hooks/queries/useMedicalTerms";
import { useCategories, Category } from "@/hooks/queries/useCategories";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common";

const Dictionary = () => {
  const { t, i18n } = useTranslation();
  const { data: allWords = [], isLoading: wordsLoading } = useMedicalTerms();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();

  const [baseWords, setBaseWords] = useState<MedicalTerm[]>([]);
  const [filteredWords, setFilteredWords] = useState<MedicalTerm[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loading = wordsLoading || categoriesLoading;

  useEffect(() => {
    if (!allWords.length || !allCategories.length) return;

    // Remove category "Фразы для пациентов" (id=5)
    const filteredCategories = allCategories.filter(cat => cat.name_ru !== "Фразы для пациентов");

    // Remove words from category_id 5 and assign flattened category
    const mappedWords = allWords
      .filter(word => word.category_id !== 5)
      .map(word => ({
        ...word,
        category: filteredCategories.find(c => c.id === word.category_id) ?? null,
      }));

    setBaseWords(mappedWords);
    setFilteredWords(mappedWords);
  }, [allWords, allCategories]);

  useEffect(() => {
    if (!baseWords.length) return;

    let filtered = [...baseWords];

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(w => w.category_id === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["he", "en", "rus"],
        threshold: 0.3,
        ignoreLocation: true,
      });
      filtered = fuse.search(searchQuery.trim()).map(r => r.item);
    }

    setFilteredWords(filtered);
  }, [selectedCategory, searchQuery, baseWords]);

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
      <PageContainer maxWidth="6xl" className="py-10">
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

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <Input
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[200px]"
          />
          <select
            value={selectedCategory ?? ""}
            onChange={(e) =>
              setSelectedCategory(e.target.value ? Number(e.target.value) : null)
            }
            className="px-3 py-2 border rounded-md bg-background focus:outline-none"
          >
            <option value="">{t("all_categories")}</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground mt-10">{t("loading")}</p>
        ) : filteredWords.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">{t("no_words")}</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map(word => (
              <motion.div
                key={word.id}
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
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </section>
        )}
      </PageContainer>
    </>
  );
};

export default Dictionary;
