import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useMedicalTerms, useFreeMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { useCategories } from "@/hooks/queries/useCategories";
import { useTranslation } from "react-i18next";
import { LoadingState, CompletionScreen } from "@/components/common";

type Word = {
  id: number;
  en: string;
  he: string;
  rus: string;
  category_id: number | null;
  category_slug?: string | null;
};

type Lang = "en" | "rus";

type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_he: string;
  name_ru: string;
};

function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Quiz = () => {
  const { t, i18n } = useTranslation();

  // FREE DATA ONLY — public visitors
  const { data: allMedicalTerms = [], isLoading: wordsLoading } = useFreeMedicalTerms();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();

  const normalizeLang = (lang: string): Lang => {
    if (lang.startsWith("ru") || lang === "rus") return "rus";
    return "en";
  };

  const targetLang = normalizeLang(i18n.language);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);

  const categories = useMemo(() => allCategories, [allCategories]);

  const getRandomDistractors = useCallback(
    (words: Word[], correct: Word, lang: Lang, count: number) => {
      const filtered = words.filter((w) => w[lang] !== correct[lang]);
      return shuffleCopy(filtered).slice(0, count);
    },
    []
  );

  // Filter + set words
  useEffect(() => {
    if (!allMedicalTerms.length) return;

    let filtered = allMedicalTerms;

    if (selectedCategory) {
      filtered = allMedicalTerms.filter((w) => {
        const categoryIds = Array.isArray(w.category_id) ? w.category_id : [w.category_id];
        return categoryIds.includes(Number(selectedCategory));
      });
    }

    const cleaned = filtered
      .filter((w) => w.he && w[targetLang])
      .map((w) => ({
        id: w.id,
        en: w.en,
        he: w.he,
        rus: w.rus,
        category_id: w.category_id,
        category_slug: w.category?.slug || null,
      }));

    setWords(shuffleCopy(cleaned));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
  }, [allMedicalTerms, selectedCategory, targetLang]);

  const current = useMemo(() => words[currentIndex], [words, currentIndex]);

  useEffect(() => {
    if (!current || words.length === 0) {
      setOptions([]);
      return;
    }
    const distractors = getRandomDistractors(words, current, targetLang, 3);
    const opts = shuffleCopy([current[targetLang], ...distractors.map((w) => w[targetLang])]);
    setOptions(opts);
  }, [current, targetLang, getRandomDistractors]);

  const isDone = currentIndex >= words.length;

  const handleSelect = (choice: string) => {
    if (selected || !current) return;
    setSelected(choice);

    if (choice === current[targetLang]) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      setSelected(null);
      setCurrentIndex((i) => i + 1);
    }, 1000);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setOptions([]);
  };

  // CATEGORY NAME
  const getCategoryLabel = (cat: Category) => {
    if (!cat) return "";
    switch (i18n.language) {
      case "he":
        return cat.name_he;
      case "ru":
      case "rus":
        return cat.name_ru;
      default:
        return cat.name_en;
    }
  };

  // UPSALE BANNER (unchanged)
  const UpsellBanner = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-4 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200">
      <span>{t("Unlock all categories and words!")}</span>
      <Button className="ml-4" onClick={() => (window.location.href = "/auth")}>
        {t("Sign in to unlock")}
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Quiz | Med-Ivrit</title>
        <meta
          name="description"
          content="Test your knowledge of medical Hebrew with multiple choice questions."
        />
      </Helmet>

      <main className="container mx-auto max-w-6xl">
        <section className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
          {wordsLoading || categoriesLoading ? (
            <LoadingState message="Loading quiz questions..." />
          ) : isDone ? (
            <CompletionScreen
              emoji="🏁"
              title="Quiz Complete!"
              description={
                <>
                  You scored{" "}
                  <span className="font-semibold text-foreground">{score}</span> out of{" "}
                  <span className="font-semibold text-foreground">{words.length}</span> correct
                </>
              }
              onAction={restartQuiz}
              actionLabel="Restart Quiz"
              className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-lg"
            />
          ) : current ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label htmlFor="category-select" className="sr-only">
                    {t("select_category")}
                  </label>

                  {/* CATEGORY SELECT: ALWAYS PUBLIC, ALWAYS SHOW LOCKS */}
                  <select
                    id="category-select"
                    value={selectedCategory ?? ""}
                    onChange={(e) => {
                      const val = e.target.value || null;

                      // Find "Body organs" (free)
                      const freeCategory = categories.find(
                        (cat) => cat.name_en.toLowerCase() === "body organs"
                      );

                      // Anyone selecting locked category → show upsell
                      if (val && val !== String(freeCategory?.id)) {
                        setShowUpsell(true);
                        return;
                      }

                      setShowUpsell(false);
                      setSelectedCategory(val);
                    }}
                    className="px-4 py-3 bg-background border border-input rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all max-w-xs"
                    aria-describedby="category-help"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {getCategoryLabel(cat)}
                        {cat.name_en.toLowerCase() !== "body organs" ? " 🔒" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {showUpsell && <UpsellBanner />}

                <div
                  className="bg-card/50 border border-border rounded-lg p-6 md:p-8 mb-6"
                  role="region"
                >
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary" dir="rtl">
                    {current.he}
                  </h3>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
                {options.map((opt, index) => {
                  const isCorrect = opt === current[targetLang];
                  const isSelected = opt === selected;
                  const optionLetter = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={`${opt}-${index}`}
                      className={`group relative p-4 md:p-5 border-2 rounded-lg transition-all duration-200 text-left min-h-[60px] md:min-h-[80px] ${
                        selected
                          ? isCorrect
                            ? "bg-green-50 border-green-500 text-green-900 dark:bg-green-950 dark:text-green-100"
                            : isSelected
                            ? "bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:text-red-100"
                            : "opacity-50 bg-muted border-muted-foreground/20"
                          : "bg-card border-border hover:bg-accent hover:border-accent-foreground/20 active:scale-[0.98]"
                      }`}
                      onClick={() => handleSelect(opt)}
                      disabled={!!selected}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            selected
                              ? isCorrect
                                ? "bg-green-500 border-green-500 text-white"
                                : isSelected
                                ? "bg-red-500 border-red-500 text-white"
                                : "border-muted-foreground/40 text-muted-foreground"
                              : "border-muted-foreground/40 text-muted-foreground group-hover:border-accent-foreground/60 group-hover:text-accent-foreground"
                          }`}
                        >
                          {selected && isCorrect
                            ? "✓"
                            : selected && isSelected
                            ? "✗"
                            : optionLetter}
                        </span>
                        <span className="flex-1 break-words leading-relaxed">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("quiz_counter")} <span className="font-medium">{currentIndex + 1}</span>{" "}
                  {t("of")} <span className="font-medium">{words.length}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {words.length === 0 ? (
                <div className="max-w-md mx-auto">
                  <p className="text-muted-foreground">
                    {t("No words found for this category. Try another one or show all.")}
                  </p>
                  <div className="mt-4">
                    <Button onClick={() => setSelectedCategory(null)}>
                      {t("Show all categories")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading quiz questions...</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Quiz;
