import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
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

function getRandomDistractors(words: Word[], correct: Word, lang: Lang, count: number) {
  const filtered = words.filter((w) => w[lang] !== correct[lang]);
  return shuffleCopy(filtered).slice(0, count);
}

const Quiz = () => {
  const { user } = useAuthContext();
  const { t, i18n } = useTranslation();

  // ➜ FREE users get only the "body organs" category
  // ➜ Logged users get everything
  const {
    data: allMedicalTerms = [],
    isLoading: wordsLoading
  } = user ? useMedicalTerms() : useFreeMedicalTerms();

  const {
    data: allCategories = [],
    isLoading: categoriesLoading
  } = useCategories();

  const normalizeLang = (lang: string): Lang => {
    if (lang.startsWith("ru") || lang === "rus") return "rus";
    return "en";
  };
  const targetLang = normalizeLang(i18n.language);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);

  // Load categories + filter words
  useEffect(() => {
    if (!allMedicalTerms.length) return;

    setCategories(allCategories);

    let filtered = allMedicalTerms;

    if (selectedCategory) {
      filtered = allMedicalTerms.filter((w) => {
        const ids = Array.isArray(w.category_id)
          ? w.category_id
          : [w.category_id];
        return ids.includes(Number(selectedCategory));
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
        category_slug: w.category?.slug || null
      }));

    setWords(shuffleCopy(cleaned));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
  }, [allMedicalTerms, allCategories, selectedCategory, targetLang]);

  const current = words[currentIndex];
  const isDone = currentIndex >= words.length;

  // Recompute options
  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }
    const distractors = getRandomDistractors(words, current, targetLang, 3);
    setOptions(
      shuffleCopy([current[targetLang], ...distractors.map((w) => w[targetLang])])
    );
  }, [current, targetLang, words]);

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

  const getCategoryLabel = (cat: Category) => {
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

  const FREE_CATEGORY_NAME = "body organs";

  const UpsellBanner = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-4">
      <span>{t("Unlock all categories and words!")}</span>
      <Button className="ml-4" onClick={() => (window.location.href = "/auth")}>
        {t("Sign in to unlock")}
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Quiz</title>
      </Helmet>

      <main className="container mx-auto max-w-6xl">
        <section className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
          {(wordsLoading || categoriesLoading) && (
            <LoadingState message="Loading quiz..." />
          )}

          {isDone ? (
            <CompletionScreen
              emoji="🏁"
              title="Quiz Complete!"
              description={
                <>
                  You scored <b>{score}</b> out of <b>{words.length}</b>
                </>
              }
              onAction={restartQuiz}
              actionLabel="Restart Quiz"
            />
          ) : current ? (
            <div className="max-w-2xl mx-auto">
              {/* Category Selector */}
              <div className="mb-8">
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    const freeCat = categories.find(
                      (c) => c.name_en.toLowerCase() === FREE_CATEGORY_NAME
                    );

                    if (!user && val !== String(freeCat?.id)) {
                      setShowUpsell(true);
                      setSelectedCategory(String(freeCat?.id));
                      return;
                    }

                    setShowUpsell(false);
                    setSelectedCategory(val);
                  }}
                  className="px-4 py-3 border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      disabled={
                        !user &&
                        cat.name_en.toLowerCase() !== FREE_CATEGORY_NAME
                      }
                    >
                      {getCategoryLabel(cat)}
                      {!user &&
                      cat.name_en.toLowerCase() !== FREE_CATEGORY_NAME
                        ? " 🔒"
                        : ""}
                    </option>
                  ))}
                </select>

                {showUpsell && <UpsellBanner />}
              </div>

              {/* Question */}
              <div className="mb-6 p-6 border rounded-lg bg-card">
                <h3 className="text-4xl font-bold text-primary" dir="rtl">
                  {current.he}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, index) => {
                  const isCorrect = opt === current[targetLang];
                  const isSelected = opt === selected;
                  const letter = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className={`
                        p-4 border rounded-lg text-left
                        ${
                          selected
                            ? isCorrect
                              ? "bg-green-100 border-green-500"
                              : isSelected
                              ? "bg-red-100 border-red-500"
                              : "opacity-50"
                            : "hover:bg-accent"
                        }
                      `}
                      disabled={!!selected}
                    >
                      <b>{letter}.</b> {opt}
                    </button>
                  );
                })}
              </div>

              {/* Counter */}
              <p className="text-center mt-8 text-muted-foreground">
                {t("quiz_counter")} {currentIndex + 1} {t("of")} {words.length}
              </p>
            </div>
          ) : (
            <p className="text-center py-8">No words found.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default Quiz;
